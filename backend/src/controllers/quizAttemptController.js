import mongoose from "mongoose";
import QuizAttempt from "../models/QuizAttempt.js";
import Question from "../models/Question.js";

// Start or resume a quiz attempt
export const startQuizAttempt = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    const userId = req.user._id; // Get user ID from auth middleware
    
    // Check if there is an existing in-progress attempt
    let existingAttempt = await QuizAttempt.findOne({ 
      user: userId, 
      topic, 
      status: "in-progress" 
    }).populate('questions.questionId');

    if (existingAttempt) {
      return res.status(200).json({ 
        success: true, 
        attemptId: existingAttempt._id,
        data: existingAttempt
      });
    }

    // Get all completed attempts for this user, topic, and difficulty
    const completedAttempts = await QuizAttempt.find({
      user: userId,
      topic,
      difficulty,
      status: "completed"
    }).populate('questions.questionId');

    // Create a set of question IDs that were answered correctly
    const correctlyAnsweredQuestionIds = new Set();
    completedAttempts.forEach(attempt => {
      attempt.questions.forEach(q => {
        if (q.isCorrect) {
          correctlyAnsweredQuestionIds.add(q.questionId._id.toString());
        }
      });
    });

    // Fetch all questions for the topic and difficulty
    const allQuestions = await Question.find({ 
      topic, 
      difficulty
    });

    if (!allQuestions.length) {
      return res.status(404).json({ 
        success: false, 
        message: "No questions available for this topic and difficulty" 
      });
    }

    // Filter out questions that were already answered correctly
    const availableQuestions = allQuestions.filter(q => 
      !correctlyAnsweredQuestionIds.has(q._id.toString())
    );

    if (availableQuestions.length === 0) {
      return res.status(200).json({ 
        success: true,
        attemptId: null,
        data: {
          questions: [],
          totalQuestions: 0,
          mastered: true,
          topic,
          difficulty
        }
      });
    }

    // Shuffle questions using Fisher-Yates algorithm
    const shuffledQuestions = [...availableQuestions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }

    // Select first 10 questions (or less if not enough available)
    const selectedQuestions = shuffledQuestions.slice(0, Math.min(10, shuffledQuestions.length));

    // Create new attempt
    const newAttempt = new QuizAttempt({
      user: userId,
      topic,
      difficulty,
      questions: selectedQuestions.map(q => ({ 
        questionId: q._id
      })),
      totalQuestions: selectedQuestions.length,
      status: "in-progress"
    });

    await newAttempt.save();

    // Populate the questions before sending response
    const populatedAttempt = await QuizAttempt.findById(newAttempt._id)
      .populate({
        path: 'questions.questionId',
        select: 'question type topic difficulty options correctAnswer tags timeLimit'
      });

    res.status(201).json({ 
      success: true, 
      attemptId: newAttempt._id,
      data: populatedAttempt
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

    const currentAttempt = await QuizAttempt.findById(attemptId)
      .populate('questions.questionId');

    if (!currentAttempt) {
      return res.status(404).json({ success: false, message: "Quiz attempt not found" });
    }

    if (currentAttempt.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to complete this attempt" });
    }

    let correctAnswers = 0;

    for (const answer of answers) {
      const index = currentAttempt.questions.findIndex(
        q => q.questionId._id.toString() === answer.questionId
      );

      if (index >= 0) {
        const q = currentAttempt.questions[index];
        const qData = q.questionId;

        q.selectedOption = answer.selectedOption;
        q.submittedCode = answer.submittedCode || "";
        q.timeTaken = answer.timeTaken || 0;

        if (qData.type === 'MCQ') {
          q.isCorrect = (answer.selectedOption === qData.correctAnswer);
        } else {
          q.isCorrect = false; // handle coding separately
        }

        if (q.isCorrect) correctAnswers++;
        currentAttempt.questions[index] = q;
      }
    }

    currentAttempt.correctAnswers = correctAnswers;
    currentAttempt.totalQuestions = currentAttempt.questions.length;
    currentAttempt.totalScore = (correctAnswers / (currentAttempt.totalQuestions || 1)) * 100;
    currentAttempt.status = "completed";
    currentAttempt.isSubmitted = true;
    currentAttempt.endTime = new Date();

    // Get existing attempts to merge
    const existingCompletedAttempts = await QuizAttempt.find({
      user: userId,
      topic: currentAttempt.topic,
      difficulty: currentAttempt.difficulty,
      status: "completed",
      _id: { $ne: currentAttempt._id }
    });

    let wasMerged = false;

    for (const existingAttempt of existingCompletedAttempts) {
      const existingIds = new Set(
        existingAttempt.questions.map(q => q.questionId.toString())
      );

      const newCorrectQs = currentAttempt.questions.filter(
        q => q.isCorrect && !existingIds.has(q.questionId._id.toString())
      );

      if (newCorrectQs.length > 0) {
        for (const newQ of newCorrectQs) {
          existingAttempt.questions.push({
            questionId: newQ.questionId._id,
            isCorrect: true,
            selectedOption: newQ.selectedOption,
            submittedCode: newQ.submittedCode,
            timeTaken: newQ.timeTaken
          });
        }

        // ❗ Fix: Increment total attempted questions by all attempted, not just correct ones
        existingAttempt.totalQuestions += currentAttempt.questions.length;

        existingAttempt.correctAnswers = existingAttempt.questions.filter(q => q.isCorrect).length;
        existingAttempt.totalScore = (existingAttempt.correctAnswers / (existingAttempt.totalQuestions || 1)) * 100;

        await existingAttempt.save();
        wasMerged = true;
      }
    }

    if (!wasMerged) {
      currentAttempt.questions = currentAttempt.questions.filter(q => q.isCorrect);
      currentAttempt.totalQuestions = currentAttempt.questions.length;
      currentAttempt.correctAnswers = currentAttempt.questions.length;
      currentAttempt.totalScore = (currentAttempt.correctAnswers / (currentAttempt.totalQuestions || 1)) * 100;
    }

    await currentAttempt.save();

    res.status(200).json({
      success: true,
      message: "Quiz attempt completed successfully",
      data: {
        attemptId: currentAttempt._id,
        totalScore: currentAttempt.totalScore,
        correctAnswers: currentAttempt.correctAnswers,
        totalQuestions: currentAttempt.totalQuestions
      }
    });

    if (wasMerged) {
      setImmediate(async () => {
        try {
          await QuizAttempt.findByIdAndDelete(currentAttempt._id);
        } catch (err) {
          console.error(`[DELETE ERROR] ${currentAttempt._id}`, err);
        }
      });
    }

  } catch (error) {
    console.error(`[ERROR] Complete Quiz Attempt:`, error);
    res.status(500).json({ success: false, message: "Error completing quiz attempt", error: error.message });
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
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(userId),
          status: "completed"
        } 
      },
      {
        $group: {
          _id: "$topic",
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: "$totalScore" },
          highestScore: { $max: "$totalScore" },
          totalQuestions: { $sum: "$totalQuestions" },
          correctAnswers: { $sum: "$correctAnswers" },
          totalTimeTaken: { $sum: { $subtract: ["$endTime", "$startTime"] } }
        }
      },
      {
        $project: {
          _id: 1,
          totalAttempts: 1,
          averageScore: { $round: ["$averageScore", 2] },
          highestScore: { $round: ["$highestScore", 2] },
          totalQuestions: 1,
          correctAnswers: 1,
          successRate: {
            $round: [
              { $multiply: [{ $divide: ["$correctAnswers", "$totalQuestions"] }, 100] },
              2
            ]
          },
          averageTimePerQuestion: {
            $round: [
              { $divide: [{ $divide: ["$totalTimeTaken", 1000] }, "$totalQuestions"] },
              2
            ]
          }
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
