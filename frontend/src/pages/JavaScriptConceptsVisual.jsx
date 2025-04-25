import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const JavaScriptConceptsVisual = () => {
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
          <h1 className="text-3xl font-bold text-teal-400 mb-6">JavaScript Concepts Explained Visually</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-700/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Interactive Learning</h2>
              <p className="text-gray-300 mb-4">
                Learn JavaScript concepts through interactive visualizations and animations.
                This feature is coming soon.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Event Loop', icon: '🔄' },
                  { title: 'Closures', icon: '🔒' },
                  { title: 'Prototypes', icon: '🔗' },
                  { title: 'Hoisting', icon: '⬆️' },
                  { title: 'Scope Chain', icon: '⛓️' },
                  { title: 'Async/Await', icon: '⏳' }
                ].map((concept) => (
                  <div key={concept.title} className="bg-gray-600/50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{concept.icon}</span>
                      <h3 className="text-lg font-medium text-teal-200">{concept.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">Coming soon</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-700/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Visual Examples</h2>
              <p className="text-gray-300">
                Explore complex JavaScript concepts through animated examples and diagrams.
                This feature is under development.
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

export default JavaScriptConceptsVisual; 