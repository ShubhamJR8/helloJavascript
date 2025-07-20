import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// Closures Presentation Engine
class ClosuresPresentationEngine {
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
        description: "Starting with empty call stack and memory",
        callStack: [],
        memory: {},
        output: [],
        explanation: "The JavaScript engine starts with empty call stack and memory. Ready to explore closures!"
      },
      
      // Step 1: Function declaration
      {
        phase: "Function Declaration",
        description: "Declaring createCounter function",
        callStack: ["function createCounter() { /* function body */ }"],
        memory: { "createCounter": "function" },
        output: [],
        explanation: "The createCounter function is declared and stored in memory. This function will create closures."
      },

      // Step 2: First function call - createCounter()
      {
        phase: "Function Execution",
        description: "Calling createCounter() - creating first counter",
        callStack: ["createCounter()"],
        memory: { "createCounter": "function" },
        output: [],
        explanation: "createCounter() is called, creating a new execution context with its own scope."
      },

      // Step 3: Variable declaration in createCounter
      {
        phase: "Variable Declaration",
        description: "Declaring count variable in createCounter scope",
        callStack: ["createCounter()", "let count = 0"],
        memory: { 
          "createCounter": "function",
          "createCounter_scope": { "count": 0 }
        },
        output: [],
        explanation: "The count variable is declared and initialized to 0 in the createCounter function's scope."
      },

      // Step 4: Inner function creation
      {
        phase: "Inner Function Creation",
        description: "Creating inner function that will form closure",
        callStack: ["createCounter()", "return function() { /* inner function */ }"],
        memory: { 
          "createCounter": "function",
          "createCounter_scope": { "count": 0 },
          "inner_function_1": "function with closure to count"
        },
        output: [],
        explanation: "An inner function is created and returned. This function will have access to the count variable through closure."
      },

      // Step 5: First counter assignment
      {
        phase: "Variable Assignment",
        description: "Assigning returned function to counter1",
        callStack: ["const counter1 = createCounter()"],
        memory: { 
          "createCounter": "function",
          "counter1": "function with closure to count=0"
        },
        output: [],
        explanation: "The returned function is assigned to counter1. This function now has a closure over the count variable."
      },

      // Step 6: Second function call - createCounter()
      {
        phase: "Function Execution",
        description: "Calling createCounter() again - creating second counter",
        callStack: ["createCounter()"],
        memory: { 
          "createCounter": "function",
          "counter1": "function with closure to count=0"
        },
        output: [],
        explanation: "createCounter() is called again, creating a completely new execution context with its own count variable."
      },

      // Step 7: Second count variable declaration
      {
        phase: "Variable Declaration",
        description: "Declaring count variable in second createCounter scope",
        callStack: ["createCounter()", "let count = 0"],
        memory: { 
          "createCounter": "function",
          "counter1": "function with closure to count=0",
          "createCounter_scope_2": { "count": 0 }
        },
        output: [],
        explanation: "A new count variable is declared and initialized to 0 in the second createCounter function's scope."
      },

      // Step 8: Second inner function creation
      {
        phase: "Inner Function Creation",
        description: "Creating second inner function",
        callStack: ["createCounter()", "return function() { /* inner function */ }"],
        memory: { 
          "createCounter": "function",
          "counter1": "function with closure to count=0",
          "counter2": "function with closure to count=0"
        },
        output: [],
        explanation: "A second inner function is created and returned. This function has its own closure over a different count variable."
      },

      // Step 9: Second counter assignment
      {
        phase: "Variable Assignment",
        description: "Assigning returned function to counter2",
        callStack: ["const counter2 = createCounter()"],
        memory: { 
          "createCounter": "function",
          "counter1": "function with closure to count=0",
          "counter2": "function with closure to count=0"
        },
        output: [],
        explanation: "The second returned function is assigned to counter2. Now we have two independent counters with their own closures."
      },

      // Step 10: First counter1() call
      {
        phase: "Closure Execution",
        description: "Calling counter1() - accessing closure",
        callStack: ["counter1()"],
        memory: { 
          "createCounter": "function",
          "counter1": "function with closure to count=1",
          "counter2": "function with closure to count=0"
        },
        output: ["🔢 Current count: 1"],
        explanation: "counter1() is called. It accesses its closure to the count variable and increments it from 0 to 1."
      },

      // Step 11: Second counter1() call
      {
        phase: "Closure Execution",
        description: "Calling counter1() again - count persists",
        callStack: ["counter1()"],
        memory: { 
          "createCounter": "function",
          "counter1": "function with closure to count=2",
          "counter2": "function with closure to count=0"
        },
        output: ["🔢 Current count: 1", "🔢 Current count: 2"],
        explanation: "counter1() is called again. The count variable persists in the closure and increments from 1 to 2."
      },

      // Step 12: First counter2() call
      {
        phase: "Closure Execution",
        description: "Calling counter2() - independent closure",
        callStack: ["counter2()"],
        memory: { 
          "createCounter": "function",
          "counter1": "function with closure to count=2",
          "counter2": "function with closure to count=1"
        },
        output: ["🔢 Current count: 1", "🔢 Current count: 2", "🔢 Current count: 1"],
        explanation: "counter2() is called. It has its own independent closure to a different count variable, starting from 0 and incrementing to 1."
      },

      // Step 13: Demonstration complete
      {
        phase: "Closure Demonstration Complete",
        description: "All counters have their own independent state",
        callStack: [],
        memory: { 
          "createCounter": "function",
          "counter1": "function with closure to count=2",
          "counter2": "function with closure to count=1"
        },
        output: ["🔢 Current count: 1", "🔢 Current count: 2", "🔢 Current count: 1"],
        explanation: "🎉 Each counter maintains its own independent state through closures! counter1 has count=2, counter2 has count=1. This demonstrates how closures preserve variable state."
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

const Closures = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(`function createCounter() {
  let count = 0; // private variable

  return function () {
    count++;
    console.log(\`🔢 Current count: \${count}\`);
  };
}

const counter1 = createCounter();
const counter2 = createCounter();

counter1(); // 🔢 Current count: 1
counter1(); // 🔢 Current count: 2
counter2(); // 🔢 Current count: 1 (independent)`);

  // Engine state
  const engineRef = useRef(new ClosuresPresentationEngine());
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
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
              JavaScript Closures Visualizer
            </h1>
            <p className="text-gray-400 mt-2">
              Interactive visualization of JavaScript closures and lexical scoping
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Code and Controls */}
          <div className="space-y-6">
            {/* Code Display */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-300 mb-4">Example Code</h2>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                <pre className="text-green-400">{code}</pre>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-300 mb-4">Controls</h2>
              
              {/* Play/Pause Controls */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={togglePlay}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    isPlaying 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
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
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
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
              <h2 className="text-xl font-semibold text-green-300 mb-4">Current Phase</h2>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="mb-2">
                  <span className="text-green-400 font-semibold text-lg">{currentState.phase}</span>
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

            {/* Memory/Closures */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-400 mb-4">Memory & Closures</h2>
              <div className="bg-gray-700 rounded-lg p-4 min-h-[200px]">
                <AnimatePresence>
                  {Object.entries(currentState.memory).map(([key, value], index) => (
                    <motion.div
                      key={`${key}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-purple-600 text-white p-2 rounded mb-2 text-sm font-mono"
                    >
                      <span className="text-purple-200">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : value}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {Object.keys(currentState.memory).length === 0 && (
                  <div className="text-gray-500 text-sm italic">Empty</div>
                )}
              </div>
            </div>

            {/* Console Output */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-300 mb-4">Console Output</h2>
              <div className="bg-black rounded-lg p-4 font-mono text-sm min-h-[120px]">
                <AnimatePresence>
                  {currentState.output.map((message, index) => (
                    <motion.div
                      key={`${message}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-green-400"
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
              <h2 className="text-xl font-semibold text-green-300 mb-4">Explanation</h2>
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
          <h2 className="text-xl font-semibold text-green-300 mb-4">Step Navigation</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {Array.from({ length: engineRef.current.getTotalSteps() }, (_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`p-2 rounded text-sm font-semibold transition-colors ${
                  index === engineRef.current.getCurrentStep()
                    ? 'bg-green-600 text-white'
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

export default Closures; 