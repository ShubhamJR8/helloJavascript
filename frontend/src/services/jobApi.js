import api from './api';

// Job API calls
export const jobApi = {
  // Get all jobs with filters (public)
  getJobs: async (filters = {}) => {
    const response = await api.get('/jobs', { params: filters });
    return response.data;
  },

  // Get a single job (public)
  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Get all jobs for admin management (admin only)
  getAllJobsForAdmin: async () => {
    const response = await api.get('/jobs/admin/all');
    return response.data;
  },

  // Search jobs with advanced filters (admin only)
  searchJobsAdmin: async (filters = {}) => {
    const response = await api.get('/jobs/admin/search', { params: filters });
    return response.data;
  },

  // Get job analytics (admin only)
  getJobAnalytics: async () => {
    const response = await api.get('/jobs/admin/analytics');
    return response.data;
  },

  // Create a new job (admin only)
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update a job (admin only)
  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Update job status (admin only)
  updateJobStatus: async (id, status) => {
    const response = await api.patch(`/jobs/${id}/status`, { status });
    return response.data;
  },

  // Bulk update job status (admin only)
  bulkUpdateJobStatus: async (jobIds, status) => {
    const response = await api.post('/jobs/bulk/status', { jobIds, status });
    return response.data;
  },

  // Bulk delete jobs (admin only)
  bulkDeleteJobs: async (jobIds) => {
    const response = await api.post('/jobs/bulk/delete', { jobIds });
    return response.data;
  },

  // Duplicate a job (admin only)
  duplicateJob: async (id) => {
    const response = await api.post(`/jobs/${id}/duplicate`);
    return response.data;
  },

  // Delete a job (admin only)
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  // Job Scraping APIs
  // Get supported job sites (public)
  getSupportedSites: async () => {
    const response = await api.get('/jobs/scrape/supported-sites');
    return response.data;
  },

  // Validate URL for scraping (public)
  validateScrapingUrl: async (url) => {
    const response = await api.post('/jobs/scrape/validate-url', { url });
    return response.data;
  },

  // Test job scraping (public)
  testJobScraping: async (url) => {
    const response = await api.get('/jobs/scrape/test', { params: { url } });
    return response.data;
  },

  // Scrape job from URL (admin only)
  scrapeJobFromUrl: async (url) => {
    const response = await api.post('/jobs/scrape/job', { url });
    return response.data;
  },

  // Get learning statistics for a domain (admin only)
  getLearningStats: async (domain) => {
    const response = await api.get('/jobs/scrape/learning-stats', { params: { domain } });
    return response.data;
  },

  // Get all learning data (admin only)
  getAllLearningData: async () => {
    const response = await api.get('/jobs/scrape/learning-data');
    return response.data;
  }
};

export default jobApi; 