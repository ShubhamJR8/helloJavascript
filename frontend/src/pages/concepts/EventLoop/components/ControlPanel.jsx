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
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4">Controls</h3>
      
      {/* Control Buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={onStep}
          disabled={currentStep >= totalSteps - 1}
          className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          Step
        </button>
        
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={currentStep >= totalSteps - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Speed Control */}
      <div className="mb-4">
        <label className="block text-white text-sm mb-2">Speed</label>
        <select
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full bg-gray-900 text-white border border-gray-600 rounded px-3 py-2 focus:border-teal-500 focus:outline-none"
        >
          <option value={500}>Slow (0.5s)</option>
          <option value={250}>Normal (0.25s)</option>
          <option value={100}>Fast (0.1s)</option>
          <option value={50}>Very Fast (0.05s)</option>
        </select>
      </div>

      {/* Progress Info */}
      <div className="text-center">
        <div className="text-white text-sm">
          Step {currentStep + 1} of {totalSteps}
        </div>
        <div className="text-gray-400 text-xs">
          {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
        </div>
      </div>
    </div>
  );
};

export default ControlPanel; 