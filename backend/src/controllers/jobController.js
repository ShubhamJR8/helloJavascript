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

// Update job status (Admin only)
export const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['active', 'closed', 'draft'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const job = await Job.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(400).json({ message: 'Error updating job status', error: error.message });
  }
};

// Bulk update job status (Admin only)
export const bulkUpdateJobStatus = async (req, res) => {
  try {
    const { jobIds, status } = req.body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ message: 'Job IDs array is required' });
    }

    if (!['active', 'closed', 'draft'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const result = await Job.updateMany(
      { _id: { $in: jobIds } },
      { status }
    );

    res.json({ 
      message: `Updated ${result.modifiedCount} jobs to ${status}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating jobs', error: error.message });
  }
};

// Bulk delete jobs (Admin only)
export const bulkDeleteJobs = async (req, res) => {
  try {
    const { jobIds } = req.body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ message: 'Job IDs array is required' });
    }

    const result = await Job.deleteMany({ _id: { $in: jobIds } });

    res.json({ 
      message: `Deleted ${result.deletedCount} jobs`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting jobs', error: error.message });
  }
};

// Duplicate a job (Admin only)
export const duplicateJob = async (req, res) => {
  try {
    const originalJob = await Job.findById(req.params.id);
    
    if (!originalJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Create new job with same data but new ID and draft status
    const duplicatedJob = new Job({
      title: `${originalJob.title} (Copy)`,
      company: originalJob.company,
      location: originalJob.location,
      experience: originalJob.experience,
      salary: originalJob.salary,
      jobType: originalJob.jobType,
      description: originalJob.description,
      skills: originalJob.skills,
      applyLink: originalJob.applyLink,
      status: 'draft', // Set as draft by default
      postedBy: req.user._id
    });

    await duplicatedJob.save();
    res.status(201).json(duplicatedJob);
  } catch (error) {
    res.status(400).json({ message: 'Error duplicating job', error: error.message });
  }
};

// Get job analytics (Admin only)
export const getJobAnalytics = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });
    const draftJobs = await Job.countDocuments({ status: 'draft' });

    // Jobs by type
    const jobsByType = await Job.aggregate([
      { $group: { _id: '$jobType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Jobs by experience level
    const jobsByExperience = await Job.aggregate([
      { $group: { _id: '$experience', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent jobs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentJobs = await Job.countDocuments({
      uploadDate: { $gte: thirtyDaysAgo }
    });

    // Jobs by location (top 10)
    const jobsByLocation = await Job.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalJobs,
      activeJobs,
      closedJobs,
      draftJobs,
      recentJobs,
      jobsByType,
      jobsByExperience,
      jobsByLocation
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

// Search jobs with advanced filters (Admin only)
export const searchJobsAdmin = async (req, res) => {
  try {
    const { 
      search, 
      location, 
      experience, 
      jobType,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    // Add search filter
    if (search && search.trim()) {
      const searchTerm = search.trim();
      if (searchTerm.length >= 3) {
        const sanitizedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(sanitizedSearch, 'i');
        query.$or = [
          { title: searchRegex },
          { company: searchRegex },
          { description: searchRegex },
          { skills: searchRegex }
        ];
      }
    }

    // Add filters
    if (location && location !== 'All Locations') {
      query.location = location;
    }
    if (experience && experience !== 'All Experience Levels') {
      query.experience = experience;
    }
    if (jobType && jobType !== 'All Types') {
      query.jobType = jobType;
    }
    if (status && status !== 'All Statuses') {
      query.status = status;
    }

    // Add date range filter
    if (dateFrom || dateTo) {
      query.uploadDate = {};
      if (dateFrom) {
        query.uploadDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.uploadDate.$lte = new Date(dateTo);
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const jobs = await Job.find(query)
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('postedBy', 'name email')
      .lean();

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
    res.status(500).json({ message: 'Error searching jobs', error: error.message });
  }
}; 