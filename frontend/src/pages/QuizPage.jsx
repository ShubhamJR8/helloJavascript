import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { completeQuizAttempt, getQuizAttemptDetails, startQuizAttempt } from "../apis/quizApi";
import { motion } from "framer-motion";
import { Alert, CircularProgress, Typography } from "@mui/material";
import MasteredQuizMessage from "../components/MasteredQuizMessage";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from "react-hot-toast";
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questionTimes, setQuestionTimes] = useState({}); // Track time for each question
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
        currentIndex: currentQuestion,
        selectedAnswers: answers,
        timeLeft: questionTimes[currentQuestion],
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
      setCurrentQuestion(progress.currentIndex);
      setAnswers(progress.selectedAnswers);
      setQuestionTimes(progress.timeLeft);
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
              toast.error(response.message || "No questions available for this topic and difficulty");
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
          toast.error("Invalid quiz attempt data: missing or invalid questions");
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
            correctAnswer: q.questionId.correctAnswer,
            tags: q.questionId.tags || []
          };
        });

        if (populatedQuestions.length === 0) {
          toast.error("No questions available for this quiz");
          throw new Error("No questions available for this quiz");
        }

        setAttemptId(attemptId);
        setQuestions(populatedQuestions);

        // Initialize times for all questions
        const initialTimes = populatedQuestions.reduce((acc, q, index) => {
          acc[index] = q.timeLimit || 30;
          return acc;
        }, {});
        setQuestionTimes(initialTimes);

        // Set up auto-save
        autoSaveTimerRef.current = setInterval(autoSaveProgress, 30000); // Auto-save every 30 seconds

      } catch (error) {
        console.error("Error in fetchAttemptAndQuestions:", error);
        toast.error(error.message || "Failed to load quiz");
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
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start timer for current question if time is remaining
    if (questionTimes[currentQuestion] > 0) {
      timerRef.current = setInterval(() => {
        setQuestionTimes(prev => {
          const newTimes = { ...prev };
          if (newTimes[currentQuestion] > 0) {
            newTimes[currentQuestion] -= 1;
          }
          return newTimes;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestion, questionTimes]);

  const handleAnswer = (selectedOption) => {
    const newAnswers = [...answers];
    const currentQ = questions[currentQuestion];
    const timeLimit = currentQ.timeLimit || 30;
    const timeTaken = Math.max(0, timeLimit - questionTimes[currentQuestion]);
    
    newAnswers[currentQuestion] = {
      questionId: currentQ.id,
      selectedOption,
      timeTaken,
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Log the questions structure for debugging
      console.log('Questions structure:', questions);

      // Prepare answers with proper validation
      const validatedAnswers = questions.map((question, index) => {
        const answer = answers[index];
        const timeLimit = question.timeLimit || 30;
        
        return {
          questionId: question.id || question._id,
          selectedOption: answer?.selectedOption || null, // Allow null for unanswered questions
          timeTaken: Math.max(0, timeLimit - questionTimes[index])
        };
      });

      const response = await completeQuizAttempt(attemptId, validatedAnswers);
      
      if (response.success) {
        navigate(`/result/${attemptId}`, {
          state: {
            totalScore: response.data.totalScore,
            correctAnswers: response.data.correctAnswers,
            attemptId: attemptId,
            topic: topic,
            difficulty: difficulty
          },
        });
      } else {
        console.error('Quiz submission failed:', response.errors);
        setError(response.message || 'Failed to complete quiz attempt');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.message || 'Failed to complete quiz attempt');
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

        {/* Display tags if they exist */}
        {console.log(question)}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {question.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Question {currentQuestion + 1} of {questions.length}
          </h2>
          <div className={`font-semibold ${questionTimes[currentQuestion] <= 0 ? 'text-red-400' : 'text-green-400'}`}>
            {questionTimes[currentQuestion] <= 0 ? 'Time Up!' : `Time Left: ${questionTimes[currentQuestion]}s`}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          {renderQuestion(questions[currentQuestion])}
          
          <div className="mt-8 space-y-4">
            {questions[currentQuestion].options.map((option, index) => {
              const isSelected = answers[currentQuestion]?.selectedOption === option;
              const isTimeUp = questionTimes[currentQuestion] <= 0;
              
              return (
                <button
                  key={index}
                  className={`
                    w-full p-4 text-left rounded-lg transition-all duration-200
                    ${isTimeUp 
                      ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' 
                      : isSelected
                        ? 'bg-teal-600 text-white ring-2 ring-teal-400 ring-offset-2 ring-offset-gray-800'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }
                    ${!isTimeUp && !isSelected ? 'hover:scale-[1.02]' : ''}
                  `}
                  onClick={() => !isTimeUp && handleAnswer(option)}
                  disabled={isTimeUp}
                >
                  <div className="flex items-center">
                    <div className={`
                      w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center
                      ${isTimeUp 
                        ? 'border-gray-600' 
                        : isSelected
                          ? 'border-teal-400 bg-teal-400'
                          : 'border-gray-400'
                      }
                    `}>
                      {isSelected && !isTimeUp && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-lg">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <div>
            {currentQuestion > 0 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
            )}
          </div>
          <div>
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
