import dotenv from "dotenv";
import { CloudWatchClient, PutMetricDataCommand }  from "@aws-sdk/client-cloudwatch";

dotenv.config();

const AWS_REGION = process.env.AWS_REGION || "ap-south-1";

if (AWS_REGION.length === 0) {
  throw new Error('AWS_REGION environment variable is not set');
}

const cloudwatch = new CloudWatchClient({ region: AWS_REGION });

const sendMetric = async (metricName, value, unit = 'Count', dimensions = []) => {
  const params = {
    Namespace: 'prep-js-backend',
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Dimensions: dimensions,
      },
    ],
  };

  try {
    await cloudwatch.send(new PutMetricDataCommand(params));
    console.log(`Metric sent: ${metricName} = ${value}`);
  } catch (err) {
    console.error('Error sending metric to CloudWatch', {
      metricName,
      value,
      error: err.message,
    });
  }
};

export { sendMetric };