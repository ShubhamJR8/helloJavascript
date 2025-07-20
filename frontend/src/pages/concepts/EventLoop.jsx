import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// Fixed Event Loop Presentation Engine
class EventLoopPresentationEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentStep = 0;
    this.isPlaying = false;
    this.speed = 1000; // 1 second per step
  }

  // Predefined steps for a comprehensive event loop example
  getSteps() {
    return [
      // Step 0: Initial State
      {
        phase: "Initial State",
        description: "Starting with empty call stack, microtask queue, and macrotask queue",
        callStack: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: [],
        output: [],
        explanation: "The JavaScript engine starts with empty queues and call stack. Ready to execute our complex example!"
      },
      
      // Step 1: First console.log
      {
        phase: "Synchronous Execution",
        description: "Executing console.log('🟢 Script start')",
        callStack: ["console.log('🟢 Script start')"],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: [],
        output: ["🟢 Script start"],
        explanation: "Synchronous code executes immediately. 'Script start' is logged to console."
      },

      // Step 2: First setTimeout registration
      {
        phase: "Synchronous Execution",
        description: "Registering first setTimeout with 0ms delay",
        callStack: ["setTimeout(() => console.log('🕒 setTimeout callback (macrotask)'), 0)"],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: ["setTimeout (0ms)"],
        output: ["🟢 Script start"],
        explanation: "First setTimeout is registered in Web APIs. This will be a macrotask."
      },

      // Step 3: Promise.resolve().then() registration
      {
        phase: "Synchronous Execution",
        description: "Registering Promise.resolve().then() callback",
        callStack: ["Promise.resolve().then(() => console.log('🔁 Promise.then (microtask)'))"],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: ["setTimeout (0ms)"],
        output: ["🟢 Script start"],
        explanation: "Promise.resolve() creates a resolved promise. The .then() callback will go to microtask queue."
      },

      // Step 4: queueMicrotask registration
      {
        phase: "Synchronous Execution",
        description: "Registering queueMicrotask callback",
        callStack: ["queueMicrotask(() => console.log('⚡ queueMicrotask callback'))"],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: ["setTimeout (0ms)"],
        output: ["🟢 Script start"],
        explanation: "queueMicrotask directly adds a callback to the microtask queue. This is another way to create microtasks."
      },

      // Step 5: CPU-intensive loop execution
      {
        phase: "Synchronous Execution",
        description: "Executing CPU-intensive for loop (blocking)",
        callStack: ["for (let i = 0; i < 1000000; i++) { /* CPU work */ }"],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: ["setTimeout (0ms)"],
        output: ["🟢 Script start"],
        explanation: "This CPU-intensive loop blocks the main thread. No other code can execute during this time!"
      },

      // Step 6: Synchronous code continues
      {
        phase: "Synchronous Execution",
        description: "Executing console.log('🟢 Synchronous code continues')",
        callStack: ["console.log('🟢 Synchronous code continues')"],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: ["setTimeout (0ms)"],
        output: ["🟢 Script start", "🟢 Synchronous code continues"],
        explanation: "After the blocking loop, synchronous execution continues. Notice the delay caused by the CPU work."
      },

      // Step 7: Second setTimeout registration (nested)
      {
        phase: "Synchronous Execution",
        description: "Registering second setTimeout with nested operations",
        callStack: ["setTimeout(() => { /* nested setTimeout */ }, 0)"],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: ["setTimeout (0ms)", "setTimeout (0ms) - nested"],
        output: ["🟢 Script start", "🟢 Synchronous code continues"],
        explanation: "Second setTimeout is registered. This one contains nested Promise.then() inside it."
      },

      // Step 8: Final synchronous code
      {
        phase: "Synchronous Execution",
        description: "Executing console.log('🟢 Script end')",
        callStack: ["console.log('🟢 Script end')"],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: ["setTimeout (0ms)", "setTimeout (0ms) - nested"],
        output: ["🟢 Script start", "🟢 Synchronous code continues", "🟢 Script end"],
        explanation: "Final synchronous code executes. Now all synchronous code is complete."
      },

      // Step 9: Synchronous phase complete
      {
        phase: "Synchronous Execution Complete",
        description: "All synchronous code finished, checking for microtasks",
        callStack: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: ["setTimeout (0ms)", "setTimeout (0ms) - nested"],
        output: ["🟢 Script start", "🟢 Synchronous code continues", "🟢 Script end"],
        explanation: "Synchronous execution phase is complete. Now the event loop checks for microtasks first!"
      },

      // Step 10: Microtasks move to queue
      {
        phase: "Microtask Queuing",
        description: "Promise.then() and queueMicrotask callbacks move to microtask queue",
        callStack: [],
        microtaskQueue: ["Promise.then() callback", "queueMicrotask callback"],
        macrotaskQueue: [],
        webAPIs: ["setTimeout (0ms)", "setTimeout (0ms) - nested"],
        output: ["🟢 Script start", "🟢 Synchronous code continues", "🟢 Script end"],
        explanation: "Both Promise.then() and queueMicrotask callbacks are queued in microtask queue. They execute in order."
      },

      // Step 11: Execute first microtask (Promise.then)
      {
        phase: "Microtask Execution",
        description: "Executing Promise.then() callback",
        callStack: ["console.log('🔁 Promise.then (microtask)')"],
        microtaskQueue: ["queueMicrotask callback"],
        macrotaskQueue: [],
        webAPIs: ["setTimeout (0ms)", "setTimeout (0ms) - nested"],
        output: ["🟢 Script start", "🟢 Synchronous code continues", "🟢 Script end", "🔁 Promise.then (microtask)"],
        explanation: "First microtask executes! Promise.then callback runs and logs 'Promise.then (microtask)'."
      },

      // Step 12: Execute second microtask (queueMicrotask)
      {
        phase: "Microtask Execution",
        description: "Executing queueMicrotask callback",
        callStack: ["console.log('⚡ queueMicrotask callback')"],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: ["setTimeout (0ms)", "setTimeout (0ms) - nested"],
        output: ["🟢 Script start", "🟢 Synchronous code continues", "🟢 Script end", "🔁 Promise.then (microtask)", "⚡ queueMicrotask callback"],
        explanation: "Second microtask executes! queueMicrotask callback runs. All microtasks are now complete."
      },

      // Step 13: setTimeout callbacks move to macrotask queue
      {
        phase: "Macrotask Queuing",
        description: "Both setTimeout callbacks move to macrotask queue",
        callStack: [],
        microtaskQueue: [],
        macrotaskQueue: ["setTimeout 1 callback", "setTimeout 2 callback"],
        webAPIs: [],
        output: ["🟢 Script start", "🟢 Synchronous code continues", "🟢 Script end", "🔁 Promise.then (microtask)", "⚡ queueMicrotask callback"],
        explanation: "After 0ms delay, both setTimeout callbacks move to macrotask queue. They execute in order."
      },

      // Step 14: Execute first macrotask (setTimeout 1)
      {
        phase: "Macrotask Execution",
        description: "Executing first setTimeout callback",
        callStack: ["console.log('🕒 setTimeout callback (macrotask)')"],
        microtaskQueue: [],
        macrotaskQueue: ["setTimeout 2 callback"],
        webAPIs: [],
        output: ["🟢 Script start", "🟢 Synchronous code continues", "🟢 Script end", "🔁 Promise.then (microtask)", "⚡ queueMicrotask callback", "🕒 setTimeout callback (macrotask)"],
        explanation: "First macrotask executes! setTimeout callback runs and logs 'setTimeout callback (macrotask)'."
      },

      // Step 15: Execute second macrotask (setTimeout 2) - start
      {
        phase: "Macrotask Execution",
        description: "Executing second setTimeout callback - start",
        callStack: ["console.log('🕒 setTimeout 2 (macrotask start)')"],
        microtaskQueue: [],
        macrotaskQueue: ["setTimeout 2 callback"],
        webAPIs: [],
        output: ["🟢 Script start", "🟢 Synchronous code continues", "🟢 Script end", "🔁 Promise.then (microtask)", "⚡ queueMicrotask callback", "🕒 setTimeout callback (macrotask)", "🕒 setTimeout 2 (macrotask start)"],
        explanation: "Second macrotask starts! This setTimeout contains nested Promise.then() inside it."
      },

      // Step 16: Nested Promise.then() registration
      {
        phase: "Macrotask Execution",
        description: "Registering nested Promise.then() inside setTimeout",
        callStack: ["Promise.resolve().then(() => console.log('🔁 Nested Promise.then inside setTimeout (microtask)'))"],
        microtaskQueue: [],
        macrotaskQueue: ["setTimeout 2 callback"],
        webAPIs: [],
        output: ["🟢 Script start", "🟢 Synchronous code continues", "🟢 Script end", "🔁 Promise.then (microtask)", "⚡ queueMicrotask callback", "🕒 setTimeout callback (macrotask)", "🕒 setTimeout 2 (macrotask start)"],
        explanation: "Nested Promise.then() is registered inside the setTimeout callback. This creates a new microtask!"
      },

      // Step 17: setTimeout 2 end
      {
        phase: "Macrotask Execution",
        description: "Executing setTimeout 2 end",
        callStack: ["console.log('🕒 setTimeout 2 (macrotask end)')"],
        microtaskQueue: ["Nested Promise.then callback"],
        macrotaskQueue: [],
        webAPIs: [],
        output: ["🟢 Script start", "🟢 Synchronous code continues", "🟢 Script end", "🔁 Promise.then (microtask)", "⚡ queueMicrotask callback", "🕒 setTimeout callback (macrotask)", "🕒 setTimeout 2 (macrotask start)", "🕒 setTimeout 2 (macrotask end)"],
        explanation: "setTimeout 2 ends, but notice the nested Promise.then() is now in the microtask queue!"
      },

      // Step 18: Execute nested microtask
      {
        phase: "Microtask Execution",
        description: "Executing nested Promise.then() callback",
        callStack: ["console.log('🔁 Nested Promise.then inside setTimeout (microtask)')"],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: [],
        output: ["🟢 Script start", "🟢 Synchronous code continues", "🟢 Script end", "🔁 Promise.then (microtask)", "⚡ queueMicrotask callback", "🕒 setTimeout callback (macrotask)", "🕒 setTimeout 2 (macrotask start)", "🕒 setTimeout 2 (macrotask end)", "🔁 Nested Promise.then inside setTimeout (microtask)"],
        explanation: "Nested microtask executes! Even though it was created inside a macrotask, it executes immediately because microtasks have priority."
      },

      // Step 19: Event loop complete
      {
        phase: "Event Loop Complete",
        description: "All queues are empty, event loop complete",
        callStack: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        webAPIs: [],
        output: ["🟢 Script start", "🟢 Synchronous code continues", "🟢 Script end", "🔁 Promise.then (microtask)", "⚡ queueMicrotask callback", "🕒 setTimeout callback (macrotask)", "🕒 setTimeout 2 (macrotask start)", "🕒 setTimeout 2 (macrotask end)", "🔁 Nested Promise.then inside setTimeout (microtask)"],
        explanation: "🎉 All queues are empty! The event loop has completed. Notice the execution order: Synchronous → Microtasks → Macrotasks → Nested Microtasks. This shows the complete event loop cycle!"
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

const EventLoop = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(`console.log('🟢 Script start');

// 1. Macrotask
setTimeout(() => {
  console.log('🕒 setTimeout callback (macrotask)');
}, 0);

// 2. Microtask
Promise.resolve().then(() => {
  console.log('🔁 Promise.then (microtask)');
});

// 3. Direct microtask
queueMicrotask(() => {
  console.log('⚡ queueMicrotask callback');
});

// 4. Synchronous blocking
for (let i = 0; i < 1000000; i++) {
  // simulate CPU work
}
console.log('🟢 Synchronous code continues');

// 5. Nested microtask inside macrotask
setTimeout(() => {
  console.log('🕒 setTimeout 2 (macrotask start)');
  
  Promise.resolve().then(() => {
    console.log('🔁 Nested Promise.then inside setTimeout (microtask)');
  });

  console.log('🕒 setTimeout 2 (macrotask end)');
}, 0);

// 6. Final synchronous
console.log('🟢 Script end');`);

  // Engine state
  const engineRef = useRef(new EventLoopPresentationEngine());
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
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              JavaScript Event Loop Visualizer
            </h1>
            <p className="text-gray-400 mt-2">
              Interactive visualization of JavaScript's event loop execution phases
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Code and Controls */}
          <div className="space-y-6">
            {/* Code Display */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Example Code</h2>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                <pre className="text-green-400">{code}</pre>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Controls</h2>
              
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
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
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
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Current Phase</h2>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="mb-2">
                  <span className="text-purple-400 font-semibold text-lg">{currentState.phase}</span>
                </div>
                <div className="text-gray-300">
                  {currentState.description}
                </div>
              </div>
            </div>

            {/* Event Loop Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Call Stack */}
              <motion.div 
                className="bg-gray-800 rounded-lg p-4"
                layout
              >
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Call Stack</h3>
                <div className="bg-gray-700 rounded-lg p-3 min-h-[120px]">
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
              </motion.div>

              {/* Microtask Queue */}
              <motion.div 
                className="bg-gray-800 rounded-lg p-4"
                layout
              >
                <h3 className="text-lg font-semibold text-green-400 mb-3">Microtask Queue</h3>
                <div className="bg-gray-700 rounded-lg p-3 min-h-[120px]">
                  <AnimatePresence>
                    {currentState.microtaskQueue.map((item, index) => (
                      <motion.div
                        key={`${item}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-green-600 text-white p-2 rounded mb-2 text-sm font-mono"
                      >
                        {item}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {currentState.microtaskQueue.length === 0 && (
                    <div className="text-gray-500 text-sm italic">Empty</div>
                  )}
                </div>
              </motion.div>

              {/* Macrotask Queue */}
              <motion.div 
                className="bg-gray-800 rounded-lg p-4"
                layout
              >
                <h3 className="text-lg font-semibold text-orange-400 mb-3">Macrotask Queue</h3>
                <div className="bg-gray-700 rounded-lg p-3 min-h-[120px]">
                  <AnimatePresence>
                    {currentState.macrotaskQueue.map((item, index) => (
                      <motion.div
                        key={`${item}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-orange-600 text-white p-2 rounded mb-2 text-sm font-mono"
                      >
                        {item}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {currentState.macrotaskQueue.length === 0 && (
                    <div className="text-gray-500 text-sm italic">Empty</div>
                  )}
                </div>
              </motion.div>

              {/* Web APIs */}
              <motion.div 
                className="bg-gray-800 rounded-lg p-4"
                layout
              >
                <h3 className="text-lg font-semibold text-purple-400 mb-3">Web APIs</h3>
                <div className="bg-gray-700 rounded-lg p-3 min-h-[120px]">
                  <AnimatePresence>
                    {currentState.webAPIs.map((item, index) => (
                      <motion.div
                        key={`${item}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="bg-purple-600 text-white p-2 rounded mb-2 text-sm font-mono"
                      >
                        {item}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {currentState.webAPIs.length === 0 && (
                    <div className="text-gray-500 text-sm italic">Empty</div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Console Output */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Console Output</h2>
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
              <h2 className="text-xl font-semibold text-teal-300 mb-4">Explanation</h2>
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
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Step Navigation</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {Array.from({ length: engineRef.current.getTotalSteps() }, (_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`p-2 rounded text-sm font-semibold transition-colors ${
                  index === engineRef.current.getCurrentStep()
                    ? 'bg-blue-600 text-white'
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

export default EventLoop; 