import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { completeQuizAttempt } from "../apis/quizApi";
import axios from "axios";
import { motion } from "framer-motion";

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`/api/v1/quizzes/${quizId}/questions`);
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [quizId]);

  useEffect(() => {
    if (questions.length > 0) {
      setTimeLeft(questions[currentIndex]?.timeLimit || 30);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleNext, (questions[currentIndex]?.timeLimit || 30) * 1000);
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
        const response = await completeQuizAttempt(quizId, selectedAnswers);
        if (response.success) {
          navigate(`/result/${quizId}`);
        }
      } catch (error) {
        console.error("Error completing quiz:", error);
      }
    }
  };

  if (loading) return <div className="text-center text-white mt-10">Loading quiz...</div>;
  if (questions.length === 0) return <div className="text-center text-white mt-10">No questions available.</div>;

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-6">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold text-teal-400">
        Quiz
      </motion.h1>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-6 bg-gray-800 rounded-xl shadow-lg w-3/4 text-center">
        <h2 className="text-2xl font-semibold">{questions[currentIndex].question}</h2>
        <p className="text-red-400 font-bold">Time Left: {timeLeft}s</p>
      </motion.div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-3/4">
        {questions[currentIndex].options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleAnswerSelect(questions[currentIndex].id, option)}
            className={`p-4 rounded-lg font-semibold transition-all duration-300 text-lg text-center shadow-md ${
              selectedAnswers[questions[currentIndex].id] === option ? "bg-teal-500" : "bg-gray-800 hover:bg-teal-600"
            }`}
          >
            {option}
          </motion.button>
        ))}
      </div>
      <button
        onClick={handleNext}
        className="mt-6 px-8 py-3 bg-teal-500 text-white text-lg font-semibold rounded-lg hover:bg-teal-600 transition-all"
        disabled={!selectedAnswers[questions[currentIndex].id] && timeLeft > 0}
      >
        {currentIndex < questions.length - 1 ? "Next Question" : "Submit Quiz"}
      </button>
    </div>
  );
};

export default QuizPage;
