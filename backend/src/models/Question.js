import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: [true, "Question text is required"],
    trim: true
  },
  type: { 
    type: String, 
    enum: ["MCQ", "coding"], 
    required: [true, "Question type is required"] 
  },
  topic: { 
    type: String, 
    required: [true, "Topic is required"], 
    trim: true,
    index: true 
  },
  subTopic: { 
    type: String,
    trim: true,
    index: true
  },
  difficulty: { 
    type: String, 
    enum: ["easy", "medium", "hard"], 
    required: [true, "Difficulty level is required"],
    index: true
  },
  difficultyScore: { 
    type: Number, 
    min: [1, "Difficulty score must be at least 1"],
    max: [10, "Difficulty score cannot exceed 10"]
  },
  tags: [{ 
    type: String,
    trim: true
  }],
  timeLimit: { 
    type: Number, 
    default: 30,
    min: [10, "Time limit must be at least 10 seconds"],
    max: [600, "Time limit cannot exceed 600 seconds"]
  },

  // MCQ-specific fields
  options: {
    type: [String],
    validate: {
      validator: function(v) {
        return this.type !== "MCQ" || (v && v.length >= 2);
      },
      message: "MCQ questions must have at least 2 options"
    }
  },
  correctAnswer: {
    type: String,
    validate: {
      validator: function(v) {
        return this.type !== "MCQ" || (v && this.options.includes(v));
      },
      message: "Correct answer must be one of the provided options"
    }
  },

  // Coding-specific fields
  starterCode: { 
    type: String,
    validate: {
      validator: function(v) {
        return this.type !== "coding" || !!v;
      },
      message: "Starter code is required for coding questions"
    }
  },
  language: [{ 
    type: String, 
    enum: ["javascript", "python", "java", "c++"],
    validate: {
      validator: function(v) {
        return this.type !== "coding" || (v && v.length > 0);
      },
      message: "At least one language must be specified for coding questions"
    }
  }],
  testCases: [
    {
      input: { 
        type: mongoose.Schema.Types.Mixed, 
        required: [true, "Test case input is required"]
      },
      expectedOutput: { 
        type: mongoose.Schema.Types.Mixed, 
        required: [true, "Test case expected output is required"]
      },
      description: {
        type: String,
        trim: true
      }
    }
  ],
  hiddenTestCases: [
    {
      input: { 
        type: mongoose.Schema.Types.Mixed, 
        required: [true, "Hidden test case input is required"]
      },
      expectedOutput: { 
        type: mongoose.Schema.Types.Mixed, 
        required: [true, "Hidden test case expected output is required"]
      }
    }
  ],
  constraints: [{ 
    type: String,
    trim: true
  }],
  hints: [{ 
    type: String,
    trim: true
  }],

  // Performance Tracking
  submissionsCount: { 
    type: Number, 
    default: 0,
    min: [0, "Submissions count cannot be negative"]
  },
  successRate: { 
    type: Number, 
    default: 0,
    min: [0, "Success rate cannot be negative"],
    max: [100, "Success rate cannot exceed 100"]
  },
  averageTimeToSolve: { 
    type: Number, 
    default: 0,
    min: [0, "Average time to solve cannot be negative"]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
QuestionSchema.index({ topic: 1, difficulty: 1 });
QuestionSchema.index({ type: 1, difficulty: 1 });
QuestionSchema.index({ tags: 1 });

const Question = mongoose.model("Question", QuestionSchema);
export default Question;
