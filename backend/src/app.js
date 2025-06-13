import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jobRoutes from './routes/jobRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import quizAttemptRoutes from './routes/quizAttemptRoutes.js';
import { sendMetric } from './utils/cloudwatch.js';
import { logger } from './utils/logger.js';

const app = express();

app.use((req, res, next) => {
  sendMetric('RequestCount', 1, 'Count', [{ Name: 'Endpoint', Value: req.originalUrl }]);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  sendMetric('UnhandledError', 1, 'Count');

  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

export default app;
