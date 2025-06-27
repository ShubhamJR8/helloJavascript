import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const MasteredQuizMessage = ({ topic, difficulty }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-gradient-to-br from-light-primary/10 to-light-accent/10 dark:from-dark-primary/10 dark:to-dark-accent/10 border border-light-primary/30 dark:border-dark-primary/30 rounded-xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-gradient-to-br from-light-warning to-light-warning/80 dark:from-dark-warning dark:to-dark-warning/80 p-4 rounded-full">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
        </motion.div>

        <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">
          Congratulations! 🎉
        </h2>
        
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
          You have mastered all {difficulty} level questions for {topic}!
        </p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="w-full bg-light-primary dark:bg-dark-primary hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Return to Home
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
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