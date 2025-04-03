import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total } = location.state || { score: 0, total: 0 };
  
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-6">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-5xl font-bold text-teal-400"
      >
        Quiz Completed! 🎉
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1, transition: { delay: 0.3 } }} 
        className="mt-4 text-2xl"
      >
        You scored <span className="text-teal-400 font-bold">{score}</span> out of <span className="text-teal-400 font-bold">{total}</span>
      </motion.p>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1, transition: { delay: 0.6 } }} 
        className="mt-6 flex gap-4"
      >
        <button 
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-teal-500 text-white text-lg font-semibold rounded-lg hover:bg-teal-600 transition-all"
        >
          Back to Home
        </button>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-purple-500 text-white text-lg font-semibold rounded-lg hover:bg-purple-600 transition-all"
        >
          Retry Quiz
        </button>
      </motion.div>
    </div>
  );
};

export default ResultPage;
