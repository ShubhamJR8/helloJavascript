import rateLimit from 'express-rate-limit';
import { sendMetric } from '../utils/cloudwatch.js';

// General rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 25, // limit each IP to 25 requests/minute
  handler: (req, res) => {
    sendMetric('RateLimitBlocked', 1, 'Count');
    res.status(429).json({ message: 'Too many requests, please try again later.' });
  }
});

// Specific rate limiter for job searches (more lenient)
const jobSearchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Reduced from 50 to 30 for better protection
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
  handler: (req, res) => {
    sendMetric('JobSearchRateLimitBlocked', 1, 'Count');
    res.status(429).json({ 
      message: 'Too many job search requests. Please wait a moment before searching again.',
      retryAfter: Math.ceil(60 / 30), // seconds
      error: 'RATE_LIMIT_EXCEEDED'
    });
  },
  // Custom key generator to be more specific
  keyGenerator: (req) => {
    return `${req.ip}-${req.path}`; // IP + endpoint specific
  }
});

// Rate limiter for admin operations (stricter)
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // More strict for admin operations
  handler: (req, res) => {
    sendMetric('AdminRateLimitBlocked', 1, 'Count');
    res.status(429).json({ 
      message: 'Too many admin requests. Please wait before trying again.',
      error: 'ADMIN_RATE_LIMIT_EXCEEDED'
    });
  }
});

export default limiter;
export { jobSearchLimiter, adminLimiter };