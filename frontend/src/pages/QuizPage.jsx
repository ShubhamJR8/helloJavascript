import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { completeQuizAttempt, getQuizAttemptDetails, startQuizAttempt } from "../apis/quizApi";
import { motion } from "framer-motion";
import { Alert, CircularProgress, Typography } from "@mui/material";

// Constants for validation
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

const QuizPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { topic, difficulty } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const timerRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  // Validate quiz parameters
  const validateQuizParams = () => {
    if (!topic) {
      throw new Error("Topic is required");
    }
    if (!difficulty || !VALID_DIFFICULTIES.includes(difficulty)) {
      throw new Error(`Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
    }
  };

  // Auto-save progress
  const autoSaveProgress = () => {
    if (attemptId && questions.length > 0) {
      const progress = {
        attemptId,
        currentIndex,
        selectedAnswers,
        timeLeft,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(`quiz_progress_${attemptId}`, JSON.stringify(progress));
    }
  };

  // Load saved progress
  const loadSavedProgress = (savedAttemptId) => {
    const savedProgress = localStorage.getItem(`quiz_progress_${savedAttemptId}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCurrentIndex(progress.currentIndex);
      setSelectedAnswers(progress.selectedAnswers);
      setTimeLeft(progress.timeLeft);
      return true;
    }
    return false;
  };

  // Retry mechanism for API calls
  const retryOperation = async (operation, maxRetries = MAX_RETRY_ATTEMPTS) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
        }
      }
    }
    throw lastError;
  };

  useEffect(() => {
    const fetchAttemptAndQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        validateQuizParams();

        // Get the attempt ID from location state or create a new attempt
        let attemptId = location.state?.attemptId;
        let attemptData = location.state?.data;
        
        if (!attemptId || !attemptData) {
          // Create a new quiz attempt with retry mechanism
          const startResponse = await retryOperation(async () => {
            const response = await startQuizAttempt(topic, difficulty);
            if (!response.success) {
              throw new Error(response.message || "Failed to start quiz attempt");
            }
            return response;
          });

          attemptId = startResponse.attemptId;
          attemptData = startResponse.data;
          setIsShuffled(true); // Indicate that questions are shuffled for new attempts

          // Clear any old progress
          localStorage.removeItem(`quiz_progress_${attemptId}`);
        } else {
          // Try to load saved progress
          loadSavedProgress(attemptId);
          setIsShuffled(false); // Questions are not shuffled for resumed attempts
        }

        // Validate attempt data
        if (!attemptData || !attemptData.questions || !Array.isArray(attemptData.questions)) {
          console.error('Invalid attempt data:', attemptData);
          throw new Error("Invalid quiz attempt data: missing or invalid questions");
        }

        // Ensure questions are populated with proper validation
        const populatedQuestions = attemptData.questions.map(q => {
          if (!q.questionId || !q.questionId._id) {
            throw new Error("Invalid question data: missing question ID");
          }
          if (!q.questionId.question) {
            throw new Error("Invalid question data: missing question text");
          }
          if (q.questionId.type === 'mcq' && (!q.questionId.options || !Array.isArray(q.questionId.options))) {
            throw new Error("Invalid question data: MCQ questions must have options array");
          }
          return {
            id: q.questionId._id,
            question: q.questionId.question,
            options: q.questionId.options || [],
            timeLimit: q.questionId.timeLimit || 30,
            type: q.questionId.type || 'mcq',
            correctAnswer: q.questionId.correctAnswer
          };
        });

        if (populatedQuestions.length === 0) {
          throw new Error("No questions available for this quiz");
        }

        setAttemptId(attemptId);
        setQuestions(populatedQuestions);

        // Set up auto-save
        autoSaveTimerRef.current = setInterval(autoSaveProgress, 30000); // Auto-save every 30 seconds

      } catch (error) {
        console.error("Error in fetchAttemptAndQuestions:", error);
        setError(error.message || "Failed to load quiz");
        if (retryCount < MAX_RETRY_ATTEMPTS) {
          setRetryCount(prev => prev + 1);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptAndQuestions();

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [location.state, topic, difficulty, retryCount]);

  useEffect(() => {
    if (questions.length > 0) {
      const currentQ = questions[currentIndex];
      setTimeLeft(currentQ?.timeLimit || 30);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleNext, (currentQ?.timeLimit || 30) * 1000);
    }

    return () => clearTimeout(timerRef.current);
  }, [currentIndex, questions]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: answer };
      // Auto-save on answer change
      if (attemptId) {
        const progress = {
          attemptId,
          currentIndex,
          selectedAnswers: newAnswers,
          timeLeft,
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem(`quiz_progress_${attemptId}`, JSON.stringify(progress));
      }
      return newAnswers;
    });
    clearTimeout(timerRef.current);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      try {
        setLoading(true);
        setError(null);

        // Validate all questions are answered
        const unansweredQuestions = questions.filter(
          q => !selectedAnswers[q.id] && q.type === 'mcq'
        );
        if (unansweredQuestions.length > 0) {
          throw new Error(`Please answer all questions before submitting. Unanswered questions: ${unansweredQuestions.length}`);
        }

        // Transform selectedAnswers into array format with validation
        const transformedAnswers = questions.map(q => {
          const answer = selectedAnswers[q.id];
          if (!answer && q.type === 'mcq') {
            throw new Error(`Missing answer for question: ${q.question}`);
          }
          return {
            questionId: q.id,
            selectedOption: answer,
            submittedCode: q.type === 'coding' ? answer : "",
            timeTaken: q.timeLimit - timeLeft || 0
          };
        });

        // Submit with retry mechanism
        const response = await retryOperation(async () => {
          const result = await completeQuizAttempt(attemptId, transformedAnswers);
          if (!result.success) {
            throw new Error(result.message || "Failed to submit quiz");
          }
          return result;
        });

        // Clear saved progress
        localStorage.removeItem(`quiz_progress_${attemptId}`);
        
        // Navigate to result page with the response data
        navigate(`/result/${response.data.attemptId}`, {
          state: {
            totalScore: response.data.totalScore,
            correctAnswers: response.data.correctAnswers,
            totalQuestions: response.data.totalQuestions,
            attemptId: response.data.attemptId,
            topic: topic,
            difficulty: difficulty,
            questions: questions.map(q => ({
              ...q,
              userAnswer: selectedAnswers[q.id]
            }))
          },
        });
      } catch (error) {
        console.error("Error submitting quiz:", error);
        setError(error.message || "Failed to submit quiz");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
        <div className="bg-gray-800 p-6 rounded-xl text-center">
          <p className="text-xl">No questions available.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-teal-400 mb-8"
      >
        Quiz
      </motion.h1>

      {isShuffled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-teal-500/10 border border-teal-500 rounded-lg p-4 mb-6 text-center"
        >
          <p className="text-teal-400">Questions are randomly selected and shuffled for this attempt.</p>
        </motion.div>
      )}

      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-400">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-red-400 font-bold">
            Time Left: {timeLeft}s
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-gray-800 rounded-xl shadow-lg"
        >
          <h2 className="text-2xl font-semibold mb-6">{currentQ.question}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswerSelect(currentQ.id, option)}
                className={`p-4 rounded-lg font-semibold transition-all duration-300 text-lg text-center shadow-md ${
                  selectedAnswers[currentQ.id] === option
                    ? "bg-teal-500"
                    : "bg-gray-700 hover:bg-teal-600"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-teal-500 text-white text-lg font-semibold rounded-lg hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedAnswers[currentQ.id] && timeLeft > 0}
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "Submit Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
