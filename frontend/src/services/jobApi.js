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

  // Delete a job (admin only)
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  }
};

export default jobApi; 