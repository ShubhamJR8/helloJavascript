import express from "express";
import { submitAnswer, getUserSubmissions, getSubmissionDetails } from "../controllers/submissionController.js";

const router = express.Router();

// Route to submit an answer (MCQ or coding)
router.post("/submit", submitAnswer);

// Route to get all submissions by a user
router.get("/user/:userId", getUserSubmissions);

// Route to get a specific submission by ID
router.get("/:submissionId", getSubmissionDetails);

export default router;
