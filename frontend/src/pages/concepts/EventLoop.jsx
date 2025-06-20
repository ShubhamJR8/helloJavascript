import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import CodeInput from "../../components/EventLoop/CodeInput";
import Visualizer from "../../components/EventLoop/Visualizer";
import ControlPanel from "../../components/EventLoop/ControlPanel";
import * as acorn from 'acorn';

const DEFAULT_CODE = `console.log("Start");
console.log("End");`;

// Basic AST Parser Structure
class ASTParser {
  constructor() {
    this.ast = null;
    this.errors = [];
  }

  parse(code) {
    try {
      this.ast = acorn.parse(code, {
        ecmaVersion: 2020,
        sourceType: 'module',
        locations: true
      });
      return true;
    } catch (error) {
      this.errors.push(error.message);
      return false;
    }
  }

  getErrors() {
    return this.errors;
  }

  getAST() {
    return this.ast;
  }
}

// Step Types
const StepType = {
  CONSOLE_LOG: 'console_log',
  VARIABLE_DECLARATION: 'variable_declaration',
  VARIABLE_ASSIGNMENT: 'variable_assignment',
  FUNCTION_CALL: 'function_call',
  FUNCTION_DECLARATION: 'function_declaration',
  IF_STATEMENT: 'if_statement',
  WHILE_LOOP: 'while_loop',
  FOR_LOOP: 'for_loop',
  BINARY_EXPRESSION: 'binary_expression'
};

// Basic Execution Engine
class ExecutionEngine {
  constructor() {
    this.parser = new ASTParser();
    this.currentStep = 0;
    this.steps = [];
    this.state = {
      callStack: [],
      output: [],
      variables: new Map(),
      scope: new Map()
    };
  }

  reset() {
    this.currentStep = 0;
    this.steps = [];
    this.state = {
      callStack: [],
      output: [],
      variables: new Map(),
      scope: new Map()
    };
  }

  parseCode(code) {
    const success = this.parser.parse(code);
    if (!success) {
      return false;
    }
    
    const ast = this.parser.getAST();
    this.steps = this.generateStepsFromAST(ast);
    return true;
  }

  evaluateExpression(node) {
    switch (node.type) {
      case 'Literal':
        return node.value;
      case 'Identifier':
        return this.state.variables.get(node.name);
      case 'BinaryExpression':
        const left = this.evaluateExpression(node.left);
        const right = this.evaluateExpression(node.right);
        switch (node.operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return left / right;
          case '%': return left % right;
          case '==': return left == right;
          case '===': return left === right;
          case '!=': return left != right;
          case '!==': return left !== right;
          case '<': return left < right;
          case '<=': return left <= right;
          case '>': return left > right;
          case '>=': return left >= right;
          default: return undefined;
        }
      case 'MemberExpression':
        const obj = this.evaluateExpression(node.object);
        const prop = node.computed 
          ? this.evaluateExpression(node.property)
          : node.property.name;
        return obj ? obj[prop] : undefined;
      default:
        return undefined;
    }
  }

  generateStepsFromAST(ast) {
    const steps = [];
    
    const traverse = (node) => {
      switch (node.type) {
        case 'Program':
          node.body.forEach(traverse);
          break;
          
        case 'ExpressionStatement':
          traverse(node.expression);
          break;
          
        case 'CallExpression':
          if (node.callee.type === 'MemberExpression' && 
              node.callee.object.name === 'console' && 
              node.callee.property.name === 'log') {
            const args = node.arguments.map(arg => ({
              node: arg,
              value: this.evaluateExpression(arg)
            }));
            steps.push({
              type: StepType.CONSOLE_LOG,
              arguments: args,
              location: node.loc
            });
          }
          break;
          
        case 'VariableDeclaration':
          node.declarations.forEach(decl => {
            const value = decl.init ? this.evaluateExpression(decl.init) : undefined;
            steps.push({
              type: StepType.VARIABLE_DECLARATION,
              name: decl.id.name,
              value: value,
              location: node.loc
            });
          });
          break;
          
        case 'AssignmentExpression':
          const value = this.evaluateExpression(node.right);
          steps.push({
            type: StepType.VARIABLE_ASSIGNMENT,
            name: node.left.name,
            value: value,
            location: node.loc
          });
          break;

        case 'IfStatement':
          steps.push({
            type: StepType.IF_STATEMENT,
            condition: node.test,
            consequent: node.consequent,
            alternate: node.alternate,
            location: node.loc
          });
          break;

        case 'WhileStatement':
          steps.push({
            type: StepType.WHILE_LOOP,
            condition: node.test,
            body: node.body,
            location: node.loc
          });
          break;

        case 'ForStatement':
          steps.push({
            type: StepType.FOR_LOOP,
            init: node.init,
            test: node.test,
            update: node.update,
            body: node.body,
            location: node.loc
          });
          break;
      }
    };

    traverse(ast);
    return steps;
  }

  executeStep(stepIndex) {
    if (stepIndex >= this.steps.length) {
      return false;
    }

    const step = this.steps[stepIndex];
    
    switch (step.type) {
      case StepType.CONSOLE_LOG:
        const output = step.arguments.map(arg => {
          if (arg.node.type === 'Literal') {
            return arg.value;
          }
          return `${arg.node.type === 'Identifier' ? arg.node.name : 'expression'} = ${arg.value}`;
        }).join(' ');
        this.state.output.push(output);
        this.state.callStack.push(`console.log(${output})`);
        break;
        
      case StepType.VARIABLE_DECLARATION:
        this.state.variables.set(step.name, step.value);
        this.state.callStack.push(`let ${step.name} = ${step.value}`);
        break;
        
      case StepType.VARIABLE_ASSIGNMENT:
        this.state.variables.set(step.name, step.value);
        this.state.callStack.push(`${step.name} = ${step.value}`);
        break;

      case StepType.IF_STATEMENT:
        const conditionValue = this.evaluateExpression(step.condition);
        this.state.callStack.push(`if (${conditionValue})`);
        break;

      case StepType.WHILE_LOOP:
        const whileCondition = this.evaluateExpression(step.condition);
        this.state.callStack.push(`while (${whileCondition})`);
        break;

      case StepType.FOR_LOOP:
        this.state.callStack.push('for loop iteration');
        break;
    }

    return true;
  }

  getState() {
    return this.state;
  }

  getCurrentStep() {
    return this.currentStep;
  }

  getTotalSteps() {
    return this.steps.length;
  }

  getStepExplanation(stepIndex) {
    if (stepIndex >= this.steps.length) {
      return "Simulation complete.";
    }

    const step = this.steps[stepIndex];
    switch (step.type) {
      case StepType.CONSOLE_LOG:
        const args = step.arguments.map(arg => {
          if (arg.node.type === 'Literal') {
            return arg.value;
          }
          return `${arg.node.type === 'Identifier' ? arg.node.name : 'expression'} = ${arg.value}`;
        }).join(', ');
        return `Executing console.log(${args})`;
      case StepType.VARIABLE_DECLARATION:
        return `Declaring variable ${step.name}${step.value !== undefined ? ` with value ${step.value}` : ''}`;
      case StepType.VARIABLE_ASSIGNMENT:
        return `Assigning value ${step.value} to variable ${step.name}`;
      case StepType.IF_STATEMENT:
        return `Evaluating if condition: ${this.evaluateExpression(step.condition)}`;
      case StepType.WHILE_LOOP:
        return `Evaluating while condition: ${this.evaluateExpression(step.condition)}`;
      case StepType.FOR_LOOP:
        return 'Executing for loop iteration';
      default:
        return "Processing step...";
    }
  }
}

const EventLoop = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulationState, setSimulationState] = useState(null);
  const [currentCode, setCurrentCode] = useState(DEFAULT_CODE);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentExplanation, setCurrentExplanation] = useState("Ready to start.");
  const [errors, setErrors] = useState([]);
  
  // Refs
  const engineRef = useRef(new ExecutionEngine());

  // Add animation frame ref
  const animationFrameRef = useRef(null);

  // Initialize simulation when code changes
  useEffect(() => {
    console.log("Code changed, resetting simulation");
    engineRef.current.reset();
    const success = engineRef.current.parseCode(currentCode);
    if (!success) {
      setErrors(engineRef.current.parser.getErrors());
      return;
    }
    setErrors([]);
    setSimulationState(engineRef.current.getState());
    setCurrentStepIndex(0);
    setCurrentExplanation("Ready. Enter code or use the example.");
    setIsPlaying(false);
  }, [currentCode]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleCodeChange = (newCode) => {
    setCurrentCode(newCode);
  };

  const executeNextStep = () => {
    const success = engineRef.current.executeStep(currentStepIndex);
    if (success) {
      setSimulationState(engineRef.current.getState());
      setCurrentExplanation(engineRef.current.getStepExplanation(currentStepIndex));
      setCurrentStepIndex(prev => prev + 1);
      return true;
    }
    return false;
  };

  const handleStep = () => {
    executeNextStep();
  };

  const handlePlay = () => {
    setIsPlaying(true);
    const playStep = () => {
      if (isPlaying && executeNextStep()) {
        animationFrameRef.current = requestAnimationFrame(playStep);
      } else {
        setIsPlaying(false);
      }
    };
    animationFrameRef.current = requestAnimationFrame(playStep);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleReset = () => {
    setCurrentCode(DEFAULT_CODE);
  };

  const handleSpeedChange = (speed) => {
    console.log("Speed changed:", speed);
    // TODO: Implement speed change logic
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-teal-400">Event Loop Visualization</h1>
          <button
            onClick={() => navigate('/concepts')}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Concepts
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Code Input Section */}
        <div className="mb-8 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Enter Your Code</h2>
          <CodeInput initialCode={currentCode} onCodeChange={handleCodeChange} />
          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-900/50 rounded-lg">
              <h3 className="text-lg font-semibold text-red-300 mb-2">Errors</h3>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index} className="text-red-200">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Current Step Explanation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-teal-300 mb-2">Current Step</h3>
            <p className="text-gray-300">{currentExplanation}</p>
          </div>
        </div>

        {/* Visualization Section */}
        <div className="max-w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {simulationState && (
              <>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-teal-300 mb-2">Call Stack</h3>
                  <div className="h-[200px] bg-gray-800 rounded-lg p-2 overflow-y-auto">
                    {simulationState.callStack.map((item, index) => (
                      <div key={index} className="mb-2 p-2 bg-blue-600 text-white text-sm rounded">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-teal-300 mb-2">Console Output</h3>
                  <div className="h-[200px] bg-gray-800 rounded-lg p-2 overflow-y-auto">
                    {simulationState.output.map((item, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-700 text-white text-sm rounded font-mono">
                        {`> ${item}`}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="max-w-4xl mx-auto mt-4">
            <ControlPanel
              isPlaying={isPlaying}
              onPlay={handlePlay}
              onPause={handlePause}
              onStep={handleStep}
              onReset={handleReset}
              onSpeedChange={handleSpeedChange}
            />
          </div>
        </div>

        {/* Explanation Section */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-gray-700/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-teal-300 mb-4">How the Event Loop Works</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 mb-4">
                The Event Loop is a mechanism that allows JavaScript to handle asynchronous operations
                while maintaining its single-threaded nature. Here's how it works:
              </p>
              <ol className="list-decimal list-inside text-gray-300 space-y-2">
                <li>The Call Stack executes synchronous code one at a time</li>
                <li>When an asynchronous operation is encountered, it's moved to Web APIs</li>
                <li>Once the operation completes, its callback is pushed to the Event Queue</li>
                <li>The Event Loop continuously checks if the Call Stack is empty</li>
                <li>When the Call Stack is empty, it takes the first callback from the Event Queue and pushes it to the Call Stack</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventLoop; 