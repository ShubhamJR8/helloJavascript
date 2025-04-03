import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/questions";

export const fetchQuestionsByTopic = async (topic) => {
  try {
    const response = await axios.get(`${API_BASE_URL}?topic=${topic}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return { questions: [] };
  }
};

export const addQuestion = async (questionData) => {
  try {
    const response = await axios.post(API_BASE_URL, questionData);
    return response.data;
  } catch (error) {
    console.error("Error adding question:", error);
    return null;
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting question:", error);
    return null;
  }
};
