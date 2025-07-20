import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// Async/Await Presentation Engine
class AsyncAwaitPresentationEngine {
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
        promiseQueue: [],
        output: [],
        explanation: "The JavaScript engine starts with empty call stack and memory. Ready to explore async/await!"
      },
      
      // Step 1: Function declaration
      {
        phase: "Function Declaration",
        description: "Declaring fetchData function that returns a Promise",
        callStack: ["function fetchData() { /* function body */ }"],
        memory: { "fetchData": "function that returns Promise" },
        promiseQueue: [],
        output: [],
        explanation: "The fetchData function is declared. This function will return a Promise that resolves after 1 second."
      },

      // Step 2: Async function declaration
      {
        phase: "Async Function Declaration",
        description: "Declaring async main function",
        callStack: ["async function main() { /* function body */ }"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function"
        },
        promiseQueue: [],
        output: [],
        explanation: "The main function is declared with the async keyword. This makes it an async function that can use await."
      },

      // Step 3: Main function call
      {
        phase: "Async Function Execution",
        description: "Calling main() - async function execution starts",
        callStack: ["main()"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function"
        },
        promiseQueue: [],
        output: [],
        explanation: "main() is called. Async functions always return a Promise, even if you don't explicitly return one."
      },

      // Step 4: First console.log in main
      {
        phase: "Synchronous Execution",
        description: "Executing console.log('⏳ Fetching...')",
        callStack: ["main()", "console.log('⏳ Fetching...')"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function"
        },
        promiseQueue: [],
        output: ["⏳ Fetching..."],
        explanation: "The first console.log executes synchronously. This happens before any async operations."
      },

      // Step 5: Try block start
      {
        phase: "Try Block",
        description: "Entering try block for error handling",
        callStack: ["main()", "try { /* try block */ }"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function"
        },
        promiseQueue: [],
        output: ["⏳ Fetching..."],
        explanation: "The try block starts. This will handle any errors that occur during the async operations."
      },

      // Step 6: Await fetchData() call
      {
        phase: "Await Operation",
        description: "Calling await fetchData() - pausing execution",
        callStack: ["main()", "const result = await fetchData()"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function"
        },
        promiseQueue: ["fetchData Promise"],
        output: ["⏳ Fetching..."],
        explanation: "await fetchData() is called. The async function pauses here and waits for the Promise to resolve."
      },

      // Step 7: fetchData function execution
      {
        phase: "Promise Creation",
        description: "fetchData() creates and returns a Promise",
        callStack: ["main()", "fetchData()", "new Promise((resolve) => { /* promise body */ })"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function",
          "promise": "pending Promise"
        },
        promiseQueue: ["fetchData Promise"],
        output: ["⏳ Fetching..."],
        explanation: "fetchData() creates a new Promise that will resolve after 1 second using setTimeout."
      },

      // Step 8: setTimeout registration
      {
        phase: "Asynchronous Operation",
        description: "setTimeout registered - Promise will resolve after 1 second",
        callStack: ["main()", "fetchData()", "setTimeout(() => resolve('📦 Data loaded'), 1000)"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function",
          "promise": "pending Promise",
          "setTimeout": "registered for 1000ms"
        },
        promiseQueue: ["fetchData Promise"],
        output: ["⏳ Fetching..."],
        explanation: "setTimeout is registered to resolve the Promise with '📦 Data loaded' after 1000ms."
      },

      // Step 9: Promise resolution
      {
        phase: "Promise Resolution",
        description: "Promise resolves with '📦 Data loaded'",
        callStack: ["main()", "const result = await fetchData()"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function",
          "result": "📦 Data loaded"
        },
        promiseQueue: [],
        output: ["⏳ Fetching..."],
        explanation: "The Promise resolves with '📦 Data loaded'. The await expression now returns this value."
      },

      // Step 10: Result assignment
      {
        phase: "Variable Assignment",
        description: "Assigning resolved value to result variable",
        callStack: ["main()", "result = '📦 Data loaded'"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function",
          "result": "📦 Data loaded"
        },
        promiseQueue: [],
        output: ["⏳ Fetching..."],
        explanation: "The resolved value '📦 Data loaded' is assigned to the result variable."
      },

      // Step 11: Logging result
      {
        phase: "Result Logging",
        description: "Logging the resolved result",
        callStack: ["main()", "console.log(result)"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function",
          "result": "📦 Data loaded"
        },
        promiseQueue: [],
        output: ["⏳ Fetching...", "📦 Data loaded"],
        explanation: "The result is logged to the console. This happens after the Promise has resolved."
      },

      // Step 12: Try block completion
      {
        phase: "Try Block Completion",
        description: "Try block completes successfully",
        callStack: ["main()", "} // end of try block"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function",
          "result": "📦 Data loaded"
        },
        promiseQueue: [],
        output: ["⏳ Fetching...", "📦 Data loaded"],
        explanation: "The try block completes successfully. No errors occurred, so the catch block is skipped."
      },

      // Step 13: Final console.log
      {
        phase: "Final Logging",
        description: "Executing final console.log('✅ Done')",
        callStack: ["main()", "console.log('✅ Done')"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function",
          "result": "📦 Data loaded"
        },
        promiseQueue: [],
        output: ["⏳ Fetching...", "📦 Data loaded", "✅ Done"],
        explanation: "The final console.log executes. This happens after all async operations are complete."
      },

      // Step 14: Async function completion
      {
        phase: "Async Function Completion",
        description: "main() function completes and returns Promise",
        callStack: [],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function",
          "result": "📦 Data loaded",
          "mainPromise": "resolved Promise"
        },
        promiseQueue: [],
        output: ["⏳ Fetching...", "📦 Data loaded", "✅ Done"],
        explanation: "The main() function completes. Since it's an async function, it returns a resolved Promise."
      },

      // Step 15: Error handling demonstration
      {
        phase: "Error Handling Demo",
        description: "Demonstrating error handling with try/catch",
        callStack: ["async function errorDemo() { /* error demo */ }"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function",
          "result": "📦 Data loaded",
          "mainPromise": "resolved Promise",
          "errorDemo": "async function"
        },
        promiseQueue: [],
        output: ["⏳ Fetching...", "📦 Data loaded", "✅ Done"],
        explanation: "Let's demonstrate error handling. Async functions can use try/catch to handle Promise rejections."
      },

      // Step 16: Error scenario
      {
        phase: "Error Scenario",
        description: "Creating a Promise that rejects",
        callStack: ["errorDemo()", "const errorPromise = Promise.reject('❌ Something went wrong')"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function",
          "result": "📦 Data loaded",
          "mainPromise": "resolved Promise",
          "errorDemo": "async function",
          "errorPromise": "rejected Promise"
        },
        promiseQueue: ["errorPromise"],
        output: ["⏳ Fetching...", "📦 Data loaded", "✅ Done"],
        explanation: "A Promise that rejects is created. This will trigger the catch block."
      },

      // Step 17: Await error
      {
        phase: "Await Error",
        description: "awaiting the rejected Promise",
        callStack: ["errorDemo()", "await errorPromise"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function",
          "result": "📦 Data loaded",
          "mainPromise": "resolved Promise",
          "errorDemo": "async function",
          "errorPromise": "rejected Promise"
        },
        promiseQueue: [],
        output: ["⏳ Fetching...", "📦 Data loaded", "✅ Done"],
        explanation: "await errorPromise throws an error because the Promise rejects. This is caught by the catch block."
      },

      // Step 18: Catch block execution
      {
        phase: "Catch Block",
        description: "Executing catch block to handle the error",
        callStack: ["errorDemo()", "catch (e) { console.log('❌ Error:', e) }"],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function",
          "result": "📦 Data loaded",
          "mainPromise": "resolved Promise",
          "errorDemo": "async function",
          "error": "❌ Something went wrong"
        },
        promiseQueue: [],
        output: ["⏳ Fetching...", "📦 Data loaded", "✅ Done", "❌ Error: ❌ Something went wrong"],
        explanation: "The catch block executes and logs the error. This demonstrates how async/await handles errors."
      },

      // Step 19: Async/await demonstration complete
      {
        phase: "Async/Await Demonstration Complete",
        description: "All async/await behaviors demonstrated",
        callStack: [],
        memory: { 
          "fetchData": "function that returns Promise",
          "main": "async function",
          "result": "📦 Data loaded",
          "mainPromise": "resolved Promise",
          "errorDemo": "async function",
          "error": "❌ Something went wrong"
        },
        promiseQueue: [],
        output: ["⏳ Fetching...", "📦 Data loaded", "✅ Done", "❌ Error: ❌ Something went wrong"],
        explanation: "🎉 Async/await demonstration complete! Key takeaways: async functions return Promises, await pauses execution until Promise resolves, and try/catch handles errors elegantly."
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

const AsyncAwait = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(`function fetchData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("📦 Data loaded");
    }, 1000);
  });
}

async function main() {
  console.log("⏳ Fetching...");
  
  try {
    const result = await fetchData();
    console.log(result); // 📦 Data loaded
  } catch (e) {
    console.log("❌ Error:", e);
  }

  console.log("✅ Done");
}

main();`);

  // Engine state
  const engineRef = useRef(new AsyncAwaitPresentationEngine());
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
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              JavaScript Async/Await Visualizer
            </h1>
            <p className="text-gray-400 mt-2">
              Interactive visualization of JavaScript async/await and Promise handling
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Code and Controls */}
          <div className="space-y-6">
            {/* Code Display */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-indigo-300 mb-4">Example Code</h2>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                <pre className="text-indigo-400">{code}</pre>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-indigo-300 mb-4">Controls</h2>
              
              {/* Play/Pause Controls */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={togglePlay}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    isPlaying 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
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
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
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
              <h2 className="text-xl font-semibold text-indigo-300 mb-4">Current Phase</h2>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="mb-2">
                  <span className="text-indigo-400 font-semibold text-lg">{currentState.phase}</span>
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
                      <span className="text-green-200">{key}:</span> {JSON.stringify(value)}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {Object.keys(currentState.memory).length === 0 && (
                  <div className="text-gray-500 text-sm italic">Empty</div>
                )}
              </div>
            </div>

            {/* Promise Queue */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-400 mb-4">Promise Queue</h2>
              <div className="bg-gray-700 rounded-lg p-4 min-h-[120px]">
                <AnimatePresence>
                  {currentState.promiseQueue.map((promise, index) => (
                    <motion.div
                      key={`${promise}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-purple-600 text-white p-2 rounded mb-2 text-sm font-mono"
                    >
                      {promise}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {currentState.promiseQueue.length === 0 && (
                  <div className="text-gray-500 text-sm italic">Empty</div>
                )}
              </div>
            </div>

            {/* Console Output */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-indigo-300 mb-4">Console Output</h2>
              <div className="bg-black rounded-lg p-4 font-mono text-sm min-h-[120px]">
                <AnimatePresence>
                  {currentState.output.map((message, index) => (
                    <motion.div
                      key={`${message}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-indigo-400"
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
              <h2 className="text-xl font-semibold text-indigo-300 mb-4">Explanation</h2>
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
          <h2 className="text-xl font-semibold text-indigo-300 mb-4">Step Navigation</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {Array.from({ length: engineRef.current.getTotalSteps() }, (_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`p-2 rounded text-sm font-semibold transition-colors ${
                  index === engineRef.current.getCurrentStep()
                    ? 'bg-indigo-600 text-white'
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

export default AsyncAwait; 