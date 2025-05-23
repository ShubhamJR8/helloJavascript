import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const JavaScriptConceptsVisual = () => {
  const navigate = useNavigate();

  const concepts = [
    { 
      title: 'Event Loop', 
      icon: '🔄',
      description: 'Learn how JavaScript handles asynchronous operations through the event loop mechanism.',
      path: '/concepts/event-loop'
    },
    { 
      title: 'Closures', 
      icon: '🔒',
      description: 'Understand how functions can access variables from their outer scope even after the outer function has returned.',
      path: '/concepts/closures'
    },
    { 
      title: 'Prototypes', 
      icon: '🔗',
      description: 'Explore JavaScript\'s prototype-based inheritance system and how objects share properties and methods.',
      path: '/concepts/prototypes'
    },
    { 
      title: 'Hoisting', 
      icon: '⬆️',
      description: 'Discover how variable and function declarations are moved to the top of their scope during execution.',
      path: '/concepts/hoisting'
    },
    { 
      title: 'Scope Chain', 
      icon: '⛓️',
      description: 'Learn about how JavaScript determines which variables are accessible in different parts of your code.',
      path: '/concepts/scope-chain'
    },
    { 
      title: 'Async/Await', 
      icon: '⏳',
      description: 'Master modern JavaScript\'s way of handling asynchronous operations with async/await syntax.',
      path: '/concepts/async-await'
    }
  ];

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
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {concepts.map((concept) => (
                  <div 
                    key={concept.title} 
                    className="bg-gray-600/50 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => navigate(concept.path)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{concept.icon}</span>
                      <h3 className="text-lg font-medium text-teal-200">{concept.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">{concept.description}</p>
                  </div>
                ))}
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JavaScriptConceptsVisual; 