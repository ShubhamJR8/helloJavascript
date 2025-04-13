import axios from 'axios';
import { API_BASE_URL } from '../config';

const userApi = axios.create({
  baseURL: `${API_BASE_URL}/api/users`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getUserProfile = async () => {
  try {
    const response = await userApi.get('/me');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch profile',
    };
  }
};

export const updateUserProfile = async (data) => {
  try {
    const response = await userApi.put('/updatedetails', data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update profile',
    };
  }
};

export const updatePassword = async (data) => {
  try {
    const response = await userApi.put('/updatepassword', data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update password',
    };
  }
};

export const deleteUserAccount = async () => {
  try {
    const response = await userApi.delete('/me');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete account',
    };
  }
}; 