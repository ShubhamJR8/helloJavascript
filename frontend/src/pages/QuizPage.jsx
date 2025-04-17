import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { completeQuizAttempt, getQuizAttemptDetails, startQuizAttempt } from "../apis/quizApi";
import { motion } from "framer-motion";
import { Alert, CircularProgress, Typography } from "@mui/material";
import MasteredQuizMessage from "../components/MasteredQuizMessage";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import '../styles/QuizPage.css';

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
  const [mastered, setMastered] = useState(false);
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

          // Check if user has mastered all questions
          if (startResponse.data.mastered) {
            setMastered(true);
            setQuestions([]);
            return;
          }

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
            timeTaken: Math.max(0, q.timeLimit - timeLeft)
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

  const renderQuestion = (question) => {
    // Split the question text to separate code blocks
    const parts = question.question.split(/```(\w+)?\n([\s\S]*?)```/);
    
    return (
      <div className="space-y-4">
        {parts.map((part, index) => {
          // If the part is a code block (odd index)
          if (index % 3 === 2) {
            const language = parts[index - 1] || 'javascript';
            return (
              <div key={index} className="relative">
                <div className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-400 bg-gray-800 rounded-bl">
                  {language}
                </div>
                <SyntaxHighlighter
                  language={language}
                  style={vscDarkPlus}
                  className="rounded-lg !mt-0 !mb-0"
                  customStyle={{
                    padding: '1rem',
                    margin: '0',
                    fontSize: '0.9rem',
                    borderRadius: '0.5rem',
                  }}
                >
                  {part.trim()}
                </SyntaxHighlighter>
              </div>
            );
          }
          // If the part is not a code block (even index)
          return (
            <p key={index} className="text-gray-200 leading-relaxed">
              {part}
            </p>
          );
        })}
      </div>
    );
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

  if (mastered) {
    return <MasteredQuizMessage topic={topic} difficulty={difficulty} />;
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
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Question {currentIndex + 1} of {questions.length}
          </h2>
          <div className="text-red-400 font-semibold">
            Time Left: {timeLeft}s
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          {renderQuestion(currentQ)}
          
          <div className="mt-8 space-y-4">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                className={`w-full p-4 text-left rounded-lg transition-colors duration-200 ${
                  selectedAnswers[currentQ.id] === option
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
                onClick={() => handleAnswerSelect(currentQ.id, option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          {currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
          )}
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
