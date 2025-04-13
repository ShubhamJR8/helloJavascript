import Job from '../models/Job.js';

// Get all jobs with filters
export const getJobs = async (req, res) => {
  try {
    const { 
      search, 
      location, 
      experience, 
      jobType,
      page = 1,
      limit = 10
    } = req.query;

    const query = { status: 'active' };

    // Add search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Add location filter
    if (location && location !== 'All Locations') {
      query.location = location;
    }

    // Add experience filter
    if (experience && experience !== 'All Experience Levels') {
      query.experience = experience;
    }

    // Add job type filter
    if (jobType && jobType !== 'All Types') {
      query.jobType = jobType;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const jobs = await Job.find(query)
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('postedBy', 'name email');

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalJobs: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// Get a single job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
};

// Create a new job
export const createJob = async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.user._id // Assuming user is attached to request by auth middleware
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: 'Error creating job', error: error.message });
  }
};

// Update a job
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the owner of the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedJob);
  } catch (error) {
    res.status(400).json({ message: 'Error updating job', error: error.message });
  }
};

// Delete a job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the owner of the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
};

// Get jobs posted by a specific user
export const getUserJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .sort({ uploadDate: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user jobs', error: error.message });
  }
}; 