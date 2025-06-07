import dotenv from "dotenv";
import winston from 'winston';
import { CloudWatchLogsClient, PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';

dotenv.config();

if (!process.env.AWS_REGION) {
  throw new Error('AWS_REGION or CLOUDWATCH_LOG_STREAM environment variable is not set');
}

const cloudwatchLogs = new CloudWatchLogsClient({ region: process.env.AWS_REGION });

const sendLogToCloudWatch = async (logGroupName, logStreamName, message) => {
  const params = {
    logGroupName,
    logStreamName,
    logEvents: [
      {
        message: JSON.stringify(message),
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await cloudwatchLogs.send(new PutLogEventsCommand(params));
    console.log(`Log sent to CloudWatch: ${message}`);
  } catch (err) {
    console.error('Error sending log to CloudWatch', { 
      logGroupName, 
      logStreamName, 
      error: err.message 
    });
  }
};

// Initialize Winston Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add CloudWatch transport
class CloudWatchTransport extends winston.Transport {
  log(info, callback) {
    sendLogToCloudWatch('prep-js-backend-logs', process.env.CLOUDWATCH_LOG_STREAM || 'application-log-stream', info);
    callback();
  }
}

logger.add(new CloudWatchTransport());

// Add console logging for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Export logger and metric functions
export { logger };