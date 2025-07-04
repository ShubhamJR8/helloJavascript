import InterviewFeedback from "../models/InterviewFeedback.js";
import InterviewBooking from "../models/InterviewBooking.js";
import Interviewer from "../models/Interviewer.js";
import { logger } from "../utils/logger.js";
import { sendMetric } from "../utils/cloudwatch.js";

// Submit interview feedback (for interviewers)
export const submitFeedback = async (req, res) => {
  try {
    const {
      bookingId,
      overallScore,
      technicalScore,
      communicationScore,
      problemSolvingScore,
      skillAssessments,
      strengths,
      weaknesses,
      detailedFeedback,
      recommendations,
      interviewQuestions,
      timeManagement,
      confidence,
      hireRecommendation,
      followUpActions,
      additionalNotes
    } = req.body;

    const interviewerId = req.user._id;

    // Validate required fields
    if (!bookingId || !overallScore || !technicalScore || !communicationScore || !problemSolvingScore) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and all scores are required"
      });
    }

    // Check if booking exists and belongs to this interviewer
    const booking = await InterviewBooking.findOne({
      _id: bookingId,
      interviewer: interviewerId,
      status: "completed"
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or not completed"
      });
    }

    // Check if feedback already exists
    const existingFeedback = await InterviewFeedback.findOne({ booking: bookingId });
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: "Feedback already submitted for this interview"
      });
    }

    // Create feedback
    const feedback = new InterviewFeedback({
      booking: bookingId,
      interviewer: interviewerId,
      candidate: booking.user,
      overallScore,
      technicalScore,
      communicationScore,
      problemSolvingScore,
      skillAssessments: skillAssessments || [],
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      detailedFeedback,
      recommendations: recommendations || [],
      interviewQuestions: interviewQuestions || [],
      timeManagement,
      confidence,
      hireRecommendation,
      followUpActions: followUpActions || [],
      additionalNotes
    });

    await feedback.save();

    // Update booking to mark feedback as submitted
    booking.feedbackSubmitted = true;
    await booking.save();

    // Update interviewer stats
    const interviewer = await Interviewer.findById(interviewerId);
    if (interviewer) {
      interviewer.stats.totalInterviews += 1;
      await interviewer.save();
    }

    // Populate feedback with booking details
    const populatedFeedback = await InterviewFeedback.findById(feedback._id)
      .populate("booking", "topic difficulty scheduledDate")
      .populate("candidate", "name email");

    sendMetric('InterviewFeedbackSubmitted', 1, 'Count', [
      { Name: 'Topic', Value: booking.topic },
      { Name: 'Difficulty', Value: booking.difficulty }
    ]);

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: populatedFeedback
    });
  } catch (error) {
    logger.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting feedback",
      error: error.message
    });
  }
};

// Get feedback for a specific booking (for candidates)
export const getFeedbackForBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    // Check if user owns the booking
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

    const feedback = await InterviewFeedback.findOne({ booking: bookingId })
      .populate("interviewer", "profile stats");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback",
      error: error.message
    });
  }
};

// Get user's feedback history
export const getUserFeedbackHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const feedback = await InterviewFeedback.find({ candidate: userId })
      .populate("booking", "topic difficulty scheduledDate")
      .populate("interviewer", "profile stats")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InterviewFeedback.countDocuments({ candidate: userId });

    res.status(200).json({
      success: true,
      data: feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error("Error fetching feedback history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback history",
      error: error.message
    });
  }
};

// Get interviewer's feedback submissions
export const getInterviewerFeedbackHistory = async (req, res) => {
  try {
    const interviewerId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const feedback = await InterviewFeedback.find({ interviewer: interviewerId })
      .populate("booking", "topic difficulty scheduledDate")
      .populate("candidate", "name email")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InterviewFeedback.countDocuments({ interviewer: interviewerId });

    res.status(200).json({
      success: true,
      data: feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error("Error fetching interviewer feedback history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback history",
      error: error.message
    });
  }
};

// Update feedback (for interviewers)
export const updateFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const updateData = req.body;
    const interviewerId = req.user._id;

    const feedback = await InterviewFeedback.findOne({
      _id: feedbackId,
      interviewer: interviewerId
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    // Update allowed fields
    const allowedFields = [
      'overallScore', 'technicalScore', 'communicationScore', 'problemSolvingScore',
      'skillAssessments', 'strengths', 'weaknesses', 'detailedFeedback',
      'recommendations', 'interviewQuestions', 'timeManagement', 'confidence',
      'hireRecommendation', 'followUpActions', 'additionalNotes'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        feedback[field] = updateData[field];
      }
    });

    await feedback.save();

    res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data: feedback
    });
  } catch (error) {
    logger.error("Error updating feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error updating feedback",
      error: error.message
    });
  }
};

// Get feedback analytics for user
export const getFeedbackAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const feedback = await InterviewFeedback.find({ candidate: userId });

    if (feedback.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalInterviews: 0,
          averageScore: 0,
          performanceTrend: [],
          skillBreakdown: {},
          improvementAreas: []
        }
      });
    }

    // Calculate analytics
    const totalInterviews = feedback.length;
    const averageScore = Math.round(
      feedback.reduce((sum, f) => sum + f.overallScore, 0) / totalInterviews
    );

    // Performance trend (last 5 interviews)
    const performanceTrend = feedback
      .slice(0, 5)
      .map(f => ({
        date: f.submittedAt,
        score: f.overallScore,
        topic: f.booking?.topic
      }))
      .reverse();

    // Skill breakdown
    const skillBreakdown = {};
    feedback.forEach(f => {
      f.skillAssessments?.forEach(skill => {
        if (!skillBreakdown[skill.skill]) {
          skillBreakdown[skill.skill] = { total: 0, count: 0 };
        }
        skillBreakdown[skill.skill].total += skill.rating;
        skillBreakdown[skill.skill].count += 1;
      });
    });

    // Calculate average ratings
    Object.keys(skillBreakdown).forEach(skill => {
      skillBreakdown[skill].average = Math.round(
        (skillBreakdown[skill].total / skillBreakdown[skill].count) * 10
      ) / 10;
    });

    // Identify improvement areas (skills with average rating < 3)
    const improvementAreas = Object.entries(skillBreakdown)
      .filter(([_, data]) => data.average < 3)
      .map(([skill, data]) => ({
        skill,
        averageRating: data.average
      }));

    res.status(200).json({
      success: true,
      data: {
        totalInterviews,
        averageScore,
        performanceTrend,
        skillBreakdown,
        improvementAreas
      }
    });
  } catch (error) {
    logger.error("Error fetching feedback analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback analytics",
      error: error.message
    });
  }
}; 