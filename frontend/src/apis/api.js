import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Update this with your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Store the current URL for redirect after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      // Remove token
      localStorage.removeItem("token");
      // Dispatch custom event for unauthorized access
      window.dispatchEvent(new CustomEvent('unauthorized', {
        detail: { path: window.location.pathname }
      }));
    }
    return Promise.reject(error);
  }
);

export default api; 