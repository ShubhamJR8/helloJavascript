import rateLimit from 'express-rate-limit';
import { sendMetric } from '../utils/cloudwatch.js';

// General rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Increased from 25 to 100 for development
  handler: (req, res) => {
    sendMetric('RateLimitBlocked', 1, 'Count');
    res.status(429).json({ message: 'Too many requests, please try again later.' });
  }
});

// Rate limiter for blog routes (more lenient)
const blogLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 150, // More lenient for blog operations
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    sendMetric('BlogRateLimitBlocked', 1, 'Count');
    res.status(429).json({ 
      message: 'Too many blog requests. Please wait a moment before trying again.',
      retryAfter: Math.ceil(60 / 150), // seconds
      error: 'BLOG_RATE_LIMIT_EXCEEDED'
    });
  },
  // Custom key generator to be more specific
  keyGenerator: (req) => {
    return `${req.ip}-blog-${req.path}`; // IP + blog endpoint specific
  }
});

// Blog search rate limiter (stricter)
const blogSearchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 searches per minute per IP
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    sendMetric('BlogSearchRateLimitBlocked', 1, 'Count');
    res.status(429).json({
      message: 'Too many blog searches. Please slow down and try again in a minute.',
      retryAfter: 60 / 20, // seconds
      error: 'BLOG_SEARCH_RATE_LIMIT_EXCEEDED'
    });
  },
  // Custom key generator to be more specific
  keyGenerator: (req) => {
    return `${req.ip}-blogsearch`;
  }
});

// Specific rate limiter for job searches (more lenient)
const jobSearchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // Increased from 30 to 50 for development
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
  handler: (req, res) => {
    sendMetric('JobSearchRateLimitBlocked', 1, 'Count');
    res.status(429).json({ 
      message: 'Too many job search requests. Please wait a moment before searching again.',
      retryAfter: Math.ceil(60 / 50), // seconds
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
  max: 30, // Increased from 15 to 30 for development
  handler: (req, res) => {
    sendMetric('AdminRateLimitBlocked', 1, 'Count');
    res.status(429).json({ 
      message: 'Too many admin requests. Please wait before trying again.',
      error: 'ADMIN_RATE_LIMIT_EXCEEDED'
    });
  }
});

export default limiter;
export { jobSearchLimiter, adminLimiter, blogLimiter, blogSearchLimiter };