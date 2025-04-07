import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import CodingQuestionPage from './pages/CodingQuestionPage';
import ResultPage from './pages/ResultPage';
import MockInterviews from './pages/MockInterviews';

const App = () => {
  return (
    <Router future={{ v7_startTransition: true }}>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/quizAttempt/:topic/:difficulty" element={<QuizPage />} />
        <Route path="/coding-question/:topic" element={<CodingQuestionPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/mock-interviews" element={<MockInterviews />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;