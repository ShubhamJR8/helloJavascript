import React from 'react';

const CodeInput = ({ code, onCodeChange }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-2">Code Input</h3>
      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        className="w-full h-48 bg-gray-900 text-green-400 font-mono text-sm p-3 rounded border border-gray-600 focus:border-teal-500 focus:outline-none resize-none"
        placeholder="Enter your JavaScript code here..."
      />
    </div>
  );
};

export default CodeInput; 