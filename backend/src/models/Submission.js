import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  submittedCode: { type: String, required: true },
  language: { type: String, enum: ["javascript", "python", "java"], required: true },
  testResults: [
    {
      input: { type: mongoose.Schema.Types.Mixed, required: true },
      expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },
      actualOutput: { type: mongoose.Schema.Types.Mixed, required: true },
      passed: { type: Boolean, required: true },
    },
  ],
  hiddenTestResults: [
    {
      input: { type: mongoose.Schema.Types.Mixed, required: true },
      expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },
      actualOutput: { type: mongoose.Schema.Types.Mixed, required: true },
      passed: { type: Boolean, required: true },
    },
  ],
  executionTime: { type: Number }, // In milliseconds
  memoryUsage: { type: Number }, // In KB
  status: {
    type: String,
    enum: ["pending", "accepted", "wrong answer", "runtime error", "time limit exceeded"],
    required: true,
  },
  submittedAt: { type: Date, default: Date.now },
});

const Submission = mongoose.model("Submission", SubmissionSchema);
export default Submission;
