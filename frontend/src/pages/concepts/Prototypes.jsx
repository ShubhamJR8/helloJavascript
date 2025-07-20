import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// Prototypes Presentation Engine
class PrototypesPresentationEngine {
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
        description: "Starting with empty memory and prototype chain",
        callStack: [],
        memory: {},
        prototypeChain: {},
        output: [],
        explanation: "The JavaScript engine starts with empty memory and prototype chain. Ready to explore prototypes!"
      },
      
      // Step 1: Function declaration
      {
        phase: "Function Declaration",
        description: "Declaring Animal constructor function",
        callStack: ["function Animal(name) { /* constructor */ }"],
        memory: { "Animal": "constructor function" },
        prototypeChain: { "Animal.prototype": "empty object" },
        output: [],
        explanation: "The Animal constructor function is declared. Every function in JavaScript has a prototype property."
      },

      // Step 2: Adding method to prototype
      {
        phase: "Prototype Method Addition",
        description: "Adding speak method to Animal.prototype",
        callStack: ["Animal.prototype.speak = function() { /* method */ }"],
        memory: { "Animal": "constructor function" },
        prototypeChain: { 
          "Animal.prototype": {
            "speak": "function() { console.log(`🐾 ${this.name} makes a sound.`); }"
          }
        },
        output: [],
        explanation: "The speak method is added to Animal.prototype. This method will be shared by all Animal instances."
      },

      // Step 3: Creating instance with new
      {
        phase: "Instance Creation",
        description: "Creating dog instance with new Animal('Rex')",
        callStack: ["const dog = new Animal('Rex')"],
        memory: { 
          "Animal": "constructor function",
          "dog": "Animal instance"
        },
        prototypeChain: { 
          "Animal.prototype": {
            "speak": "function() { console.log(`🐾 ${this.name} makes a sound.`); }"
          },
          "dog.__proto__": "Animal.prototype"
        },
        output: [],
        explanation: "The 'new' keyword creates a new object, sets its prototype to Animal.prototype, and calls the constructor with 'Rex'."
      },

      // Step 4: Constructor execution
      {
        phase: "Constructor Execution",
        description: "Executing Animal constructor with 'Rex'",
        callStack: ["Animal('Rex')", "this.name = 'Rex'"],
        memory: { 
          "Animal": "constructor function",
          "dog": {
            "name": "Rex",
            "__proto__": "Animal.prototype"
          }
        },
        prototypeChain: { 
          "Animal.prototype": {
            "speak": "function() { console.log(`🐾 ${this.name} makes a sound.`); }"
          },
          "dog.__proto__": "Animal.prototype"
        },
        output: [],
        explanation: "The constructor function executes, setting the name property to 'Rex' on the dog instance."
      },

      // Step 5: Calling speak method
      {
        phase: "Method Execution",
        description: "Calling dog.speak() - accessing prototype method",
        callStack: ["dog.speak()"],
        memory: { 
          "Animal": "constructor function",
          "dog": {
            "name": "Rex",
            "__proto__": "Animal.prototype"
          }
        },
        prototypeChain: { 
          "Animal.prototype": {
            "speak": "function() { console.log(`🐾 ${this.name} makes a sound.`); }"
          },
          "dog.__proto__": "Animal.prototype"
        },
        output: ["🐾 Rex makes a sound."],
        explanation: "dog.speak() is called. JavaScript looks for speak in dog, doesn't find it, then looks in dog.__proto__ (Animal.prototype) and finds it."
      },

      // Step 6: Creating second instance
      {
        phase: "Second Instance Creation",
        description: "Creating cat instance with new Animal('Whiskers')",
        callStack: ["const cat = new Animal('Whiskers')"],
        memory: { 
          "Animal": "constructor function",
          "dog": {
            "name": "Rex",
            "__proto__": "Animal.prototype"
          },
          "cat": "Animal instance"
        },
        prototypeChain: { 
          "Animal.prototype": {
            "speak": "function() { console.log(`🐾 ${this.name} makes a sound.`); }"
          },
          "dog.__proto__": "Animal.prototype",
          "cat.__proto__": "Animal.prototype"
        },
        output: ["🐾 Rex makes a sound."],
        explanation: "A second Animal instance is created. Notice that cat also has __proto__ pointing to the same Animal.prototype as dog."
      },

      // Step 7: Second constructor execution
      {
        phase: "Second Constructor Execution",
        description: "Executing Animal constructor with 'Whiskers'",
        callStack: ["Animal('Whiskers')", "this.name = 'Whiskers'"],
        memory: { 
          "Animal": "constructor function",
          "dog": {
            "name": "Rex",
            "__proto__": "Animal.prototype"
          },
          "cat": {
            "name": "Whiskers",
            "__proto__": "Animal.prototype"
          }
        },
        prototypeChain: { 
          "Animal.prototype": {
            "speak": "function() { console.log(`🐾 ${this.name} makes a sound.`); }"
          },
          "dog.__proto__": "Animal.prototype",
          "cat.__proto__": "Animal.prototype"
        },
        output: ["🐾 Rex makes a sound."],
        explanation: "The constructor sets the name property to 'Whiskers' on the cat instance. Both instances share the same prototype."
      },

      // Step 8: Calling speak on cat
      {
        phase: "Second Method Execution",
        description: "Calling cat.speak() - same prototype method",
        callStack: ["cat.speak()"],
        memory: { 
          "Animal": "constructor function",
          "dog": {
            "name": "Rex",
            "__proto__": "Animal.prototype"
          },
          "cat": {
            "name": "Whiskers",
            "__proto__": "Animal.prototype"
          }
        },
        prototypeChain: { 
          "Animal.prototype": {
            "speak": "function() { console.log(`🐾 ${this.name} makes a sound.`); }"
          },
          "dog.__proto__": "Animal.prototype",
          "cat.__proto__": "Animal.prototype"
        },
        output: ["🐾 Rex makes a sound.", "🐾 Whiskers makes a sound."],
        explanation: "cat.speak() uses the same speak method from Animal.prototype, but 'this' refers to cat, so it logs 'Whiskers'."
      },

      // Step 9: Prototype chain verification
      {
        phase: "Prototype Chain Verification",
        description: "Checking dog.__proto__ === Animal.prototype",
        callStack: ["console.log(dog.__proto__ === Animal.prototype)"],
        memory: { 
          "Animal": "constructor function",
          "dog": {
            "name": "Rex",
            "__proto__": "Animal.prototype"
          },
          "cat": {
            "name": "Whiskers",
            "__proto__": "Animal.prototype"
          }
        },
        prototypeChain: { 
          "Animal.prototype": {
            "speak": "function() { console.log(`🐾 ${this.name} makes a sound.`); }"
          },
          "dog.__proto__": "Animal.prototype",
          "cat.__proto__": "Animal.prototype"
        },
        output: ["🐾 Rex makes a sound.", "🐾 Whiskers makes a sound.", "true"],
        explanation: "The comparison returns true, confirming that dog's prototype is indeed Animal.prototype."
      },

      // Step 10: Adding instance-specific property
      {
        phase: "Instance Property Addition",
        description: "Adding breed property directly to dog instance",
        callStack: ["dog.breed = 'Golden Retriever'"],
        memory: { 
          "Animal": "constructor function",
          "dog": {
            "name": "Rex",
            "breed": "Golden Retriever",
            "__proto__": "Animal.prototype"
          },
          "cat": {
            "name": "Whiskers",
            "__proto__": "Animal.prototype"
          }
        },
        prototypeChain: { 
          "Animal.prototype": {
            "speak": "function() { console.log(`🐾 ${this.name} makes a sound.`); }"
          },
          "dog.__proto__": "Animal.prototype",
          "cat.__proto__": "Animal.prototype"
        },
        output: ["🐾 Rex makes a sound.", "🐾 Whiskers makes a sound.", "true"],
        explanation: "A breed property is added directly to the dog instance. This property is not shared with other instances."
      },

      // Step 11: Demonstration complete
      {
        phase: "Prototype Demonstration Complete",
        description: "All instances share prototype methods but have independent properties",
        callStack: [],
        memory: { 
          "Animal": "constructor function",
          "dog": {
            "name": "Rex",
            "breed": "Golden Retriever",
            "__proto__": "Animal.prototype"
          },
          "cat": {
            "name": "Whiskers",
            "__proto__": "Animal.prototype"
          }
        },
        prototypeChain: { 
          "Animal.prototype": {
            "speak": "function() { console.log(`🐾 ${this.name} makes a sound.`); }"
          },
          "dog.__proto__": "Animal.prototype",
          "cat.__proto__": "Animal.prototype"
        },
        output: ["🐾 Rex makes a sound.", "🐾 Whiskers makes a sound.", "true"],
        explanation: "🎉 Both dog and cat share the speak method through the prototype chain, but have independent name properties. This demonstrates prototype inheritance and memory efficiency!"
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

const Prototypes = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(`function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  console.log(\`🐾 \${this.name} makes a sound.\`);
};

const dog = new Animal("Rex");
dog.speak(); // 🐾 Rex makes a sound.

console.log(dog.__proto__ === Animal.prototype); // true`);

  // Engine state
  const engineRef = useRef(new PrototypesPresentationEngine());
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
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              JavaScript Prototypes Visualizer
            </h1>
            <p className="text-gray-400 mt-2">
              Interactive visualization of JavaScript prototypes and inheritance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Code and Controls */}
          <div className="space-y-6">
            {/* Code Display */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-300 mb-4">Example Code</h2>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                <pre className="text-purple-400">{code}</pre>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-300 mb-4">Controls</h2>
              
              {/* Play/Pause Controls */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={togglePlay}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    isPlaying 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-purple-600 hover:bg-purple-700'
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
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
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
              <h2 className="text-xl font-semibold text-purple-300 mb-4">Current Phase</h2>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="mb-2">
                  <span className="text-purple-400 font-semibold text-lg">{currentState.phase}</span>
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

            {/* Prototype Chain */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-pink-400 mb-4">Prototype Chain</h2>
              <div className="bg-gray-700 rounded-lg p-4 min-h-[200px]">
                <AnimatePresence>
                  {Object.entries(currentState.prototypeChain).map(([key, value], index) => (
                    <motion.div
                      key={`${key}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-pink-600 text-white p-2 rounded mb-2 text-sm font-mono"
                    >
                      <span className="text-pink-200">{key}:</span> {JSON.stringify(value)}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {Object.keys(currentState.prototypeChain).length === 0 && (
                  <div className="text-gray-500 text-sm italic">Empty</div>
                )}
              </div>
            </div>

            {/* Console Output */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-300 mb-4">Console Output</h2>
              <div className="bg-black rounded-lg p-4 font-mono text-sm min-h-[120px]">
                <AnimatePresence>
                  {currentState.output.map((message, index) => (
                    <motion.div
                      key={`${message}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-purple-400"
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
              <h2 className="text-xl font-semibold text-purple-300 mb-4">Explanation</h2>
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
          <h2 className="text-xl font-semibold text-purple-300 mb-4">Step Navigation</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {Array.from({ length: engineRef.current.getTotalSteps() }, (_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`p-2 rounded text-sm font-semibold transition-colors ${
                  index === engineRef.current.getCurrentStep()
                    ? 'bg-purple-600 text-white'
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

export default Prototypes; 