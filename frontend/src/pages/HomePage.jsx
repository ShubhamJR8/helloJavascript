import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRocket, FaCode, FaBrain, FaLaptopCode, FaBriefcase, FaComments } from "react-icons/fa";
import { startQuizAttempt } from "../apis/quizApi";

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const topics = ["javascript", "typescript", "react", "node"];

  const handleStartQuiz = async (selectedTopic, selectedDifficulty) => {
    try {
      setLoading(true);
      setError(null);

      console.log("[Start Quiz] Starting quiz with:", { selectedTopic, selectedDifficulty });
      const response = await startQuizAttempt(selectedTopic, selectedDifficulty);
      console.log("[Start Quiz] API Response:", response);

      if (!response.success) {
        console.log("[Start Quiz] API returned failure:", response);
        setError(response.message || "Failed to start quiz");
        return;
      }

      // Check if all questions are mastered
      if (response.data?.mastered) {
        navigate(`/quiz/${selectedTopic}/${selectedDifficulty}`, {
          state: { mastered: true }
        });
        return;
      }

      // Normal quiz attempt
      navigate(`/quiz/${selectedTopic}/${selectedDifficulty}`, {
        state: {
          attemptId: response.attemptId,
          data: response.data
        }
      });
    } catch (error) {
      console.error("[Start Quiz] Error:", error);
      setError(error.message || "Failed to start quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
      {/* Background Animation */}
      <motion.div className="absolute w-65 h-65 bg-purple-400 rounded-full opacity-20 blur-3xl top-10 left-10 animate-pulse"></motion.div>
      <motion.div className="absolute w-55 h-55 bg-teal-500 rounded-full opacity-20 blur-3xl bottom-10 right-10 animate-pulse"></motion.div>

      {/* Website Title */}
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="text-6xl font-extrabold text-teal-600 text-center drop-shadow-xl uppercase tracking-wide">
        India's Got JavaScript Developer 🚀
      </motion.h1>

      {/* Moto */}
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="mt-3 text-xl text-gray-300 text-center italic max-w-2xl">
        Master JavaScript with hands-on coding, quizzes, mock interviews, and real-world challenges.
      </motion.p>

      {/* Topic Selection */}
      <motion.div className="flex gap-6 mt-8" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => {
              setSelectedTopic(topic);
              setShowWarning(false);
            }}
            className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 text-lg tracking-wide shadow-xl ${
              selectedTopic === topic ? "bg-teal-400 text-white scale-110" : "bg-gray-800 hover:bg-teal-600 hover:scale-105"
            }`}
          >
            {topic}
          </button>
        ))}
      </motion.div>

      {/* Difficulty Selection */}
      {selectedTopic && (
        <>
          <motion.div 
            className="mt-4 flex gap-4"
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6 }}
          >
            {["easy", "medium", "hard"].map((level) => (
              <button
                key={level}
                onClick={() => {
                  setDifficulty(level);
                  setShowWarning(false);
                }}
                className={`px-6 py-2 rounded-lg font-bold transition-all duration-300 text-lg tracking-wide shadow-xl ${
                  difficulty === level 
                    ? "bg-teal-400 text-white scale-110" 
                    : "bg-gray-800 hover:bg-teal-600 hover:scale-105"
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </motion.div>

          {showWarning && !difficulty && (
            <p className="text-red-500 font-semibold mt-2">
              Please select a difficulty level to start the quiz.
            </p>
          )}
        </>
      )}

      {/* Buttons */}
      <div className="mt-8 flex flex-col gap-4">
        {selectedTopic && (
          <motion.button
            onClick={() => handleStartQuiz(selectedTopic, difficulty)}
            className="px-8 py-3 bg-teal-500 text-white text-lg font-bold rounded-lg hover:bg-teal-600 transition-all shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            Start Quiz ✨
          </motion.button>
        )}

        {selectedTopic && (
          <motion.button
            onClick={() => navigate(`/coding-question/${selectedTopic.toLowerCase()}`)}
            className="px-8 py-3 bg-purple-500 text-white text-lg font-bold rounded-lg hover:bg-purple-600 transition-all shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            Solve Coding Challenges 💡
          </motion.button>
        )}
      </div>

      {/* Additional Features */}
      <motion.div className="mt-12 grid grid-cols-2 gap-6 w-3/4 max-w-4xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}>
        {[
          { text: "Daily JavaScript Challenge", icon: <FaRocket />, link: "/daily-javascript-challenge" },
          { text: "Concept and Output Based MCQs", icon: <FaBrain />, link: "/concept-based-mcqs" },
          { text: "Machine Coding Questions", icon: <FaLaptopCode />, link: "/coding-questions" },
          { text: "JavaScript Concepts Explained Visually", icon: <FaCode />, link: "/javascript-concepts-visual" },
          { text: "Mock Interviews & Feedback Report", icon: <FaComments />, link: "/mock-interviews" },
          { text: "Job Listings", icon: <FaBriefcase />, link: "/job-listings" },
          { text: "JavaScript Blogs", icon: <FaCode />, link: "/blogs" },
        ].map(({ text, icon, link }) => (
          <motion.button
            key={text}
            onClick={() => navigate(link)}
            className="flex items-center gap-3 px-6 py-3 bg-gray-800 text-white text-lg font-bold rounded-lg hover:bg-teal-600 transition-all shadow-xl"
            whileHover={{ scale: 1.08 }}
          >
            {icon} {text}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default HomePage;
