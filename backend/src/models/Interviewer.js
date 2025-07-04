import mongoose from "mongoose";

const InterviewerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    unique: true,
    index: true
  },
  profile: {
    bio: {
      type: String,
      required: [true, "Bio is required"],
      maxLength: [500, "Bio cannot exceed 500 characters"]
    },
    experience: {
      type: Number,
      required: [true, "Years of experience is required"],
      min: [1, "Minimum 1 year of experience required"],
      max: [50, "Experience cannot exceed 50 years"]
    },
    currentRole: {
      type: String,
      required: [true, "Current role is required"],
      maxLength: [100, "Role cannot exceed 100 characters"]
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      maxLength: [100, "Company name cannot exceed 100 characters"]
    },
    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String,
    profileImage: String
  },
  expertise: [{
    topic: {
      type: String,
      required: true,
      enum: ["React", "Node.js", "System Design", "JavaScript", "Python", "Java", "Data Structures", "Algorithms"]
    },
    level: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"]
    },
    yearsOfExperience: {
      type: Number,
      required: true,
      min: [0, "Experience cannot be negative"]
    }
  }],
  availability: {
    timezone: {
      type: String,
      required: [true, "Timezone is required"],
      default: "UTC"
    },
    workingHours: {
      start: {
        type: String,
        required: [true, "Start time is required"],
        default: "09:00"
      },
      end: {
        type: String,
        required: [true, "End time is required"],
        default: "17:00"
      }
    },
    workingDays: [{
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      default: ["monday", "tuesday", "wednesday", "thursday", "friday"]
    }],
    blockedDates: [{
      date: {
        type: Date,
        required: true
      },
      reason: String
    }]
  },
  pricing: {
    beginner: {
      type: Number,
      required: [true, "Beginner pricing is required"],
      min: [10, "Minimum price is $10"],
      max: [500, "Maximum price is $500"]
    },
    intermediate: {
      type: Number,
      required: [true, "Intermediate pricing is required"],
      min: [15, "Minimum price is $15"],
      max: [750, "Maximum price is $750"]
    },
    advanced: {
      type: Number,
      required: [true, "Advanced pricing is required"],
      min: [25, "Minimum price is $25"],
      max: [1000, "Maximum price is $1000"]
    },
    currency: {
      type: String,
      default: "USD"
    }
  },
  stats: {
    totalInterviews: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"]
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 100,
      min: [0, "Completion rate cannot be negative"],
      max: [100, "Completion rate cannot exceed 100"]
    }
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended", "pending"],
    default: "pending",
    index: true
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    documents: [{
      type: String,
      description: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  preferences: {
    maxInterviewsPerDay: {
      type: Number,
      default: 8,
      min: [1, "Minimum 1 interview per day"],
      max: [12, "Maximum 12 interviews per day"]
    },
    minAdvanceBooking: {
      type: Number,
      default: 2, // hours
      min: [1, "Minimum 1 hour advance booking"],
      max: [72, "Maximum 72 hours advance booking"]
    },
    autoAccept: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
InterviewerSchema.index({ status: 1, "expertise.topic": 1 });
InterviewerSchema.index({ "stats.averageRating": -1 });
InterviewerSchema.index({ "pricing.beginner": 1, "pricing.intermediate": 1, "pricing.advanced": 1 });

// Virtual for checking if interviewer is available
InterviewerSchema.virtual('isAvailable').get(function() {
  return this.status === 'active';
});

// Method to check availability for a specific date/time
InterviewerSchema.methods.isAvailableForSlot = function(dateTime) {
  if (this.status !== 'active') return false;
  
  const date = new Date(dateTime);
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  // Check if it's a working day
  if (!this.availability.workingDays.includes(dayOfWeek)) return false;
  
  // Check if date is blocked
  const isBlocked = this.availability.blockedDates.some(blocked => 
    blocked.date.toDateString() === date.toDateString()
  );
  if (isBlocked) return false;
  
  // Check working hours (simplified - would need timezone conversion in production)
  const hour = date.getHours();
  const startHour = parseInt(this.availability.workingHours.start.split(':')[0]);
  const endHour = parseInt(this.availability.workingHours.end.split(':')[0]);
  
  return hour >= startHour && hour < endHour;
};

// Method to get price for difficulty level
InterviewerSchema.methods.getPriceForDifficulty = function(difficulty) {
  return this.pricing[difficulty.toLowerCase()] || this.pricing.intermediate;
};

const Interviewer = mongoose.model("Interviewer", InterviewerSchema);

export default Interviewer; 