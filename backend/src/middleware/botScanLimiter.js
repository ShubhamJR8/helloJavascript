import { sendMetric } from '../utils/cloudwatch.js';

export default function botScanLimiter(req, res, next) {
  const userAgent = req.get('user-agent') || '';
  const botPattern = /bot|crawler|spider|crawling|scan|scanner|scrapy|python-requests|wget|curl|httpclient/i;

  // Allow health check endpoint
  if (req.path === '/health') {
    return next();
  }

  // Block if path does NOT start with /api OR User-Agent is missing or matches bot pattern
  if (
    !req.path.startsWith('/api/') ||
    !userAgent ||
    botPattern.test(userAgent)
  ) {
    sendMetric('BlockedBotOrInvalidPath', 1, 'Count', [{ Name: 'Type', Value: 'API' }]);
    return res.status(403).json({ message: 'Access denied.' });
  }

  next();
}