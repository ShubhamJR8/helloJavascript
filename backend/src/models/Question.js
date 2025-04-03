import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ["MCQ", "coding"], required: true },
  topic: { type: String, required: true, index: true },
  subTopic: { type: String }, // Optional sub-category
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  difficultyScore: { type: Number, min: 1, max: 10 }, // More granular difficulty rating
  tags: [{ type: String }], // For better search & filtering
  timeLimit: { type: Number, default: 30 }, // In seconds

  // MCQ-specific fields
  options: [{ type: String }],
  correctAnswer: { type: String },

  // Coding-specific fields
  starterCode: { type: String }, // Initial code provided to user
  language: [{ type: String, enum: ["javascript"] }], // Supported languages
  testCases: [
    {
      input: { type: mongoose.Schema.Types.Mixed, required: true },
      expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },
    },
  ],
  hiddenTestCases: [
    {
      input: { type: mongoose.Schema.Types.Mixed, required: true },
      expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },
    },
  ],
  constraints: [{ type: String }], // Constraints like "O(n) complexity required"
  hints: [{ type: String }],

  // Performance Tracking
  submissionsCount: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 }, // Percentage of successful submissions
  averageTimeToSolve: { type: Number, default: 0 }, // Average solve time in seconds

  createdAt: { type: Date, default: Date.now },
});

const Question = mongoose.model("Question", QuestionSchema);
export default Question;
