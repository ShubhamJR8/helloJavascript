import mongoose from "mongoose";
import QuizAttempt from "../models/QuizAttempt.js";
import Question from "../models/Question.js";

// Start or resume a quiz attempt
export const startQuizAttempt = async (req, res) => {
  try {
    const { userId, topic, difficulty } = req.body;
    console.log(`[START QUIZ ATTEMPT] User: ${userId}, Topic: ${topic}, Difficulty: ${difficulty}`);

    // Fetch existing completed attempts
    const previousAttempts = await QuizAttempt.find({ userId, topic, status: "completed" });

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
      return res.status(200).json({ success: false, message: "No new questions available" });
    }

    // Check if there is an existing in-progress attempt
    let existingAttempt = await QuizAttempt.findOne({ userId, topic, status: "in-progress" });

    if (existingAttempt) {
      console.log(`[RESUMING ATTEMPT] Attempt ID: ${existingAttempt._id}`);
      return res.status(200).json({ success: true, attemptId: existingAttempt._id });
    }

    // If no in-progress attempt, create a new one but mix with previous data
    const newAttempt = new QuizAttempt({
      userId,
      topic,
      difficulty,
      questions: newQuestions.map(q => ({ questionId: q._id, isCorrect: false })),
      totalQuestions: newQuestions.length,
    });

    await newAttempt.save();
    console.log(`[NEW ATTEMPT CREATED] Attempt ID: ${newAttempt._id}`);

    res.status(201).json({ success: true, attemptId: newAttempt._id });
  } catch (error) {
    console.error(`[ERROR] Start Quiz Attempt:`, error);
    res.status(500).json({ success: false, message: "Error starting quiz attempt", error });
  }
};

// Submit quiz answers at the end (fewer API calls)
export const completeQuizAttempt = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    // Find the current quiz attempt
    const currentAttempt = await QuizAttempt.findById(attemptId);
    if (!currentAttempt) {
      return res.status(404).json({ success: false, message: "Quiz attempt not found" });
    }

    // Process submitted answers
    let correctAnswers = 0;
    let totalScore = 0;
    currentAttempt.questions.forEach((q) => {
      const submittedAnswer = answers.find((a) => a.questionId === q.questionId.toString());
      if (submittedAnswer) {
        q.submittedCode = submittedAnswer.submittedCode || null;
        q.language = submittedAnswer.language || null;
        q.isCorrect = submittedAnswer.isCorrect;
        q.timeTaken = submittedAnswer.timeTaken || 0;
        if (q.isCorrect) correctAnswers++;
      }
    });

    totalScore = correctAnswers * 10; // Assuming each question carries 10 points

    // Update current attempt status
    currentAttempt.correctAnswers = correctAnswers;
    currentAttempt.totalScore = totalScore;
    currentAttempt.status = "completed";
    currentAttempt.isSubmitted = true;
    currentAttempt.endTime = new Date();

    await currentAttempt.save();

    // 🔹 Send response before merging to avoid delays
    res.status(200).json({
      success: true,
      message: "Quiz attempt completed successfully",
      attemptId: currentAttempt._id,
      totalScore: currentAttempt.totalScore,
      correctAnswers: currentAttempt.correctAnswers,
    });

    // 🔄 Process merging in background if it's NOT the first attempt
    process.nextTick(async () => {
      try {
        const previousAttempt = await QuizAttempt.findOne({
          userId: currentAttempt.userId,
          topic: currentAttempt.topic,
          difficulty: currentAttempt.difficulty,
          _id: { $ne: attemptId }, // Exclude the current attempt
          isSubmitted: true,
        });

        if (previousAttempt) {
          console.log("Previous Attempt Found: Merging...");

          // Merge correct answers and score
          currentAttempt.correctAnswers += previousAttempt.correctAnswers;
          currentAttempt.totalScore += previousAttempt.totalScore;

          // Ensure unique questionIds (prevent duplicates)
          const existingQuestionIds = new Set(currentAttempt.questions.map((q) => q.questionId.toString()));
          previousAttempt.questions.forEach((prevQ) => {
            if (!existingQuestionIds.has(prevQ.questionId.toString())) {
              currentAttempt.questions.push(prevQ);
            }
          });

          await currentAttempt.save();

          // Delete the previous attempt
          await QuizAttempt.deleteOne({ _id: previousAttempt._id });
          console.log("Previous Attempt Deleted Successfully");
        } else {
          console.log("No Previous Attempt Found: Skipping Merge");
        }
      } catch (mergeError) {
        console.error("Error Merging Attempts:", mergeError);
      }
    });

  } catch (error) {
    console.error("[ERROR] Completing Quiz Attempt:", error);
    res.status(500).json({ success: false, message: "Error completing quiz attempt" });
  }
};

// Get all quiz attempts for a user
export const getUserQuizAttempts = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`[FETCH USER ATTEMPTS] User ID: ${userId}`);

    const attempts = await QuizAttempt.find({ userId }).sort({ startTime: -1 });
    console.log(`[ATTEMPTS FOUND] User ID: ${userId}, Total Attempts: ${attempts.length}`);

    res.status(200).json({ success: true, attempts });
  } catch (error) {
    console.error(`[ERROR] Fetch User Attempts:`, error);
    res.status(500).json({ success: false, message: "Error fetching user attempts", error });
  }
};

// Get quiz analytics (global + user-specific)
export const getQuizAnalytics = async (req, res) => {
  try {
    let { userId, topic, difficulty } = req.query;
    console.log(`[FETCH QUIZ ANALYTICS] userId: ${userId}, Topic: ${topic}, Difficulty: ${difficulty}`);

    // Convert userId to ObjectId if provided
    const matchQuery = { status: "completed" };
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid userId format" });
      }
      matchQuery.userId = new mongoose.Types.ObjectId(userId);
    }
    if (topic) matchQuery.topic = topic;
    if (difficulty) matchQuery.difficulty = difficulty;

    const analytics = await QuizAttempt.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$userId",
          totalScore: { $sum: "$totalScore" },
          totalQuestions: { $sum: "$totalQuestions" },
          correctAnswers: { $sum: "$correctAnswers" },
          totalAttempts: { $sum: 1 },
        },
      },
      { $sort: { totalScore: -1 } },
    ]);

    console.log(`[ANALYTICS FETCHED] userId: ${userId}, Topic: ${topic}, Difficulty: ${difficulty}`);
    res.status(200).json({ success: true, analytics });
  } catch (error) {
    console.error(`[ERROR] Fetch Quiz Analytics:`, error);
    res.status(500).json({ success: false, message: "Error fetching quiz analytics", error });
  }
};

// Get details of a specific quiz attempt
export const getQuizAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    console.log(`[FETCH ATTEMPT DETAILS] Attempt ID: ${attemptId}`);

    const attempt = await QuizAttempt.findById(attemptId).populate("questions.questionId");
    if (!attempt) {
      console.warn(`[WARNING] Attempt not found: ${attemptId}`);
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }

    console.log(`[ATTEMPT DETAILS FETCHED] Attempt ID: ${attemptId}`);
    res.status(200).json({ success: true, attempt });
  } catch (error) {
    console.error(`[ERROR] Fetch Attempt Details:`, error);
    res.status(500).json({ success: false, message: "Error fetching attempt details", error });
  }
}; 