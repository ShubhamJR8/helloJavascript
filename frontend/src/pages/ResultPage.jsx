import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizAttemptDetails } from "../apis/quizApi";
import { motion } from "framer-motion";

const ResultPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await getQuizAttemptDetails(quizId);
        setQuizResult(response.data);
      } catch (err) {
        setError("Failed to fetch quiz results. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [quizId]);

  if (loading) return <div className="text-center text-white mt-10">Loading results...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!quizResult) return <div className="text-center text-white mt-10">No results found.</div>;

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-teal-400"
      >
        Quiz Results
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 p-6 bg-gray-800 rounded-xl shadow-lg w-3/4 text-center"
      >
        <h2 className="text-2xl font-semibold">Your Score: {quizResult.score} / {quizResult.totalQuestions}</h2>
        <p className="text-lg mt-4 text-gray-400">Correct Answers: {quizResult.correctAnswers}</p>
      </motion.div>
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-8 py-3 bg-teal-500 text-white text-lg font-semibold rounded-lg hover:bg-teal-600 transition-all"
      >
        Back to Home
      </button>
    </div>
  );
};

export default ResultPage;
