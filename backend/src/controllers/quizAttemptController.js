import mongoose from "mongoose";
import QuizAttempt from "../models/QuizAttempt.js";
import Question from "../models/Question.js";

// Start or resume a quiz attempt
export const startQuizAttempt = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    const userId = req.user._id; // Get user ID from auth middleware
    
    console.log(`[START QUIZ ATTEMPT] User: ${userId}, Topic: ${topic}, Difficulty: ${difficulty}`);

    // Check if there is an existing in-progress attempt
    let existingAttempt = await QuizAttempt.findOne({ 
      user: userId, 
      topic, 
      status: "in-progress" 
    }).populate('questions.questionId');

    if (existingAttempt) {
      console.log(`[RESUMING ATTEMPT] Attempt ID: ${existingAttempt._id}`);
      return res.status(200).json({ 
        success: true, 
        attemptId: existingAttempt._id,
        data: existingAttempt
      });
    }

    // Fetch all questions for the topic and difficulty
    const allQuestions = await Question.find({ 
      topic, 
      difficulty
    });

    if (!allQuestions.length) {
      console.warn(`[NO QUESTIONS AVAILABLE] Topic: ${topic}, Difficulty: ${difficulty}`);
      return res.status(404).json({ 
        success: false, 
        message: "No questions available for this topic and difficulty" 
      });
    }

    // Shuffle questions using Fisher-Yates algorithm
    const shuffledQuestions = [...allQuestions];
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
    console.log(`[NEW ATTEMPT CREATED] Attempt ID: ${newAttempt._id}`);

    // Populate the questions before sending response
    const populatedAttempt = await QuizAttempt.findById(newAttempt._id)
      .populate('questions.questionId');

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
    
    console.log(`[COMPLETE QUIZ ATTEMPT] User: ${userId}, Attempt: ${attemptId}, Answers count: ${answers.length}`);

    // Find the current quiz attempt with populated question data
    const currentAttempt = await QuizAttempt.findById(attemptId)
      .populate('questions.questionId');
      
    if (!currentAttempt) {
      console.warn(`[ATTEMPT NOT FOUND] Attempt ID: ${attemptId}`);
      return res.status(404).json({ 
        success: false, 
        message: "Quiz attempt not found" 
      });
    }

    // Verify user ownership
    if (currentAttempt.user.toString() !== userId.toString()) {
      console.warn(`[UNAUTHORIZED] User ${userId} trying to complete attempt ${attemptId} owned by ${currentAttempt.user}`);
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to complete this attempt" 
      });
    }

    // Process submitted answers
    let correctAnswers = 0;
    let totalScore = 0;
    
    console.log(`[VALIDATING ANSWERS] Processing ${answers.length} answers`);

    for (const answer of answers) {
      const questionIndex = currentAttempt.questions.findIndex(
        q => q.questionId._id.toString() === answer.questionId
      );

      if (questionIndex >= 0) {
        const question = currentAttempt.questions[questionIndex];
        const questionData = question.questionId;
        
        // Store the user's answer
        question.selectedOption = answer.selectedOption;
        question.submittedCode = answer.submittedCode || "";
        question.timeTaken = answer.timeTaken || 0;
        
        // Compare with correct answer
        let isCorrect = false;
        
        if (questionData.type === 'MCQ') {
          // For MCQ questions, check if selected option matches the correct answer
          console.log(`[VALIDATING MCQ] Question: ${questionData._id}, Selected: ${answer.selectedOption}, Correct: ${questionData.correctAnswer}`);
          isCorrect = (answer.selectedOption === questionData.correctAnswer);
        } else if (questionData.type === 'coding') {
          // For coding questions, you would run test cases
          // This is a placeholder until you implement code execution
          isCorrect = false;
        }
        
        // Update the isCorrect field
        question.isCorrect = isCorrect;
        
        if (isCorrect) {
          correctAnswers++;
          console.log(`[CORRECT ANSWER] Question: ${questionData._id}`);
        } else {
          console.log(`[INCORRECT ANSWER] Question: ${questionData._id}, Selected: ${answer.selectedOption}, Correct: ${questionData.correctAnswer}`);
        }
        
        // Update the questions array
        currentAttempt.questions[questionIndex] = question;
      } else {
        console.warn(`[QUESTION NOT FOUND] Question ID: ${answer.questionId}`);
      }
    }

    totalScore = (correctAnswers / currentAttempt.totalQuestions) * 100;
    
    console.log(`[SCORING] Correct Answers: ${correctAnswers}/${currentAttempt.totalQuestions}, Score: ${totalScore.toFixed(2)}%`);

    // Update attempt status
    currentAttempt.correctAnswers = correctAnswers;
    currentAttempt.totalScore = totalScore;
    currentAttempt.status = "completed";
    currentAttempt.isSubmitted = true;
    currentAttempt.endTime = new Date();

    await currentAttempt.save();
    console.log(`[ATTEMPT COMPLETED] Attempt ID: ${currentAttempt._id}`);

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

    console.log('[ANALYTICS] User:', userId, 'Data:', analytics);

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
