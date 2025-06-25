import React from 'react';

const Visualizer = ({ state, currentStep, totalSteps }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4">Execution Visualizer</h3>
      
      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Call Stack */}
      <div className="mb-4">
        <h4 className="text-white font-medium mb-2">Call Stack</h4>
        <div className="bg-gray-900 rounded p-3 min-h-[60px]">
          {state.callStack.length > 0 ? (
            <div className="space-y-1">
              {state.callStack.map((item, index) => (
                <div key={index} className="text-green-400 text-sm font-mono">
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Empty</div>
          )}
        </div>
      </div>

      {/* Variables */}
      <div className="mb-4">
        <h4 className="text-white font-medium mb-2">Variables</h4>
        <div className="bg-gray-900 rounded p-3 min-h-[60px]">
          {state.variables.size > 0 ? (
            <div className="space-y-1">
              {Array.from(state.variables.entries()).map(([key, value]) => (
                <div key={key} className="text-blue-400 text-sm font-mono">
                  {key}: {JSON.stringify(value)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No variables</div>
          )}
        </div>
      </div>

      {/* Output */}
      <div>
        <h4 className="text-white font-medium mb-2">Console Output</h4>
        <div className="bg-gray-900 rounded p-3 min-h-[80px] max-h-[120px] overflow-y-auto">
          {state.output.length > 0 ? (
            <div className="space-y-1">
              {state.output.map((item, index) => (
                <div key={index} className="text-yellow-400 text-sm font-mono">
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No output</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Visualizer; 