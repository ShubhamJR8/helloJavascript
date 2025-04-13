import mongoose from "mongoose";
import QuizAttempt from "../models/QuizAttempt.js";
import Question from "../models/Question.js";

// Start or resume a quiz attempt
export const startQuizAttempt = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    const userId = req.user._id; // Get user ID from auth middleware
    
    console.log(`[START QUIZ ATTEMPT] User: ${userId}, Topic: ${topic}, Difficulty: ${difficulty}`);

    // Fetch existing completed attempts
    const previousAttempts = await QuizAttempt.find({ 
      user: userId, 
      topic, 
      status: "completed" 
    });

    // Collect all correctly answered questions from past attempts
    const correctQuestionIds = new Set();
    previousAttempts.forEach(attempt => {
      attempt.questions.forEach(q => {
        if (q.isCorrect) correctQuestionIds.add(q.questionId.toString());
      });
    });

    // Fetch new set of questions excluding correctly answered ones
    const newQuestions = await Question.find({ 
      topic, 
      difficulty, 
      _id: { $nin: Array.from(correctQuestionIds) } 
    }).limit(10); // Adjust limit as needed

    if (!newQuestions.length) {
      console.warn(`[NO QUESTIONS AVAILABLE] User ID: ${userId}`);
      return res.status(200).json({ 
        success: false, 
        message: "No new questions available" 
      });
    }

    // Check if there is an existing in-progress attempt
    let existingAttempt = await QuizAttempt.findOne({ 
      user: userId, 
      topic, 
      status: "in-progress" 
    });

    if (existingAttempt) {
      console.log(`[RESUMING ATTEMPT] Attempt ID: ${existingAttempt._id}`);
      return res.status(200).json({ 
        success: true, 
        attemptId: existingAttempt._id 
      });
    }

    // Create new attempt
    const newAttempt = new QuizAttempt({
      user: userId,
      topic,
      difficulty,
      questions: newQuestions.map(q => ({ 
        questionId: q._id, 
        isCorrect: false 
      })),
      totalQuestions: newQuestions.length,
    });

    await newAttempt.save();
    console.log(`[NEW ATTEMPT CREATED] Attempt ID: ${newAttempt._id}`);

    res.status(201).json({ 
      success: true, 
      attemptId: newAttempt._id 
    });
  } catch (error) {
    console.error(`[ERROR] Start Quiz Attempt:`, error);
    res.status(500).json({ 
      success: false, 
      message: "Error starting quiz attempt", 
      error: error.message 
    });
  }
};

// Complete quiz attempt
export const completeQuizAttempt = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    const userId = req.user._id;

    // Find the current quiz attempt
    const currentAttempt = await QuizAttempt.findById(attemptId);
    if (!currentAttempt) {
      return res.status(404).json({ 
        success: false, 
        message: "Quiz attempt not found" 
      });
    }

    // Verify user ownership
    if (currentAttempt.user.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to complete this attempt" 
      });
    }

    // Process submitted answers
    let correctAnswers = 0;
    let totalScore = 0;

    for (const answer of answers) {
      const question = currentAttempt.questions.find(
        q => q.questionId.toString() === answer.questionId
      );

      if (question) {
        question.selectedOption = answer.selectedOption;
        question.submittedCode = answer.submittedCode;
        question.isCorrect = answer.isCorrect;
        question.timeTaken = answer.timeTaken;

        if (answer.isCorrect) {
          correctAnswers++;
        }
      }
    }

    totalScore = (correctAnswers / currentAttempt.totalQuestions) * 100;

    // Update attempt status
    currentAttempt.correctAnswers = correctAnswers;
    currentAttempt.totalScore = totalScore;
    currentAttempt.status = "completed";
    currentAttempt.isSubmitted = true;
    currentAttempt.endTime = new Date();

    await currentAttempt.save();

    res.status(200).json({
      success: true,
      message: "Quiz attempt completed successfully",
      data: {
        attemptId: currentAttempt._id,
        totalScore,
        correctAnswers,
        totalQuestions: currentAttempt.totalQuestions
      }
    });
  } catch (error) {
    console.error(`[ERROR] Complete Quiz Attempt:`, error);
    res.status(500).json({ 
      success: false, 
      message: "Error completing quiz attempt", 
      error: error.message 
    });
  }
};

// Get user's quiz attempts
export const getUserQuizAttempts = async (req, res) => {
  try {
    const userId = req.user._id;
    const attempts = await QuizAttempt.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('questions.questionId', 'question type topic difficulty');

    res.status(200).json({
      success: true,
      data: attempts
    });
  } catch (error) {
    console.error(`[ERROR] Get User Quiz Attempts:`, error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching quiz attempts", 
      error: error.message 
    });
  }
};

// Get quiz attempt details
export const getQuizAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user._id;

    const attempt = await QuizAttempt.findById(attemptId)
      .populate('questions.questionId', 'question type topic difficulty options correctAnswer');

    if (!attempt) {
      return res.status(404).json({ 
        success: false, 
        message: "Quiz attempt not found" 
      });
    }

    // Verify user ownership
    if (attempt.user.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to view this attempt" 
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error(`[ERROR] Get Quiz Attempt Details:`, error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching quiz attempt details", 
      error: error.message 
    });
  }
};

// Get quiz analytics
export const getQuizAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const analytics = await QuizAttempt.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), status: "completed" } },
      {
        $group: {
          _id: "$topic",
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: "$totalScore" },
          highestScore: { $max: "$totalScore" },
          totalQuestions: { $sum: "$totalQuestions" },
          correctAnswers: { $sum: "$correctAnswers" }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error(`[ERROR] Get Quiz Analytics:`, error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching quiz analytics", 
      error: error.message 
    });
  }
};
