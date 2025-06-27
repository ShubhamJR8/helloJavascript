import Job from '../models/Job.js';

// Get all jobs with filters (shows all jobs regardless of status)
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

    const query = {}; // Remove status filter to show all jobs

    // Add search filter with validation and sanitization
    if (search && search.trim()) {
      const searchTerm = search.trim();
      
      // Validate search term length
      if (searchTerm.length < 3) {
        return res.status(400).json({ 
          message: 'Search term must be at least 3 characters long',
          error: 'INVALID_SEARCH_LENGTH'
        });
      }

      // Sanitize search term (remove special regex characters that could cause issues)
      const sanitizedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(sanitizedSearch, 'i'); // case-insensitive
      
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
        { skills: searchRegex }
      ];
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

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10)); // Max 50, min 1

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const jobs = await Job.find(query)
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('postedBy', 'name email')
      .lean(); // Use lean() for better performance

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalJobs: total,
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1
    });
  } catch (error) {
    console.error('Error in getJobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

// Get only active jobs with filters
export const getActiveJobs = async (req, res) => {
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

    // Add search filter with validation and sanitization
    if (search && search.trim()) {
      const searchTerm = search.trim();
      
      // Validate search term length
      if (searchTerm.length < 3) {
        return res.status(400).json({ 
          message: 'Search term must be at least 3 characters long',
          error: 'INVALID_SEARCH_LENGTH'
        });
      }

      // Sanitize search term (remove special regex characters that could cause issues)
      const sanitizedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(sanitizedSearch, 'i'); // case-insensitive
      
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { description: searchRegex },
        { skills: searchRegex }
      ];
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

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10)); // Max 50, min 1

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const jobs = await Job.find(query)
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('postedBy', 'name email')
      .lean(); // Use lean() for better performance

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalJobs: total,
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1
    });
  } catch (error) {
    console.error('Error in getActiveJobs:', error);
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

// Create a new job (Admin only)
export const createJob = async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.user._id // Admin user who created the job
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: 'Error creating job', error: error.message });
  }
};

// Update a job (Admin only)
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
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

// Delete a job (Admin only)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
};

// Get all jobs for admin management (Admin only)
export const getAllJobsForAdmin = async (req, res) => {
  try {
    const jobs = await Job.find({})
      .sort({ uploadDate: -1 })
      .populate('postedBy', 'name email');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
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