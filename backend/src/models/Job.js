import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    required: true,
    enum: ['Entry', 'Mid', 'Senior', '2-5 years', '5+ years', '10+ years']
  },
  salary: {
    type: String
  },
  jobType: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
  },
  description: {
    type: String,
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  uploadDate: {
    type: Date,
    default: Date.now
  },
  applyLink: {
    type: String
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Add text index for search functionality
jobSchema.index({ 
  title: 'text', 
  company: 'text', 
  description: 'text',
  skills: 'text'
});

const Job = mongoose.model('Job', jobSchema);

export default Job; 