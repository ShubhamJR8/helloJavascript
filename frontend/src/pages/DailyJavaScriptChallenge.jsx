import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DailyJavaScriptChallenge = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-xl p-8 shadow-lg"
        >
          <h1 className="text-3xl font-bold text-teal-400 mb-6">Daily JavaScript Challenge</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-700/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Today's Challenge</h2>
              <p className="text-gray-300 mb-4">
                Check back tomorrow for a new challenge! This feature is coming soon.
              </p>
              <div className="bg-gray-600/50 p-4 rounded-lg">
                <pre className="text-gray-300">
                  {`// Coming soon: Daily coding challenges
// Stay tuned for exciting JavaScript problems
// to test and improve your skills!`}
                </pre>
              </div>
            </div>

            <div className="bg-gray-700/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Previous Challenges</h2>
              <p className="text-gray-300">
                Previous challenges will be available here. This feature is under development.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DailyJavaScriptChallenge; 