import React from 'react';

const ControlPanel = ({
  onStep,
  onPlay,
  onPause,
  onReset,
  onSpeedChange,
  isPlaying,
  currentStep,
  totalSteps,
  speed
}) => {
  return (
    <div className="control-panel">
      <div className="controls">
        <button onClick={onStep} disabled={isPlaying || currentStep >= totalSteps}>
          Step
        </button>
        <button onClick={onPlay} disabled={isPlaying || currentStep >= totalSteps}>
          Play
        </button>
        <button onClick={onPause} disabled={!isPlaying}>
          Pause
        </button>
        <button onClick={onReset}>
          Reset
        </button>
      </div>
      
      <div className="speed-control">
        <label>Speed:</label>
        <select value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))}>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
      </div>
      
      <div className="progress">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
};

export default ControlPanel; 