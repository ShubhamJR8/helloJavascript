import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// will change to userId, topic, difficulty
export const startQuizAttempt = async (topic, difficulty, userId) => {
  const response = await api.post("/quiz-attempts/start", { topic, difficulty, userId });
  return response.data;
};

export const completeQuizAttempt = async (attemptId, answers) => {
  const response = await api.post("/quiz-attempts/complete", { attemptId, answers });
  return response.data;
};

export const getQuizAttemptDetails = async (attemptId) => {
  const response = await api.get(`/quiz-attempts/${attemptId}`);
  return response.data;
};

export const fetchQuestionsByTopic = async (topic) => {
  const response = await api.get(`/questions?topic=${topic}`);
  return response.data;
};

export const getQuizAnalytics = async (userId, topic, difficulty) => {
  const response = await api.get("/quiz-attempts/analytics", { params: { userId, topic, difficulty } });
  return response.data;
};