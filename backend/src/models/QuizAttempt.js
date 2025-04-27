import mongoose from "mongoose";

const QuizAttemptSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, "User ID is required"],
    index: true 
  },
  topic: { 
    type: String, 
    required: [true, "Topic is required"], 
    index: true 
  },
  difficulty: { 
    type: String, 
    enum: ["easy", "medium", "hard"], 
    required: [true, "Difficulty level is required"], 
    index: true 
  },
  questions: [
    {
      questionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Question", 
        required: [true, "Question ID is required"],
        index: true 
      },
      selectedOption: { 
        type: String,
        default: null
      },
      submittedCode: {
        type: String,
        default: null
      },
      isCorrect: { 
        type: Boolean, 
        default: false
      },
      timeTaken: { 
        type: Number, 
        default: 0,
        min: [0, "Time taken cannot be negative"]
      }
    }
  ],
  totalScore: { 
    type: Number, 
    default: 0,
    min: [0, "Total score cannot be negative"]
  },
  totalQuestions: { 
    type: Number, 
    required: [true, "Total questions count is required"],
    min: [1, "Quiz must have at least one question"]
  },
  correctAnswers: { 
    type: Number, 
    default: 0,
    min: [0, "Correct answers count cannot be negative"]
  },
  startTime: { 
    type: Date, 
    default: Date.now 
  },
  endTime: { 
    type: Date 
  },
  isSubmitted: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ["in-progress", "completed"], 
    default: "in-progress", 
    index: true 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Ensure endTime is set when quiz is submitted
QuizAttemptSchema.pre("save", function (next) {
  if (this.isSubmitted && !this.endTime) {
    this.endTime = new Date();
  }
  this.lastUpdated = new Date();
  next();
});

// Indexes for better query performance
QuizAttemptSchema.index({ user: 1, status: 1 });
QuizAttemptSchema.index({ topic: 1, difficulty: 1, status: 1 });

const QuizAttempt = mongoose.model("QuizAttempt", QuizAttemptSchema);
export default QuizAttempt;
