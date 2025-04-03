import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchQuestionsByTopic } from "../apis/questionApi";

const QuizPage = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchQuestionsByTopic(topic);
        setQuestions(data.questions);
        console.log(data.questions);
      } catch (err) {
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [topic]);

  const currentQuestion = questions[currentIndex];

  // Start timer for each question
  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleNext();
      }, currentQuestion.timeLimit * 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [currentIndex, currentQuestion]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Handle answer selection
  const handleAnswer = (answer) => {
    if (!selectedAnswer) {
      setSelectedAnswer(answer);
      if (answer === currentQuestion.correctAnswer) {
        setScore((prev) => prev + 1);
      }
      clearTimeout(timerRef.current); // Stop the timer after selection
    }
  };

  // Move to next question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      navigate("/result", { state: { score, total: questions.length } });
    }
  };

  if (loading) return <div className="text-center text-white mt-10">Loading questions...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!currentQuestion) return <div className="text-center text-white mt-10">No questions available.</div>;

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-teal-400"
      >
        {topic.charAt(0).toUpperCase() + topic.slice(1)} Quiz
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 p-6 bg-gray-800 rounded-xl shadow-lg w-3/4 text-center"
      >
        <h2 className="text-2xl font-semibold">{currentQuestion.question}</h2>
        <p className="text-red-400 font-bold">Time Left: {timeLeft}s</p>
      </motion.div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-3/4">
        {currentQuestion.options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleAnswer(option)}
            className={`p-4 rounded-lg font-semibold transition-all duration-300 text-lg text-center shadow-md ${
              selectedAnswer === option
                ? option === currentQuestion.correctAnswer
                  ? "bg-green-500"
                  : "bg-red-500"
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
        disabled={!selectedAnswer && timeLeft > 0} // Prevent skipping without answering
      >
        {currentIndex < questions.length - 1 ? "Next Question" : "Submit Quiz"}
      </button>
    </div>
  );
};

export default QuizPage;
