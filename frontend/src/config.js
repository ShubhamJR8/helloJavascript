// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// JWT Configuration
export const JWT_EXPIRE = '30d';

// Quiz Configuration
export const QUIZ_CONFIG = {
  maxQuestions: 10,
  timeLimit: 30, // minutes
  passingScore: 70, // percentage
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  dateRange: {
    default: '30d', // 30 days
    options: ['7d', '30d', '90d', 'all'],
  },
}; 