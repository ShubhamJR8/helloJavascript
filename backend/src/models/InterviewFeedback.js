import mongoose from "mongoose";

const InterviewFeedbackSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InterviewBooking",
    required: [true, "Booking ID is required"],
    unique: true,
    index: true
  },
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interviewer",
    required: [true, "Interviewer ID is required"],
    index: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Candidate ID is required"],
    index: true
  },
  overallScore: {
    type: Number,
    required: [true, "Overall score is required"],
    min: [0, "Score cannot be negative"],
    max: [100, "Score cannot exceed 100"]
  },
  technicalScore: {
    type: Number,
    required: [true, "Technical score is required"],
    min: [0, "Score cannot be negative"],
    max: [100, "Score cannot exceed 100"]
  },
  communicationScore: {
    type: Number,
    required: [true, "Communication score is required"],
    min: [0, "Score cannot be negative"],
    max: [100, "Score cannot exceed 100"]
  },
  problemSolvingScore: {
    type: Number,
    required: [true, "Problem solving score is required"],
    min: [0, "Score cannot be negative"],
    max: [100, "Score cannot exceed 100"]
  },
  skillAssessments: [{
    skill: {
      type: String,
      required: true,
      enum: [
        "JavaScript", "React", "Node.js", "Python", "Java", "SQL", "Data Structures",
        "Algorithms", "System Design", "API Design", "Testing", "Git", "DevOps",
        "Database Design", "Security", "Performance", "Scalability", "Architecture"
      ]
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"]
    },
    comments: {
      type: String,
      maxLength: [300, "Comments cannot exceed 300 characters"]
    }
  }],
  strengths: [{
    type: String,
    maxLength: [200, "Strength description cannot exceed 200 characters"]
  }],
  weaknesses: [{
    type: String,
    maxLength: [200, "Weakness description cannot exceed 200 characters"]
  }],
  detailedFeedback: {
    technicalKnowledge: {
      type: String,
      required: [true, "Technical knowledge feedback is required"],
      maxLength: [1000, "Feedback cannot exceed 1000 characters"]
    },
    codingAbility: {
      type: String,
      required: [true, "Coding ability feedback is required"],
      maxLength: [1000, "Feedback cannot exceed 1000 characters"]
    },
    communication: {
      type: String,
      required: [true, "Communication feedback is required"],
      maxLength: [1000, "Feedback cannot exceed 1000 characters"]
    },
    problemSolving: {
      type: String,
      required: [true, "Problem solving feedback is required"],
      maxLength: [1000, "Feedback cannot exceed 1000 characters"]
    }
  },
  recommendations: [{
    category: {
      type: String,
      enum: ["learning", "practice", "interview", "career"],
      required: true
    },
    title: {
      type: String,
      required: true,
      maxLength: [100, "Title cannot exceed 100 characters"]
    },
    description: {
      type: String,
      required: true,
      maxLength: [500, "Description cannot exceed 500 characters"]
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    resources: [{
      type: String,
      maxLength: [200, "Resource URL cannot exceed 200 characters"]
    }]
  }],
  interviewQuestions: [{
    question: {
      type: String,
      required: true,
      maxLength: [500, "Question cannot exceed 500 characters"]
    },
    category: {
      type: String,
      enum: ["technical", "behavioral", "system-design", "coding"],
      required: true
    },
    candidateResponse: {
      type: String,
      maxLength: [2000, "Response cannot exceed 2000 characters"]
    },
    score: {
      type: Number,
      min: [0, "Score cannot be negative"],
      max: [10, "Score cannot exceed 10"]
    },
    feedback: {
      type: String,
      maxLength: [500, "Feedback cannot exceed 500 characters"]
    }
  }],
  timeManagement: {
    overall: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      required: true
    },
    comments: {
      type: String,
      maxLength: [300, "Comments cannot exceed 300 characters"]
    }
  },
  confidence: {
    level: {
      type: String,
      enum: ["very-high", "high", "moderate", "low", "very-low"],
      required: true
    },
    comments: {
      type: String,
      maxLength: [300, "Comments cannot exceed 300 characters"]
    }
  },
  hireRecommendation: {
    decision: {
      type: String,
      enum: ["strong-hire", "hire", "weak-hire", "no-hire", "strong-no-hire"],
      required: true
    },
    reasoning: {
      type: String,
      required: true,
      maxLength: [500, "Reasoning cannot exceed 500 characters"]
    }
  },
  followUpActions: [{
    action: {
      type: String,
      required: true,
      maxLength: [200, "Action cannot exceed 200 characters"]
    },
    timeline: {
      type: String,
      enum: ["immediate", "1-week", "1-month", "3-months"],
      required: true
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    }
  }],
  additionalNotes: {
    type: String,
    maxLength: [2000, "Additional notes cannot exceed 2000 characters"]
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
InterviewFeedbackSchema.index({ candidate: 1, submittedAt: -1 });
InterviewFeedbackSchema.index({ interviewer: 1, submittedAt: -1 });
InterviewFeedbackSchema.index({ overallScore: -1 });
InterviewFeedbackSchema.index({ "hireRecommendation.decision": 1 });

// Virtual for overall performance level
InterviewFeedbackSchema.virtual('performanceLevel').get(function() {
  if (this.overallScore >= 90) return "Excellent";
  if (this.overallScore >= 80) return "Very Good";
  if (this.overallScore >= 70) return "Good";
  if (this.overallScore >= 60) return "Fair";
  return "Needs Improvement";
});

// Virtual for average skill rating
InterviewFeedbackSchema.virtual('averageSkillRating').get(function() {
  if (!this.skillAssessments || this.skillAssessments.length === 0) return 0;
  const total = this.skillAssessments.reduce((sum, skill) => sum + skill.rating, 0);
  return Math.round((total / this.skillAssessments.length) * 10) / 10;
});

// Method to calculate overall score from individual scores
InterviewFeedbackSchema.methods.calculateOverallScore = function() {
  const weights = {
    technical: 0.4,
    communication: 0.25,
    problemSolving: 0.35
  };
  
  return Math.round(
    (this.technicalScore * weights.technical) +
    (this.communicationScore * weights.communication) +
    (this.problemSolvingScore * weights.problemSolving)
  );
};

// Pre-save middleware to auto-calculate overall score if not provided
InterviewFeedbackSchema.pre('save', function(next) {
  if (!this.overallScore) {
    this.overallScore = this.calculateOverallScore();
  }
  next();
});

const InterviewFeedback = mongoose.model("InterviewFeedback", InterviewFeedbackSchema);

export default InterviewFeedback; 