import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Trophy, ArrowRight } from "lucide-react";

const MasteredQuizMessage = ({ topic, difficulty }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-gradient-to-br from-teal-500/10 to-purple-500/10 border border-teal-500/30 rounded-xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-full">
            <Trophy size={48} className="text-white" />
          </div>
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-4">
          Congratulations! 🎉
        </h2>
        
        <p className="text-gray-300 mb-6">
          You have mastered all {difficulty} level questions for {topic}!
        </p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Return to Home
            <ArrowRight size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/analytics')}
            className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-purple-500/30"
          >
            View Your Progress
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-sm text-gray-400"
        >
          <p>Want to challenge yourself further?</p>
          <p className="mt-2">
            Try a different difficulty level or explore other topics!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MasteredQuizMessage; 