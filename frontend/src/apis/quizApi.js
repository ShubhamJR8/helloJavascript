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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
quizApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Start a new quiz attempt
export const startQuizAttempt = async (topic, difficulty) => {
  try {
    const response = await quizApi.post("/start", { topic, difficulty });

    // Check if all questions are mastered
    if (response.data.data?.mastered) {
      return {
        success: true,
        data: {
          mastered: true,
          topic: response.data.data.topic,
          difficulty: response.data.data.difficulty
        }
      };
    }

    // Validate response structure for normal quiz attempt
    if (!response.data.success || !response.data.attemptId || !response.data.data) {
      throw new Error("Invalid response data structure");
    }

    // Ensure questions are properly populated
    if (!response.data.data.questions || !Array.isArray(response.data.data.questions)) {
      throw new Error("Invalid questions data in response");
    }

    return {
      success: true,
      attemptId: response.data.attemptId,
      data: {
        questions: response.data.data.questions,
        totalQuestions: response.data.data.totalQuestions,
        topic: response.data.data.topic,
        difficulty: response.data.data.difficulty
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to start quiz attempt",
      error: error.message
    };
  }
};

// Complete a quiz attempt
export const completeQuizAttempt = async (attemptId, answers) => {
  try {
    const response = await quizApi.post("/complete", {
      attemptId,
      answers: answers.map(answer => ({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption || null,
        timeTaken: answer.timeTaken || 0
      }))
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to complete quiz attempt');
    }

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to complete quiz attempt',
      errors: error.response?.data?.errors || []
    };
  }
};

// Get quiz attempt details
export const getQuizAttemptDetails = async (attemptId) => {
  try {
    const response = await quizApi.get(`/${attemptId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch quiz attempt details',
    };
  }
};

export const fetchQuestionsByTopic = async (topic) => {
  try {
    const response = await quizApi.get(`/questions?topic=${topic}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get quiz analytics
export const getQuizAnalytics = async () => {
  try {
    const response = await quizApi.get("/analytics");
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch quiz analytics');
    }

    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch quiz analytics',
      data: []
    };
  }
};