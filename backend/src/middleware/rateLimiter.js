import rateLimit from 'express-rate-limit';
import { sendMetric } from '../utils/cloudwatch.js';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 25, // limit each IP to 25 requests/minute
  handler: (req, res) => {
    sendMetric('RateLimitBlocked', 1, 'Count');
    res.status(429).json({ message: 'Too many requests, please try again later.' });
  }
});

export default limiter;