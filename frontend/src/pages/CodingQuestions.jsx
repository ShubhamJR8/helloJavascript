import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CodingQuestions = () => {
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
          <h1 className="text-3xl font-bold text-teal-400 mb-6">Machine Coding Questions</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-700/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Practice Problems</h2>
              <p className="text-gray-300 mb-4">
                Sharpen your coding skills with our collection of machine coding problems.
                This feature is coming soon.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { title: 'Array Manipulation', difficulty: 'Medium' },
                  { title: 'DOM Manipulation', difficulty: 'Hard' },
                  { title: 'Event Handling', difficulty: 'Medium' },
                  { title: 'State Management', difficulty: 'Hard' }
                ].map((problem) => (
                  <div key={problem.title} className="bg-gray-600/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-teal-200">{problem.title}</h3>
                      <span className={`px-2 py-1 rounded text-sm ${
                        problem.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' : 
                        problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">Coming soon</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-700/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Live Coding Environment</h2>
              <p className="text-gray-300">
                Practice coding in our integrated development environment. This feature is under development.
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

export default CodingQuestions; 