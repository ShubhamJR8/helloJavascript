import React from 'react';

const Visualizer = ({ state, currentStep, totalSteps }) => {
  return (
    <div className="visualizer-container">
      <div className="call-stack">
        <h3>Call Stack</h3>
        <div className="stack-items">
          {state.callStack.map((item, index) => (
            <div key={index} className="stack-item">
              {item}
            </div>
          ))}
        </div>
      </div>
      
      <div className="output">
        <h3>Console Output</h3>
        <div className="output-content">
          {state.output.map((item, index) => (
            <div key={index} className="output-item">
              {item}
            </div>
          ))}
        </div>
      </div>
      
      <div className="variables">
        <h3>Variables</h3>
        <div className="variables-content">
          {Array.from(state.variables.entries()).map(([key, value]) => (
            <div key={key} className="variable-item">
              <span className="variable-name">{key}:</span>
              <span className="variable-value">{JSON.stringify(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Visualizer; 