import axios from "axios";
import { API_BASE_URL } from '../config';

// Centralized error handler
const handleError = (error, defaultValue = null) => {
  console.error("API Error:", error.response?.data?.message || error.message);
  return defaultValue;
};

// Fetch questions by topic
export const fetchQuestionsByTopic = async (topic) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/questions`, { params: { topic } });
    return response.data;
  } catch (error) {
    return handleError(error, { questions: [] });
  }
};

// Add a new question
export const addQuestion = async (questionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/questions`, questionData);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Delete a question
export const deleteQuestion = async (questionId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/questions/${questionId}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};
