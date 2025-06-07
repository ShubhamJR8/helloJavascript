import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./src/app.js";
import { sendMetric } from "./src/utils/cloudwatch.js";

dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  sendMetric('ServerStart', 1, 'Count', [
    { Name: 'Port', Value: PORT.toString() },
    { Name: 'Environment', Value: process.env.NODE_ENV || 'development' }
  ]);
}); 