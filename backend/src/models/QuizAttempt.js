import mongoose from "mongoose";

const QuizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

  topic: { type: String, required: true, index: true }, // Index for filtering
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true, index: true },

  questions: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true, index: true },
      selectedOption: { type: String }, // MCQs
      isCorrect: { type: Boolean, required: true },
      timeTaken: { type: Number, default: 0 }, // Time taken for this question (seconds)
    },
  ],

  totalScore: { type: Number, default: 0 },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, default: 0 },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null }, // Ensuring default

  isSubmitted: { type: Boolean, default: false }, // Prevents modification after submission
  status: { type: String, enum: ["in-progress", "completed"], default: "in-progress", index: true },
  lastUpdated: { type: Date, default: Date.now }, // Tracks last activity
});

// Ensure endTime is set when quiz is submitted
QuizAttemptSchema.pre("save", function (next) {
  if (this.isSubmitted && !this.endTime) {
    this.endTime = new Date();
  }
  this.lastUpdated = new Date();
  next();
});

const QuizAttempt = mongoose.model("QuizAttempt", QuizAttemptSchema);
export default QuizAttempt;
