import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { completeQuizAttempt } from "../apis/quizApi";
import axios from "axios";
import { motion } from "framer-motion";

const QuizPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchAttemptAndQuestions = async () => {
      try {
        const userId = "67c43cd75193cf13c7814422"; // change to dynamic later
        const attemptRes = await axios.get(
          `http://localhost:5000/api/quiz-attempts/user/${userId}`
        );

        const attempt = attemptRes.data.attempts.find(
          (a) => a.status === "in-progress"
        );

        if (!attempt) {
          console.warn("No active quiz attempt found.");
          return;
        }

        setAttemptId(attempt._id);

        const questionIds = attempt.questions.map((q) => q.questionId);
        const questionPromises = questionIds.map((id) =>
          axios.get(`http://localhost:5000/api/questions/${id}`)
        );

        const responses = await Promise.all(questionPromises);

        const formattedQuestions = responses.map((res) => {
          const q = res.data.question;
          return {
            id: q._id,
            question: q.question,
            options: q.options,
            timeLimit: 30, // default 30 sec per question
          };
        });

        setQuestions(formattedQuestions);
      } catch (error) {
        console.error("Error in fetchAttemptAndQuestions:", error);
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
      // ✅ Transform selectedAnswers into array format
      const transformedAnswers = Object.entries(selectedAnswers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
        submittedCode: "",      // default for now
        isCorrect: false,       // backend will validate
        timeTaken: 0            // optional if you're not tracking
      }));
  
      try {
        const response = await completeQuizAttempt(attemptId, transformedAnswers);
        console.log("response", response);
        if (response.success) {
          navigate(`/result/${response.attemptId}`, {
            state: {
              totalScore: response.totalScore,
              correctAnswers: response.correctAnswers,
              attemptId: response.attemptId,
            },
          });
        }
      } catch (error) {
        console.error("Error submitting quiz:", error);
      }
    }
  };
  

  if (loading) return <div className="text-center text-white mt-10">Loading quiz...</div>;
  if (!questions.length) return <div className="text-center text-white mt-10">No questions available.</div>;

  const currentQ = questions[currentIndex];

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-teal-400"
      >
        Quiz
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 p-6 bg-gray-800 rounded-xl shadow-lg w-3/4 text-center"
      >
        <h2 className="text-2xl font-semibold">{currentQ.question}</h2>
        <p className="text-red-400 font-bold">Time Left: {timeLeft}s</p>
      </motion.div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-3/4">
        {currentQ.options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleAnswerSelect(currentQ.id, option)}
            className={`p-4 rounded-lg font-semibold transition-all duration-300 text-lg text-center shadow-md ${
              selectedAnswers[currentQ.id] === option
                ? "bg-teal-500"
                : "bg-gray-800 hover:bg-teal-600"
            }`}
          >
            {option}
          </motion.button>
        ))}
      </div>
      <button
        onClick={handleNext}
        className="mt-6 px-8 py-3 bg-teal-500 text-white text-lg font-semibold rounded-lg hover:bg-teal-600 transition-all"
        disabled={!selectedAnswers[currentQ.id] && timeLeft > 0}
      >
        {currentIndex < questions.length - 1 ? "Next Question" : "Submit Quiz"}
      </button>
    </div>
  );
};

export default QuizPage;
