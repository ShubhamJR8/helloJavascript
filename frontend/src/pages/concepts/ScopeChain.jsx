import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// Scope Chain Presentation Engine
class ScopeChainPresentationEngine {
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
        description: "Starting with empty scope chain and memory",
        callStack: [],
        memory: {},
        scopeChain: [],
        output: [],
        explanation: "The JavaScript engine starts with empty scope chain and memory. Ready to explore scope chain!"
      },
      
      // Step 1: Global variable declaration
      {
        phase: "Global Scope",
        description: "Declaring global variable",
        callStack: ["const globalVar = '🌍 Global'"],
        memory: { "globalVar": "🌍 Global" },
        scopeChain: ["Global Scope"],
        output: [],
        explanation: "A global variable is declared. This creates the global scope with one variable."
      },

      // Step 2: Outer function declaration
      {
        phase: "Function Declaration",
        description: "Declaring outer function",
        callStack: ["function outer() { /* function body */ }"],
        memory: { 
          "globalVar": "🌍 Global",
          "outer": "function"
        },
        scopeChain: ["Global Scope"],
        output: [],
        explanation: "The outer function is declared in the global scope. Functions create their own scope when called."
      },

      // Step 3: Outer function call
      {
        phase: "Outer Function Execution",
        description: "Calling outer function - creating new scope",
        callStack: ["outer()"],
        memory: { 
          "globalVar": "🌍 Global",
          "outer": "function"
        },
        scopeChain: ["Global Scope", "Outer Function Scope"],
        output: [],
        explanation: "outer() is called, creating a new execution context with its own scope."
      },

      // Step 4: Outer variable declaration
      {
        phase: "Outer Scope Variable",
        description: "Declaring variable in outer function scope",
        callStack: ["outer()", "const outerVar = '🌤 Outer'"],
        memory: { 
          "globalVar": "🌍 Global",
          "outer": "function",
          "outer_scope": { "outerVar": "🌤 Outer" }
        },
        scopeChain: ["Global Scope", "Outer Function Scope"],
        output: [],
        explanation: "A variable is declared in the outer function's scope. This variable is accessible within the outer function."
      },

      // Step 5: Inner function declaration
      {
        phase: "Inner Function Declaration",
        description: "Declaring inner function within outer function",
        callStack: ["outer()", "function inner() { /* function body */ }"],
        memory: { 
          "globalVar": "🌍 Global",
          "outer": "function",
          "outer_scope": { "outerVar": "🌤 Outer" }
        },
        scopeChain: ["Global Scope", "Outer Function Scope"],
        output: [],
        explanation: "The inner function is declared within the outer function. It will have access to variables in both scopes."
      },

      // Step 6: Inner function call
      {
        phase: "Inner Function Execution",
        description: "Calling inner function - creating nested scope",
        callStack: ["outer()", "inner()"],
        memory: { 
          "globalVar": "🌍 Global",
          "outer": "function",
          "outer_scope": { "outerVar": "🌤 Outer" }
        },
        scopeChain: ["Global Scope", "Outer Function Scope", "Inner Function Scope"],
        output: [],
        explanation: "inner() is called, creating a new execution context with its own scope. The scope chain now has three levels."
      },

      // Step 7: Inner variable declaration
      {
        phase: "Inner Scope Variable",
        description: "Declaring variable in inner function scope",
        callStack: ["outer()", "inner()", "const innerVar = '🌪 Inner'"],
        memory: { 
          "globalVar": "🌍 Global",
          "outer": "function",
          "outer_scope": { "outerVar": "🌤 Outer" },
          "inner_scope": { "innerVar": "🌪 Inner" }
        },
        scopeChain: ["Global Scope", "Outer Function Scope", "Inner Function Scope"],
        output: [],
        explanation: "A variable is declared in the inner function's scope. This variable is only accessible within the inner function."
      },

      // Step 8: Accessing global variable from inner scope
      {
        phase: "Scope Chain Lookup",
        description: "Accessing globalVar from inner function - scope chain lookup",
        callStack: ["outer()", "inner()", "console.log(globalVar)"],
        memory: { 
          "globalVar": "🌍 Global",
          "outer": "function",
          "outer_scope": { "outerVar": "🌤 Outer" },
          "inner_scope": { "innerVar": "🌪 Inner" }
        },
        scopeChain: ["Global Scope", "Outer Function Scope", "Inner Function Scope"],
        output: ["🌍 Global"],
        explanation: "inner() tries to access globalVar. It's not found in inner scope, so it looks up the scope chain to global scope and finds it."
      },

      // Step 9: Accessing outer variable from inner scope
      {
        phase: "Scope Chain Lookup",
        description: "Accessing outerVar from inner function - scope chain lookup",
        callStack: ["outer()", "inner()", "console.log(outerVar)"],
        memory: { 
          "globalVar": "🌍 Global",
          "outer": "function",
          "outer_scope": { "outerVar": "🌤 Outer" },
          "inner_scope": { "innerVar": "🌪 Inner" }
        },
        scopeChain: ["Global Scope", "Outer Function Scope", "Inner Function Scope"],
        output: ["🌍 Global", "🌤 Outer"],
        explanation: "inner() tries to access outerVar. It's not found in inner scope, so it looks up to outer scope and finds it."
      },

      // Step 10: Accessing inner variable
      {
        phase: "Local Variable Access",
        description: "Accessing innerVar from inner function - local scope",
        callStack: ["outer()", "inner()", "console.log(innerVar)"],
        memory: { 
          "globalVar": "🌍 Global",
          "outer": "function",
          "outer_scope": { "outerVar": "🌤 Outer" },
          "inner_scope": { "innerVar": "🌪 Inner" }
        },
        scopeChain: ["Global Scope", "Outer Function Scope", "Inner Function Scope"],
        output: ["🌍 Global", "🌤 Outer", "🌪 Inner"],
        explanation: "inner() accesses innerVar. It's found directly in the inner scope, so no scope chain lookup is needed."
      },

      // Step 11: Variable shadowing demonstration
      {
        phase: "Variable Shadowing",
        description: "Demonstrating variable shadowing with same name",
        callStack: ["outer()", "inner()", "const globalVar = '🌪 Shadowed Global'"],
        memory: { 
          "globalVar": "🌍 Global",
          "outer": "function",
          "outer_scope": { "outerVar": "🌤 Outer" },
          "inner_scope": { 
            "innerVar": "🌪 Inner",
            "globalVar": "🌪 Shadowed Global"
          }
        },
        scopeChain: ["Global Scope", "Outer Function Scope", "Inner Function Scope"],
        output: ["🌍 Global", "🌤 Outer", "🌪 Inner"],
        explanation: "A variable with the same name as globalVar is declared in inner scope. This shadows the global variable."
      },

      // Step 12: Accessing shadowed variable
      {
        phase: "Shadowed Variable Access",
        description: "Accessing shadowed globalVar from inner scope",
        callStack: ["outer()", "inner()", "console.log(globalVar)"],
        memory: { 
          "globalVar": "🌍 Global",
          "outer": "function",
          "outer_scope": { "outerVar": "🌤 Outer" },
          "inner_scope": { 
            "innerVar": "🌪 Inner",
            "globalVar": "🌪 Shadowed Global"
          }
        },
        scopeChain: ["Global Scope", "Outer Function Scope", "Inner Function Scope"],
        output: ["🌍 Global", "🌤 Outer", "🌪 Inner", "🌪 Shadowed Global"],
        explanation: "inner() accesses globalVar. It finds the shadowed version in inner scope first, so it uses that instead of the global one."
      },

      // Step 13: Accessing global variable explicitly
      {
        phase: "Explicit Global Access",
        description: "Accessing global variable explicitly using window",
        callStack: ["outer()", "inner()", "console.log(window.globalVar)"],
        memory: { 
          "globalVar": "🌍 Global",
          "outer": "function",
          "outer_scope": { "outerVar": "🌤 Outer" },
          "inner_scope": { 
            "innerVar": "🌪 Inner",
            "globalVar": "🌪 Shadowed Global"
          }
        },
        scopeChain: ["Global Scope", "Outer Function Scope", "Inner Function Scope"],
        output: ["🌍 Global", "🌤 Outer", "🌪 Inner", "🌪 Shadowed Global", "🌍 Global"],
        explanation: "Using window.globalVar explicitly accesses the global variable, bypassing the shadowed variable in inner scope."
      },

      // Step 14: Scope chain demonstration complete
      {
        phase: "Scope Chain Demonstration Complete",
        description: "All scope chain behaviors demonstrated",
        callStack: [],
        memory: { 
          "globalVar": "🌍 Global",
          "outer": "function",
          "outer_scope": { "outerVar": "🌤 Outer" },
          "inner_scope": { 
            "innerVar": "🌪 Inner",
            "globalVar": "🌪 Shadowed Global"
          }
        },
        scopeChain: ["Global Scope", "Outer Function Scope", "Inner Function Scope"],
        output: ["🌍 Global", "🌤 Outer", "🌪 Inner", "🌪 Shadowed Global", "🌍 Global"],
        explanation: "🎉 Scope chain demonstration complete! Key takeaways: Variables are searched up the scope chain, inner scopes can shadow outer variables, and explicit global access can bypass shadowing."
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

const ScopeChain = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(`const globalVar = "🌍 Global";

function outer() {
  const outerVar = "🌤 Outer";

  function inner() {
    const innerVar = "🌪 Inner";
    console.log(globalVar); // 🌍 Global
    console.log(outerVar);  // 🌤 Outer
    console.log(innerVar);  // 🌪 Inner
  }

  inner();
}

outer();`);

  // Engine state
  const engineRef = useRef(new ScopeChainPresentationEngine());
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
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              JavaScript Scope Chain Visualizer
            </h1>
            <p className="text-gray-400 mt-2">
              Interactive visualization of JavaScript scope chain and variable lookup
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Code and Controls */}
          <div className="space-y-6">
            {/* Code Display */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4">Example Code</h2>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                <pre className="text-cyan-400">{code}</pre>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4">Controls</h2>
              
              {/* Play/Pause Controls */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={togglePlay}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    isPlaying 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-cyan-600 hover:bg-cyan-700'
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
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
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
              <h2 className="text-xl font-semibold text-cyan-300 mb-4">Current Phase</h2>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="mb-2">
                  <span className="text-cyan-400 font-semibold text-lg">{currentState.phase}</span>
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

            {/* Scope Chain */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-400 mb-4">Scope Chain</h2>
              <div className="bg-gray-700 rounded-lg p-4 min-h-[200px]">
                <AnimatePresence>
                  {currentState.scopeChain.map((scope, index) => (
                    <motion.div
                      key={`${scope}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-blue-600 text-white p-2 rounded mb-2 text-sm font-mono"
                    >
                      {scope}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {currentState.scopeChain.length === 0 && (
                  <div className="text-gray-500 text-sm italic">Empty</div>
                )}
              </div>
            </div>

            {/* Console Output */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4">Console Output</h2>
              <div className="bg-black rounded-lg p-4 font-mono text-sm min-h-[120px]">
                <AnimatePresence>
                  {currentState.output.map((message, index) => (
                    <motion.div
                      key={`${message}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-cyan-400"
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
              <h2 className="text-xl font-semibold text-cyan-300 mb-4">Explanation</h2>
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
          <h2 className="text-xl font-semibold text-cyan-300 mb-4">Step Navigation</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {Array.from({ length: engineRef.current.getTotalSteps() }, (_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`p-2 rounded text-sm font-semibold transition-colors ${
                  index === engineRef.current.getCurrentStep()
                    ? 'bg-cyan-600 text-white'
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

export default ScopeChain; 