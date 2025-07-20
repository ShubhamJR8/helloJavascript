import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const JavaScriptConceptsVisual = () => {
  const navigate = useNavigate();
  const [visitedConcepts, setVisitedConcepts] = useState([]);

  // Check localStorage for visited concepts
  useEffect(() => {
    const visited = localStorage.getItem('visitedConcepts');
    if (visited) {
      setVisitedConcepts(JSON.parse(visited));
    }
  }, []);

  const concepts = [
    { 
      title: 'Event Loop', 
      icon: '🔄',
      description: 'Learn how JavaScript handles asynchronous operations through the event loop mechanism.',
      path: '/concepts/event-loop',
      id: 'event-loop'
    },
    { 
      title: 'Closures', 
      icon: '🔒',
      description: 'Understand how functions can access variables from their outer scope even after the outer function has returned.',
      path: '/concepts/closures',
      id: 'closures'
    },
    { 
      title: 'Prototypes', 
      icon: '🔗',
      description: 'Explore JavaScript\'s prototype-based inheritance system and how objects share properties and methods.',
      path: '/concepts/prototypes',
      id: 'prototypes'
    },
    { 
      title: 'Hoisting', 
      icon: '⬆️',
      description: 'Discover how variable and function declarations are moved to the top of their scope during execution.',
      path: '/concepts/hoisting',
      id: 'hoisting'
    },
    { 
      title: 'Scope Chain', 
      icon: '⛓️',
      description: 'Learn about how JavaScript determines which variables are accessible in different parts of your code.',
      path: '/concepts/scope-chain',
      id: 'scope-chain'
    },
    { 
      title: 'Async/Await', 
      icon: '⏳',
      description: 'Master modern JavaScript\'s way of handling asynchronous operations with async/await syntax.',
      path: '/concepts/async-await',
      id: 'async-await'
    }
  ];

  const handleConceptClick = (concept) => {
    // Mark concept as visited
    const newVisited = [...new Set([...visitedConcepts, concept.id])];
    setVisitedConcepts(newVisited);
    localStorage.setItem('visitedConcepts', JSON.stringify(newVisited));
    navigate(concept.path);
  };

  const progressPercentage = (visitedConcepts.length / concepts.length) * 100;

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
          
          {/* Progress Indicator */}
          <div className="mb-8 bg-gray-700/50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-teal-300">Your Progress</h2>
              <span className="text-sm text-gray-400">
                {visitedConcepts.length} of {concepts.length} concepts explored
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-teal-400 to-teal-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {progressPercentage === 100 
                ? "🎉 Congratulations! You've explored all JavaScript concepts!" 
                : "Click on any concept to start learning with interactive visualizations."
              }
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-700/50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Interactive Learning</h2>
              <p className="text-gray-300 mb-4">
                Learn JavaScript concepts through interactive visualizations and animations. Each concept includes step-by-step explanations and real-time visual feedback.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {concepts.map((concept, index) => (
                  <motion.div 
                    key={concept.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`bg-gray-600/50 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-all duration-300 border-2 ${
                      visitedConcepts.includes(concept.id) 
                        ? 'border-teal-400 bg-teal-900/20' 
                        : 'border-transparent'
                    }`}
                    onClick={() => handleConceptClick(concept)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{concept.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-teal-200">{concept.title}</h3>
                        {visitedConcepts.includes(concept.id) && (
                          <span className="text-xs text-teal-400">✓ Completed</span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">{concept.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                Return to Home
              </button>
              {visitedConcepts.length > 0 && (
                <button
                  onClick={() => {
                    localStorage.removeItem('visitedConcepts');
                    setVisitedConcepts([]);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Reset Progress
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JavaScriptConceptsVisual; 