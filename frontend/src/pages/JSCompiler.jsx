import React, { useState, useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/eclipse.css";
import "codemirror/theme/dracula.css";

const themes = {
  light: "eclipse",
  dark: "dracula",
};

const JSCompiler = ({ starterCode, testCases, nextQuestion }) => {
  const editorRef = useRef(null);
  const editorElement = useRef(null);
  const workerRef = useRef(null);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    if (!editorRef.current && editorElement.current) {
      editorRef.current = CodeMirror.fromTextArea(editorElement.current, {
        lineNumbers: true,
        mode: "javascript",
        theme: themes[theme],
      });
    }
    if (editorRef.current) {
      editorRef.current.setValue(starterCode || "// Write your code here...");
      editorRef.current.setOption("theme", themes[theme]);
    }
  }, [starterCode, theme]);

  const runCode = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    const code = editorRef.current.getValue();
    setConsoleOutput([]);
    setTestResults([]);

    const workerBlob = new Blob(
      [
        `self.console = {
          log: (...args) => self.postMessage({ type: 'log', data: args.map(a => String(a)).join(' ') }),
          error: (...args) => self.postMessage({ type: 'error', data: args.map(a => String(a)).join(' ') })
        };

        self.onmessage = function(e) {
          try {
            let userFunction;
            eval(e.data.functionCode);
            userFunction = eval(e.data.functionName);

            const results = e.data.testCases.map(tc => {
              try {
                const output = JSON.stringify(userFunction(tc.input));
                return { 
                  input: tc.input, 
                  expected: JSON.stringify(tc.expectedOutput), 
                  output, 
                  passed: output === JSON.stringify(tc.expectedOutput)
                };
              } catch (err) {
                return { input: tc.input, expected: tc.expectedOutput, output: err.message, passed: false };
              }
            });
            self.postMessage({ type: 'testResults', data: results });
          } catch (err) {
            self.console.error(err.message);
          }
        };`,
      ],
      { type: "application/javascript" }
    );

    workerRef.current = new Worker(URL.createObjectURL(workerBlob));

    workerRef.current.onmessage = (event) => {
      if (event.data.type === "log") {
        setConsoleOutput((prev) => [...prev, event.data]);
      } else if (event.data.type === "testResults") {
        setTestResults(event.data.data);
      } else if (event.data.type === "error") {
        setConsoleOutput((prev) => [...prev, { data: "Error: " + event.data.data }]);
      }
    };

    const functionName = code.match(/function (\w+)/)?.[1];
    if (!functionName) {
      setConsoleOutput((prev) => [...prev, { data: "Error: No function found in the code." }]);
      return;
    }

    workerRef.current.postMessage({ functionCode: code, functionName, testCases });
  };

  const handleSubmit = () => {
    if (testResults.every(result => result.passed)) {
      nextQuestion();
    } else {
      alert("Some test cases failed. Please correct your code before submitting.");
    }
  };

  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  return (
    <div className="flex flex-col bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-600">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl text-teal-400">Code Editor</h2>
        <select
          onChange={(e) => setTheme(e.target.value)}
          value={theme}
          className="p-1 border border-gray-600 rounded bg-gray-900 text-white"
        >
          <option value="light">Light Theme</option>
          <option value="dark">Dark Theme</option>
        </select>
      </div>
      <textarea ref={editorElement} className="hidden"></textarea>
      <button
        onClick={runCode}
        className="mt-4 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded transition"
      >
        Run Test Cases
      </button>
      <div className="mt-4 bg-gray-900 p-4 rounded border border-gray-700">
        <h3 className="text-teal-300 text-lg">Test Results:</h3>
        {testResults.map((result, index) => (
          <div key={index} className={`text-sm ${result.passed ? "text-green-400" : "text-red-400"}`}>
            {result.passed ? "✅" : "❌"} Input: {JSON.stringify(result.input)} | Expected: {result.expected} | Output: {result.output}
          </div>
        ))}
      </div>
      <div className="mt-4 bg-gray-900 p-4 rounded border border-gray-700">
        <h3 className="text-teal-300 text-lg">Console Output:</h3>
        {consoleOutput.map((line, index) => (
          <div key={index} className="text-sm text-green-400">{line.data}</div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded transition"
      >
        Submit
      </button>
    </div>
  );
};

export default JSCompiler;
