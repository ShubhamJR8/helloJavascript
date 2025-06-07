import express from "express";
import { logger } from '../utils/logger.js';

import {
    startQuizAttempt,
    // submitQuizAnswer,
    completeQuizAttempt,
    getUserQuizAttempts,
    getQuizAttemptDetails,
    getQuizAnalytics,
} from "../controllers/quizAttemptController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateStartQuizAttempt, validateCompleteQuizAttempt } from "../middleware/validationMiddleware.js";
import { sendMetric } from "../utils/cloudwatch.js";

const router = express.Router();

router.use((req, res, next) => {
    logger.info(`Quiz Attempt Route: ${req.method} ${req.originalUrl}`, {
        user: req.user ? req.user._id : 'Unauthenticated',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    });
    sendMetric('QuizAttemptRouteAccess', 1, 'Count', [
        { Name: 'Method', Value: req.method },
        { Name: 'Route', Value: req.originalUrl },
        { Name: 'User', Value: req.user ? req.user._id : 'Unauthenticated' },
    ]);
    next();
});

// Apply authentication to all routes
router.use(protect);

// Start a new quiz attempt
router.post("/start", validateStartQuizAttempt, startQuizAttempt);

// Submit an answer for a quiz question
// router.post("/submit", submitQuizAnswer);

// Mark quiz attempt as completed
router.post("/complete", validateCompleteQuizAttempt, completeQuizAttempt);

// Get all quiz attempts for the current user
router.get("/user/attempts", getUserQuizAttempts);

// Get quiz analytics
router.get("/analytics", getQuizAnalytics);

// Get details of a specific quiz attempt
router.get("/:attemptId", getQuizAttemptDetails);

export default router;
