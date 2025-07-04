import InterviewBooking from "../models/InterviewBooking.js";
import Interviewer from "../models/Interviewer.js";
import InterviewFeedback from "../models/InterviewFeedback.js";
import { logger } from "../utils/logger.js";
import { sendMetric } from "../utils/cloudwatch.js";

// Get available interviewers for a topic and difficulty
export const getAvailableInterviewers = async (req, res) => {
  try {
    const { topic, difficulty, date } = req.query;
    
    if (!topic || !difficulty) {
      return res.status(400).json({
        success: false,
        message: "Topic and difficulty are required"
      });
    }

    // Find interviewers with expertise in the topic
    const interviewers = await Interviewer.find({
      status: "active",
      "expertise.topic": topic,
      "expertise.level": difficulty
    }).populate("user", "name email");

    // Filter by availability if date is provided
    let availableInterviewers = interviewers;
    if (date) {
      const requestedDate = new Date(date);
      availableInterviewers = interviewers.filter(interviewer => 
        interviewer.isAvailableForSlot(requestedDate)
      );
    }

    // Add pricing information
    const interviewersWithPricing = availableInterviewers.map(interviewer => ({
      _id: interviewer._id,
      user: interviewer.user,
      profile: interviewer.profile,
      stats: interviewer.stats,
      pricing: {
        amount: interviewer.getPriceForDifficulty(difficulty),
        currency: interviewer.pricing.currency
      },
      availability: interviewer.availability
    }));

    sendMetric('AvailableInterviewersFetched', interviewersWithPricing.length, 'Count', [
      { Name: 'Topic', Value: topic },
      { Name: 'Difficulty', Value: difficulty }
    ]);

    res.status(200).json({
      success: true,
      data: interviewersWithPricing
    });
  } catch (error) {
    logger.error("Error fetching available interviewers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available interviewers",
      error: error.message
    });
  }
};

// Create a new interview booking
export const createInterviewBooking = async (req, res) => {
  try {
    const {
      interviewerId,
      topic,
      difficulty,
      scheduledDate,
      duration = 60,
      specialRequirements,
      notes
    } = req.body;

    const userId = req.user._id;

    // Validate required fields
    if (!interviewerId || !topic || !difficulty || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: "Interviewer ID, topic, difficulty, and scheduled date are required"
      });
    }

    // Check if interviewer exists and is available
    const interviewer = await Interviewer.findById(interviewerId);
    if (!interviewer) {
      return res.status(404).json({
        success: false,
        message: "Interviewer not found"
      });
    }

    if (interviewer.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Interviewer is not available"
      });
    }

    // Check if the requested time slot is available
    const requestedDate = new Date(scheduledDate);
    if (!interviewer.isAvailableForSlot(requestedDate)) {
      return res.status(400).json({
        success: false,
        message: "Requested time slot is not available"
      });
    }

    // Check for scheduling conflicts
    const existingBooking = await InterviewBooking.findOne({
      interviewer: interviewerId,
      scheduledDate: {
        $gte: new Date(requestedDate.getTime() - duration * 60 * 1000),
        $lte: new Date(requestedDate.getTime() + duration * 60 * 1000)
      },
      status: { $in: ["pending", "confirmed"] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Time slot is already booked"
      });
    }

    // Calculate payment amount
    const amount = interviewer.getPriceForDifficulty(difficulty);

    // Create booking
    const booking = new InterviewBooking({
      user: userId,
      interviewer: interviewerId,
      topic,
      difficulty,
      scheduledDate: requestedDate,
      duration,
      payment: {
        amount,
        currency: interviewer.pricing.currency
      },
      specialRequirements,
      notes
    });

    await booking.save();

    // Populate booking with interviewer details
    const populatedBooking = await InterviewBooking.findById(booking._id)
      .populate("interviewer", "profile pricing")
      .populate("user", "name email");

    sendMetric('InterviewBookingCreated', 1, 'Count', [
      { Name: 'Topic', Value: topic },
      { Name: 'Difficulty', Value: difficulty }
    ]);

    res.status(201).json({
      success: true,
      message: "Interview booking created successfully",
      data: populatedBooking
    });
  } catch (error) {
    logger.error("Error creating interview booking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating interview booking",
      error: error.message
    });
  }
};

// Get user's interview bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const bookings = await InterviewBooking.find(query)
      .populate("interviewer", "profile stats")
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InterviewBooking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error("Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message
    });
  }
};

// Get booking details
export const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await InterviewBooking.findOne({
      _id: bookingId,
      user: userId
    }).populate([
      {
        path: "interviewer",
        select: "profile stats availability pricing"
      },
      {
        path: "user",
        select: "name email"
      }
    ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    logger.error("Error fetching booking details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking details",
      error: error.message
    });
  }
};

// Cancel interview booking
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const booking = await InterviewBooking.findOne({
      _id: bookingId,
      user: userId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled"
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed interview"
      });
    }

    // Check if cancellation is within allowed time (24 hours before)
    const now = new Date();
    const interviewTime = new Date(booking.scheduledDate);
    const hoursUntilInterview = (interviewTime - now) / (1000 * 60 * 60);

    if (hoursUntilInterview < 24) {
      return res.status(400).json({
        success: false,
        message: "Cancellation must be made at least 24 hours before the interview"
      });
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason;
    booking.cancelledBy = "user";
    booking.cancelledAt = now;

    await booking.save();

    sendMetric('InterviewBookingCancelled', 1, 'Count', [
      { Name: 'Topic', Value: booking.topic },
      { Name: 'Difficulty', Value: booking.difficulty }
    ]);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking
    });
  } catch (error) {
    logger.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message
    });
  }
};

// Update booking status (for interviewers)
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, meetingLink } = req.body;
    const interviewerId = req.user._id;

    const booking = await InterviewBooking.findOne({
      _id: bookingId,
      interviewer: interviewerId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    booking.status = status;
    if (meetingLink) {
      booking.meetingLink = meetingLink;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking
    });
  } catch (error) {
    logger.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking status",
      error: error.message
    });
  }
};

// Get upcoming interviews for interviewer
export const getInterviewerBookings = async (req, res) => {
  try {
    const interviewerId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { interviewer: interviewerId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const bookings = await InterviewBooking.find(query)
      .populate("user", "name email")
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InterviewBooking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error("Error fetching interviewer bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message
    });
  }
}; 