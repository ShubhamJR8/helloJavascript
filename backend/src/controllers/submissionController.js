import Submission from "../models/Submission.js";
import Question from "../models/Question.js";

// Submit an answer for MCQ or Coding Question
export const submitAnswer = async (req, res) => {
  try {
    const { userId, questionId, selectedOption, codeSubmission, language } = req.body;
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    let isCorrect = false;
    let testResults = [];
    let score = 0;

    if (question.type === "MCQ") {
      isCorrect = selectedOption === question.correctAnswer;
      score = isCorrect ? 1 : 0;
    } else if (question.type === "coding") {
      // Execute code against test cases (Logic to be implemented separately)
      testResults = await evaluateCode(codeSubmission, question.testCases, language);
      isCorrect = testResults.every((result) => result.passed);
      score = isCorrect ? 1 : 0;
    }

    const submission = new Submission({
      userId,
      questionId,
      selectedOption,
      codeSubmission,
      language,
      isCorrect,
      testResults,
      score,
    });

    await submission.save();
    res.status(201).json({ message: "Submission recorded", submission });
  } catch (error) {
    res.status(500).json({ message: "Error submitting answer", error });
  }
};

// Fetch submissions by user
export const getUserSubmissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const submissions = await Submission.find({ userId }).populate("questionId");
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submissions", error });
  }
};

// Fetch submission details
export const getSubmissionDetails = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await Submission.findById(submissionId).populate("questionId");
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submission details", error });
  }
};

// Placeholder function for evaluating coding solutions
const evaluateCode = async (code, testCases, language) => {
  // Logic for executing the user's code and comparing output with expected output
  return testCases.map((testCase) => ({
    input: testCase.input,
    expected: testCase.expectedOutput,
    passed: Math.random() > 0.5, // Simulated check (Replace with actual execution logic)
  }));
};
