// This script is used to check the questions in the database
import mongoose from 'mongoose';
import Question from '../src/models/Question.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const count = await Question.countDocuments();
    console.log('Total questions:', count);

    const questions = await Question.find({ topic: 'javascript', difficulty: 'easy' }).limit(5);
    console.log('Sample questions:', JSON.stringify(questions, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

checkQuestions(); 