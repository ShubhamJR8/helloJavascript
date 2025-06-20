import React from 'react';

const CodeInput = ({ code, onChange }) => {
  return (
    <div className="code-input-container">
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="code-editor"
        placeholder="Enter your JavaScript code here..."
        spellCheck="false"
      />
    </div>
  );
};

export default CodeInput; 