import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendMetric } from '../utils/cloudwatch.js';
import { logger } from '../utils/logger.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      logger.warn('Unauthorized access attempt', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      sendMetric('UnauthorizedAccessAttempt', 1, 'Count');

      return res.status(401).json({ message: 'Not authorized, please login' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      logger.error('Token verification failed', {
        error: error.message,
        token,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
      sendMetric('TokenVerificationFailed', 1, 'Count');
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    logger.error('Auth middleware error', {
      error: error.message,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    sendMetric('AuthMiddlewareError', 1, 'Count');
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 