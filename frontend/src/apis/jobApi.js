import axios from "axios";
import { API_BASE_URL } from "../config.js";

const JOBS_API_URL = `${API_BASE_URL}/api`;

const api = axios.create({
  baseURL: JOBS_API_URL,
  headers: { "Content-Type": "application/json" },
});

export const fetchJobs = async (filters = {}) => {
  const response = await api.get("/jobs/active", { params: filters });
  return response.data;
};

export const getJobById = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
}; 