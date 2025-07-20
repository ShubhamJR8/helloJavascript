import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// Hoisting Presentation Engine
class HoistingPresentationEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentStep = 0;
    this.isPlaying = false;
    this.speed = 1000;
  }

  getSteps() {
    return [
      // Step 0: Initial State
      {
        phase: "Initial State",
        description: "Starting with empty memory and execution context",
        callStack: [],
        memory: {},
        hoistedItems: {},
        output: [],
        explanation: "The JavaScript engine starts with empty memory. Ready to explore hoisting!"
      },
      
      // Step 1: Function declaration hoisting
      {
        phase: "Function Declaration Hoisting",
        description: "Function declarations are hoisted to the top",
        callStack: ["function hoistedFunc() { /* function body */ }"],
        memory: { "hoistedFunc": "function declaration" },
        hoistedItems: { "hoistedFunc": "function declaration (hoisted)" },
        output: [],
        explanation: "Function declarations are hoisted to the top of their scope. They are available throughout the entire scope."
      },

      // Step 2: Variable declarations hoisting
      {
        phase: "Variable Declaration Hoisting",
        description: "Variable declarations are hoisted but not initialized",
        callStack: ["var a", "let b", "const c"],
        memory: { 
          "hoistedFunc": "function declaration",
          "a": "undefined (hoisted)",
          "b": "uninitialized (temporal dead zone)",
          "c": "uninitialized (temporal dead zone)"
        },
        hoistedItems: { 
          "hoistedFunc": "function declaration (hoisted)",
          "a": "var declaration (hoisted, initialized to undefined)",
          "b": "let declaration (hoisted, not initialized)",
          "c": "const declaration (hoisted, not initialized)"
        },
        output: [],
        explanation: "Variable declarations are hoisted, but var is initialized to undefined, while let and const are not initialized (temporal dead zone)."
      },

      // Step 3: Accessing var before assignment
      {
        phase: "Var Access Before Assignment",
        description: "Accessing var variable before assignment - returns undefined",
        callStack: ["console.log(a)"],
        memory: { 
          "hoistedFunc": "function declaration",
          "a": "undefined (hoisted)",
          "b": "uninitialized (temporal dead zone)",
          "c": "uninitialized (temporal dead zone)"
        },
        hoistedItems: { 
          "hoistedFunc": "function declaration (hoisted)",
          "a": "var declaration (hoisted, initialized to undefined)",
          "b": "let declaration (hoisted, not initialized)",
          "c": "const declaration (hoisted, not initialized)"
        },
        output: ["undefined"],
        explanation: "var 'a' is hoisted and initialized to undefined, so accessing it before assignment returns undefined."
      },

      // Step 4: Attempting to access let before assignment
      {
        phase: "Let Access Before Assignment",
        description: "Attempting to access let variable before assignment - ReferenceError",
        callStack: ["console.log(b)"],
        memory: { 
          "hoistedFunc": "function declaration",
          "a": "undefined (hoisted)",
          "b": "uninitialized (temporal dead zone)",
          "c": "uninitialized (temporal dead zone)"
        },
        hoistedItems: { 
          "hoistedFunc": "function declaration (hoisted)",
          "a": "var declaration (hoisted, initialized to undefined)",
          "b": "let declaration (hoisted, not initialized)",
          "c": "const declaration (hoisted, not initialized)"
        },
        output: ["undefined", "❌ ReferenceError: Cannot access 'b' before initialization"],
        explanation: "let 'b' is hoisted but not initialized. Accessing it before assignment throws a ReferenceError (temporal dead zone)."
      },

      // Step 5: Attempting to access const before assignment
      {
        phase: "Const Access Before Assignment",
        description: "Attempting to access const variable before assignment - ReferenceError",
        callStack: ["console.log(c)"],
        memory: { 
          "hoistedFunc": "function declaration",
          "a": "undefined (hoisted)",
          "b": "uninitialized (temporal dead zone)",
          "c": "uninitialized (temporal dead zone)"
        },
        hoistedItems: { 
          "hoistedFunc": "function declaration (hoisted)",
          "a": "var declaration (hoisted, initialized to undefined)",
          "b": "let declaration (hoisted, not initialized)",
          "c": "const declaration (hoisted, not initialized)"
        },
        output: ["undefined", "❌ ReferenceError: Cannot access 'b' before initialization", "❌ ReferenceError: Cannot access 'c' before initialization"],
        explanation: "const 'c' is also hoisted but not initialized. Accessing it before assignment throws a ReferenceError (temporal dead zone)."
      },

      // Step 6: Variable assignments
      {
        phase: "Variable Assignments",
        description: "Assigning values to variables",
        callStack: ["a = 1", "b = 2", "c = 3"],
        memory: { 
          "hoistedFunc": "function declaration",
          "a": 1,
          "b": 2,
          "c": 3
        },
        hoistedItems: { 
          "hoistedFunc": "function declaration (hoisted)",
          "a": "var declaration (hoisted, initialized to undefined)",
          "b": "let declaration (hoisted, not initialized)",
          "c": "const declaration (hoisted, not initialized)"
        },
        output: ["undefined", "❌ ReferenceError: Cannot access 'b' before initialization", "❌ ReferenceError: Cannot access 'c' before initialization"],
        explanation: "Variables are assigned their values. Now they can be accessed normally."
      },

      // Step 7: Function call - hoisted function
      {
        phase: "Hoisted Function Execution",
        description: "Calling hoisted function - works because it's hoisted",
        callStack: ["hoistedFunc()"],
        memory: { 
          "hoistedFunc": "function declaration",
          "a": 1,
          "b": 2,
          "c": 3
        },
        hoistedItems: { 
          "hoistedFunc": "function declaration (hoisted)",
          "a": "var declaration (hoisted, initialized to undefined)",
          "b": "let declaration (hoisted, not initialized)",
          "c": "const declaration (hoisted, not initialized)"
        },
        output: ["undefined", "❌ ReferenceError: Cannot access 'b' before initialization", "❌ ReferenceError: Cannot access 'c' before initialization", "🚀 Hoisted function executed!"],
        explanation: "hoistedFunc() works because function declarations are hoisted and available throughout the entire scope."
      },

      // Step 8: Function expression attempt
      {
        phase: "Function Expression Attempt",
        description: "Attempting to call function expression before declaration",
        callStack: ["console.log('Attempting to call function expression...')"],
        memory: { 
          "hoistedFunc": "function declaration",
          "a": 1,
          "b": 2,
          "c": 3
        },
        hoistedItems: { 
          "hoistedFunc": "function declaration (hoisted)",
          "a": "var declaration (hoisted, initialized to undefined)",
          "b": "let declaration (hoisted, not initialized)",
          "c": "const declaration (hoisted, not initialized)"
        },
        output: ["undefined", "❌ ReferenceError: Cannot access 'b' before initialization", "❌ ReferenceError: Cannot access 'c' before initialization", "🚀 Hoisted function executed!", "Attempting to call function expression..."],
        explanation: "Function expressions (like var func = function() {}) are not hoisted like function declarations."
      },

      // Step 9: Function expression declaration
      {
        phase: "Function Expression Declaration",
        description: "Declaring function expression",
        callStack: ["var funcExpr = function() { console.log('Function expression'); }"],
        memory: { 
          "hoistedFunc": "function declaration",
          "a": 1,
          "b": 2,
          "c": 3,
          "funcExpr": "function expression"
        },
        hoistedItems: { 
          "hoistedFunc": "function declaration (hoisted)",
          "a": "var declaration (hoisted, initialized to undefined)",
          "b": "let declaration (hoisted, not initialized)",
          "c": "const declaration (hoisted, not initialized)",
          "funcExpr": "var declaration (hoisted, initialized to undefined)"
        },
        output: ["undefined", "❌ ReferenceError: Cannot access 'b' before initialization", "❌ ReferenceError: Cannot access 'c' before initialization", "🚀 Hoisted function executed!", "Attempting to call function expression..."],
        explanation: "Function expressions are assigned to variables, so they follow variable hoisting rules."
      },

      // Step 10: Function expression call
      {
        phase: "Function Expression Execution",
        description: "Calling function expression after declaration",
        callStack: ["funcExpr()"],
        memory: { 
          "hoistedFunc": "function declaration",
          "a": 1,
          "b": 2,
          "c": 3,
          "funcExpr": "function expression"
        },
        hoistedItems: { 
          "hoistedFunc": "function declaration (hoisted)",
          "a": "var declaration (hoisted, initialized to undefined)",
          "b": "let declaration (hoisted, not initialized)",
          "c": "const declaration (hoisted, not initialized)",
          "funcExpr": "var declaration (hoisted, initialized to undefined)"
        },
        output: ["undefined", "❌ ReferenceError: Cannot access 'b' before initialization", "❌ ReferenceError: Cannot access 'c' before initialization", "🚀 Hoisted function executed!", "Attempting to call function expression...", "Function expression"],
        explanation: "Now funcExpr() works because the function expression has been declared and assigned."
      },

      // Step 11: Final demonstration
      {
        phase: "Hoisting Demonstration Complete",
        description: "All hoisting behaviors demonstrated",
        callStack: [],
        memory: { 
          "hoistedFunc": "function declaration",
          "a": 1,
          "b": 2,
          "c": 3,
          "funcExpr": "function expression"
        },
        hoistedItems: { 
          "hoistedFunc": "function declaration (hoisted)",
          "a": "var declaration (hoisted, initialized to undefined)",
          "b": "let declaration (hoisted, not initialized)",
          "c": "const declaration (hoisted, not initialized)",
          "funcExpr": "var declaration (hoisted, initialized to undefined)"
        },
        output: ["undefined", "❌ ReferenceError: Cannot access 'b' before initialization", "❌ ReferenceError: Cannot access 'c' before initialization", "🚀 Hoisted function executed!", "Attempting to call function expression...", "Function expression"],
        explanation: "🎉 Hoisting demonstration complete! Key takeaways: Function declarations are fully hoisted, var is hoisted and initialized to undefined, let/const are hoisted but not initialized (temporal dead zone)."
      }
    ];
  }

  getCurrentStep() {
    return this.currentStep;
  }

  getTotalSteps() {
    return this.getSteps().length;
  }

  getCurrentState() {
    const steps = this.getSteps();
    return steps[this.currentStep] || steps[0];
  }

  nextStep() {
    if (this.currentStep < this.getTotalSteps() - 1) {
      this.currentStep++;
      return true;
    }
    return false;
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      return true;
    }
    return false;
  }

  goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.getTotalSteps()) {
      this.currentStep = stepIndex;
      return true;
    }
    return false;
  }

  reset() {
    this.currentStep = 0;
    this.isPlaying = false;
  }

  play() {
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  setSpeed(speed) {
    this.speed = speed;
  }
}

const Hoisting = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(`console.log(a); // undefined
// console.log(b); // ❌ ReferenceError: Cannot access 'b' before initialization
// console.log(c); // ❌ ReferenceError: Cannot access 'c' before initialization

var a = 1;
let b = 2;
const c = 3;

hoistedFunc(); // ✅ Works
function hoistedFunc() {
  console.log("🚀 Hoisted function executed!");
}`);

  // Engine state
  const engineRef = useRef(new HoistingPresentationEngine());
  const [currentState, setCurrentState] = useState(engineRef.current.getCurrentState());
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const animationFrameRef = useRef(null);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      const playNext = () => {
        if (engineRef.current.nextStep()) {
          setCurrentState(engineRef.current.getCurrentState());
          animationFrameRef.current = setTimeout(playNext, speed);
        } else {
          setIsPlaying(false);
        }
      };
      animationFrameRef.current = setTimeout(playNext, speed);
    } else {
      if (animationFrameRef.current) {
        clearTimeout(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        clearTimeout(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previousStep();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          reset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const nextStep = () => {
    if (engineRef.current.nextStep()) {
      setCurrentState(engineRef.current.getCurrentState());
    }
  };

  const previousStep = () => {
    if (engineRef.current.previousStep()) {
      setCurrentState(engineRef.current.getCurrentState());
    }
  };

  const reset = () => {
    engineRef.current.reset();
    setCurrentState(engineRef.current.getCurrentState());
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      engineRef.current.pause();
    } else {
      setIsPlaying(true);
      engineRef.current.play();
    }
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    engineRef.current.setSpeed(newSpeed);
  };

  const goToStep = (stepIndex) => {
    if (engineRef.current.goToStep(stepIndex)) {
      setCurrentState(engineRef.current.getCurrentState());
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/javascript-concepts')}
              className="flex items-center text-blue-400 hover:text-blue-300 transition-colors mb-2"
            >
              ← Back to Concepts
            </button>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              JavaScript Hoisting Visualizer
            </h1>
            <p className="text-gray-400 mt-2">
              Interactive visualization of JavaScript hoisting and temporal dead zone
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Code and Controls */}
          <div className="space-y-6">
            {/* Code Display */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-300 mb-4">Example Code</h2>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                <pre className="text-yellow-400">{code}</pre>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-300 mb-4">Controls</h2>
              
              {/* Play/Pause Controls */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={togglePlay}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    isPlaying 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
                
                <button
                  onClick={nextStep}
                  disabled={engineRef.current.getCurrentStep() >= engineRef.current.getTotalSteps() - 1}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  ⏭️ Next
                </button>
                
                <button
                  onClick={previousStep}
                  disabled={engineRef.current.getCurrentStep() <= 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  ⏮️ Previous
                </button>
                
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors"
                >
                  🔄 Reset
                </button>
              </div>

              {/* Speed Control */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Speed: {speed}ms per step
                </label>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="500"
                  value={speed}
                  onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Step {engineRef.current.getCurrentStep() + 1} of {engineRef.current.getTotalSteps()}</span>
                  <span>{Math.round(((engineRef.current.getCurrentStep() + 1) / engineRef.current.getTotalSteps()) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((engineRef.current.getCurrentStep() + 1) / engineRef.current.getTotalSteps()) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="text-sm text-gray-400">
                <p className="mb-2">Keyboard Shortcuts:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span>Space - Play/Pause</span>
                  <span>→ - Next Step</span>
                  <span>← - Previous Step</span>
                  <span>R - Reset</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Visualization */}
          <div className="space-y-6">
            {/* Current Phase */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-300 mb-4">Current Phase</h2>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="mb-2">
                  <span className="text-yellow-400 font-semibold text-lg">{currentState.phase}</span>
                </div>
                <div className="text-gray-300">
                  {currentState.description}
                </div>
              </div>
            </div>

            {/* Call Stack */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-400 mb-4">Call Stack</h2>
              <div className="bg-gray-700 rounded-lg p-4 min-h-[120px]">
                <AnimatePresence>
                  {currentState.callStack.map((item, index) => (
                    <motion.div
                      key={`${item}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-blue-600 text-white p-2 rounded mb-2 text-sm font-mono"
                    >
                      {item}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {currentState.callStack.length === 0 && (
                  <div className="text-gray-500 text-sm italic">Empty</div>
                )}
              </div>
            </div>

            {/* Memory */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-400 mb-4">Memory</h2>
              <div className="bg-gray-700 rounded-lg p-4 min-h-[200px]">
                <AnimatePresence>
                  {Object.entries(currentState.memory).map(([key, value], index) => (
                    <motion.div
                      key={`${key}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-green-600 text-white p-2 rounded mb-2 text-sm font-mono"
                    >
                      <span className="text-green-200">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : value}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {Object.keys(currentState.memory).length === 0 && (
                  <div className="text-gray-500 text-sm italic">Empty</div>
                )}
              </div>
            </div>

            {/* Hoisted Items */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-orange-400 mb-4">Hoisted Items</h2>
              <div className="bg-gray-700 rounded-lg p-4 min-h-[200px]">
                <AnimatePresence>
                  {Object.entries(currentState.hoistedItems).map(([key, value], index) => (
                    <motion.div
                      key={`${key}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-orange-600 text-white p-2 rounded mb-2 text-sm font-mono"
                    >
                      <span className="text-orange-200">{key}:</span> {value}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {Object.keys(currentState.hoistedItems).length === 0 && (
                  <div className="text-gray-500 text-sm italic">Empty</div>
                )}
              </div>
            </div>

            {/* Console Output */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-300 mb-4">Console Output</h2>
              <div className="bg-black rounded-lg p-4 font-mono text-sm min-h-[120px]">
                <AnimatePresence>
                  {currentState.output.map((message, index) => (
                    <motion.div
                      key={`${message}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-yellow-400"
                    >
                      {message}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {currentState.output.length === 0 && (
                  <div className="text-gray-500 italic">No output yet</div>
                )}
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-300 mb-4">Explanation</h2>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-300 leading-relaxed">
                  {currentState.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-300 mb-4">Step Navigation</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {Array.from({ length: engineRef.current.getTotalSteps() }, (_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`p-2 rounded text-sm font-semibold transition-colors ${
                  index === engineRef.current.getCurrentStep()
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hoisting; 