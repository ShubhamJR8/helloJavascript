import axios from "axios";
import { API_BASE_URL } from '../config';

const quizApi = axios.create({
  baseURL: `${API_BASE_URL}/api/quiz-attempts`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
quizApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
quizApi.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url}`, {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error(`[API Error] ${error.config?.url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        data: error.config?.data
      }
    });
    return Promise.reject(error);
  }
);

// Start a new quiz attempt
export const startQuizAttempt = async (topic, difficulty) => {
  console.log('[Start Quiz Attempt] Request:', { topic, difficulty });
  try {
    const response = await quizApi.post("/start", { topic, difficulty });
    console.log('[Start Quiz Attempt] Success:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to start quiz attempt');
    }

    // Ensure the response has the required data structure
    if (!response.data.attemptId || !response.data.data || !response.data.data.questions) {
      throw new Error('Invalid response data structure');
    }

    return {
      success: true,
      attemptId: response.data.attemptId,
      data: response.data.data
    };
  } catch (error) {
    console.error('[Start Quiz Attempt] Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to start quiz attempt',
      error: error.message
    };
  }
};

// Complete a quiz attempt
export const completeQuizAttempt = async (attemptId, answers) => {
  console.log('[Complete Quiz Attempt] Request:', { attemptId, answers });
  try {
    const response = await quizApi.post("/complete", { attemptId, answers });
    console.log('[Complete Quiz Attempt] Success:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to complete quiz attempt');
    }

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('[Complete Quiz Attempt] Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to complete quiz attempt',
    };
  }
};

// Get quiz attempt details
export const getQuizAttemptDetails = async (attemptId) => {
  console.log('[Get Quiz Attempt Details] Request:', { attemptId });
  try {
    const response = await quizApi.get(`/${attemptId}`);
    console.log('[Get Quiz Attempt Details] Success:', response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('[Get Quiz Attempt Details] Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch quiz attempt details',
    };
  }
};

export const fetchQuestionsByTopic = async (topic) => {
  console.log('[Fetch Questions By Topic] Request:', { topic });
  try {
    const response = await quizApi.get(`/questions?topic=${topic}`);
    console.log('[Fetch Questions By Topic] Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[Fetch Questions By Topic] Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Get quiz analytics
export const getQuizAnalytics = async () => {
  try {
    const response = await quizApi.get("/analytics");
    console.log('[Get Quiz Analytics] Response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch quiz analytics');
    }

    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('[Get Quiz Analytics] Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch quiz analytics',
      data: []
    };
  }
};