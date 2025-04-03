import React, { useState } from "react";
import { useParams } from "react-router-dom";
import JSCompiler from "./JSCompiler";

const codingQuestions = [
  {
    id: "javascript-1",
    topic: "javascript",
    question: "Write a function to reverse a string.",
    description: "Implement a function that takes a string as input and returns the reversed version.",
    difficulty: "Easy",
    testCases: [
      { input: "hello", expectedOutput: "olleh" },
      { input: "world", expectedOutput: "dlrow" },
    ],
    hiddenTestCases: [{ input: "OpenAI", expectedOutput: "IAnepO" }],
    starterCode: `function reverseString(str) {\n  // Your code here\n}\n\nconsole.log(reverseString("hello")); // Expected output: "olleh"`,
  },
  {
    id: "javascript-2",
    topic: "javascript",
    question: "Write a function to check if a string is a palindrome.",
    description: "A palindrome is a word that reads the same backward as forward.",
    difficulty: "Medium",
    testCases: [
      { input: "racecar", expectedOutput: "true" },
      { input: "hello", expectedOutput: "false" },
    ],
    hiddenTestCases: [{ input: "madam", expectedOutput: "true" }],
    starterCode: `function isPalindrome(str) {\n  // Your code here\n}\n\nconsole.log(isPalindrome("racecar")); // Expected output: true`,
  },
  {
    id: "typescript-1",
    topic: "typescript",
    question: "Create an interface for a User object.",
    description: "Define a TypeScript interface with properties: id, name, email.",
    difficulty: "Easy",
    testCases: [],
    hiddenTestCases: [],
    starterCode: `interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nconst user: User = { id: 1, name: "John", email: "john@example.com" };`,
  },
];

const CodingQuestionPage = () => {
  const { topic } = useParams();
  const filteredQuestions = codingQuestions.filter((q) => q.topic === topic);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (filteredQuestions.length === 0) {
    return <p className="text-center text-red-500">No questions found for this topic.</p>;
  }

  const questionData = filteredQuestions[currentIndex];

  const handleNextQuestion = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      alert("No more questions available.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white p-6">
      {/* Left Side - Question Details */}
      <div className="w-1/2 p-6 border-r border-gray-700">
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              questionData.difficulty === "Easy" ? "bg-green-500" :
              questionData.difficulty === "Medium" ? "bg-yellow-500" : "bg-red-500"
            }`}
          ></span>
          <h2 className="text-4xl font-semibold text-teal-400">{questionData.question}</h2>
        </div>
        <p className="mt-4 text-lg text-gray-300">{questionData.description}</p>
        <div className="mt-6">
          <h2 className="text-xl text-teal-300">Test Cases:</h2>
          <ul className="mt-2 space-y-2">
            {questionData.testCases.map((test, index) => (
              <li key={index} className="bg-gray-800 p-2 rounded text-gray-400">
                <strong>Input:</strong> {test.input} → <strong>Output:</strong> {test.expectedOutput}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={handleNextQuestion}
          className="mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded"
        >
          Next Question →
        </button>
      </div>

      {/* Right Side - Code Editor */}
      <div className="w-1/2 p-6">
        <JSCompiler
          starterCode={questionData.starterCode}
          testCases={questionData.testCases}
          nextQuestion={handleNextQuestion}
        />
      </div>
    </div>
  );
};

export default CodingQuestionPage;
