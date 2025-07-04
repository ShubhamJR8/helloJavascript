import mongoose from "mongoose";

const InterviewBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    index: true
  },
  interviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interviewer",
    required: [true, "Interviewer ID is required"],
    index: true
  },
  topic: {
    type: String,
    required: [true, "Interview topic is required"],
    enum: ["React", "Node.js", "System Design", "JavaScript", "Python", "Java", "Data Structures", "Algorithms"],
    index: true
  },
  difficulty: {
    type: String,
    required: [true, "Difficulty level is required"],
    enum: ["Beginner", "Intermediate", "Advanced"],
    index: true
  },
  scheduledDate: {
    type: Date,
    required: [true, "Scheduled date is required"],
    index: true
  },
  duration: {
    type: Number,
    default: 60, // minutes
    min: [30, "Minimum duration is 30 minutes"],
    max: [180, "Maximum duration is 180 minutes"]
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "in-progress", "completed", "cancelled", "no-show"],
    default: "pending",
    index: true
  },
  payment: {
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Amount cannot be negative"]
    },
    currency: {
      type: String,
      default: "USD"
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending"
    },
    paymentMethod: String,
    transactionId: String,
    paidAt: Date
  },
  specialRequirements: {
    type: String,
    maxLength: [500, "Special requirements cannot exceed 500 characters"]
  },
  notes: {
    type: String,
    maxLength: [1000, "Notes cannot exceed 1000 characters"]
  },
  meetingLink: String,
  recordingUrl: String,
  feedbackSubmitted: {
    type: Boolean,
    default: false
  },
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ["user", "interviewer", "admin"]
  },
  cancelledAt: Date
}, {
  timestamps: true
});

// Index for efficient queries
InterviewBookingSchema.index({ scheduledDate: 1, status: 1 });
InterviewBookingSchema.index({ user: 1, status: 1 });
InterviewBookingSchema.index({ interviewer: 1, scheduledDate: 1 });

// Virtual for checking if interview is upcoming
InterviewBookingSchema.virtual('isUpcoming').get(function() {
  return this.scheduledDate > new Date() && this.status === 'confirmed';
});

// Virtual for checking if interview is past due
InterviewBookingSchema.virtual('isPastDue').get(function() {
  return this.scheduledDate < new Date() && ['pending', 'confirmed'].includes(this.status);
});

// Pre-save middleware to validate scheduling
InterviewBookingSchema.pre('save', function(next) {
  if (this.isModified('scheduledDate')) {
    const now = new Date();
    const scheduledTime = new Date(this.scheduledDate);
    
    // Ensure interview is scheduled at least 2 hours in advance
    const minAdvanceTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
    
    if (scheduledTime < minAdvanceTime) {
      return next(new Error('Interviews must be scheduled at least 2 hours in advance'));
    }
  }
  next();
});

const InterviewBooking = mongoose.model("InterviewBooking", InterviewBookingSchema);

export default InterviewBooking; 