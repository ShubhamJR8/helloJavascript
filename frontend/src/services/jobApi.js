import api from './api';

// Job API calls
export const jobApi = {
  // Get all jobs with filters
  getJobs: async (filters = {}) => {
    const response = await api.get('/jobs', { params: filters });
    return response.data;
  },

  // Get a single job
  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Create a new job
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update a job
  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Delete a job
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  // Get user's jobs
  getUserJobs: async () => {
    const response = await api.get('/jobs/user/jobs');
    return response.data;
  }
};

export default jobApi; 