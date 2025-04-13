import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { completeQuizAttempt, getQuizAttemptDetails } from "../apis/quizApi";
import { motion } from "framer-motion";

const QuizPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchAttemptAndQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the attempt ID from the URL
        const attemptId = window.location.pathname.split('/').pop();
        if (!attemptId) {
          throw new Error("No attempt ID found");
        }

        // Fetch attempt details using the API service
        const attemptResponse = await getQuizAttemptDetails(attemptId);
        if (!attemptResponse.success) {
          throw new Error(attemptResponse.message || "Failed to fetch attempt details");
        }

        const attempt = attemptResponse.data;
        if (!attempt || attempt.status !== "in-progress") {
          throw new Error("No active quiz attempt found");
        }

        setAttemptId(attempt._id);
        setQuestions(attempt.questions.map(q => ({
          id: q.questionId._id,
          question: q.questionId.question,
          options: q.questionId.options,
          timeLimit: q.questionId.timeLimit || 30,
          type: q.questionId.type
        })));

      } catch (error) {
        console.error("Error in fetchAttemptAndQuestions:", error);
        setError(error.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptAndQuestions();
  }, []);

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
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
    clearTimeout(timerRef.current);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      try {
        setLoading(true);
        setError(null);

        // Transform selectedAnswers into array format
        const transformedAnswers = Object.entries(selectedAnswers).map(([questionId, selectedOption]) => {
          const question = questions.find(q => q.id === questionId);
          return {
            questionId,
            selectedOption,
            submittedCode: "",      // default for now
            isCorrect: false,       // backend will validate
            timeTaken: question?.timeLimit - timeLeft || 0
          };
        });

        const response = await completeQuizAttempt(attemptId, transformedAnswers);
        
        if (response.success) {
          navigate(`/result/${response.data.attemptId}`, {
            state: {
              totalScore: response.data.totalScore,
              correctAnswers: response.data.correctAnswers,
              attemptId: response.data.attemptId,
            },
          });
        } else {
          throw new Error(response.message || "Failed to submit quiz");
        }
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
