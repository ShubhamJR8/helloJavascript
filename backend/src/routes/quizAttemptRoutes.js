import express from "express";

import {
    startQuizAttempt,
    // submitQuizAnswer,
    completeQuizAttempt,
    getUserQuizAttempts,
    getQuizAttemptDetails,
    getQuizAnalytics,
} from "../controllers/quizAttemptController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Start a new quiz attempt
router.post("/start", startQuizAttempt);

// Submit an answer for a quiz question
// router.post("/submit", submitQuizAnswer);

// Mark quiz attempt as completed
router.post("/complete", completeQuizAttempt);

// Get all quiz attempts for a user
router.get("/user/:userId", getUserQuizAttempts);

// Get analytics for a quiz
router.get("/analytics", getQuizAnalytics);

// Get details of a specific quiz attempt
router.get("/:attemptId", getQuizAttemptDetails);

export default router;
