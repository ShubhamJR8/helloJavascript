import express from "express";
import {
  getAvailableInterviewers,
  createInterviewBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
  updateBookingStatus,
  getInterviewerBookings
} from "../controllers/interviewController.js";
import {
  submitFeedback,
  getFeedbackForBooking,
  getUserFeedbackHistory,
  getInterviewerFeedbackHistory,
  updateFeedback,
  getFeedbackAnalytics
} from "../controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js";
import { logger } from "../utils/logger.js";
import { sendMetric } from "../utils/cloudwatch.js";

const router = express.Router();

// Logging middleware for interview routes
router.use((req, res, next) => {
  logger.info(`Interview Route: ${req.method} ${req.originalUrl}`, {
    user: req.user ? req.user._id : 'Unauthenticated',
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  sendMetric('InterviewRouteAccess', 1, 'Count', [
    { Name: 'Method', Value: req.method },
    { Name: 'Route', Value: req.originalUrl },
    { Name: 'User', Value: req.user ? req.user._id : 'Unauthenticated' },
  ]);
  next();
});

// Public routes (no authentication required)
router.get("/interviewers/available", getAvailableInterviewers);

// Protected routes (authentication required)
router.use(protect);

// Interview booking routes
router.get("/bookings", getUserBookings);
router.get("/bookings/:bookingId", getBookingDetails);
router.post("/bookings", createInterviewBooking);
router.patch("/bookings/:bookingId/cancel", cancelBooking);

// Interviewer-specific routes
router.get("/interviewer/bookings", getInterviewerBookings);
router.patch("/bookings/:bookingId/status", updateBookingStatus);

// Feedback routes
router.post("/feedback", submitFeedback);
router.get("/feedback/booking/:bookingId", getFeedbackForBooking);
router.get("/feedback/history", getUserFeedbackHistory);
router.get("/feedback/interviewer/history", getInterviewerFeedbackHistory);
router.put("/feedback/:feedbackId", updateFeedback);
router.get("/feedback/analytics", getFeedbackAnalytics);

export default router; 