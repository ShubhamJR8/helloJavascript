import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const fetchJobs = async (filters = {}) => {
  const response = await api.get("/jobs", { params: filters });
  return response.data;
};

export const getJobById = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

export const saveJob = async (jobId, userId) => {
  const response = await api.post(`/jobs/${jobId}/save`, { userId });
  return response.data;
};

export const getSavedJobs = async (userId) => {
  const response = await api.get(`/users/${userId}/saved-jobs`);
  return response.data;
}; 