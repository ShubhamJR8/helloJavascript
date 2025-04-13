import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import CodingQuestionPage from './pages/CodingQuestionPage';
import ResultPage from './pages/ResultPage';
import MockInterviews from './pages/MockInterviews';
import JobListings from './components/JobListings';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AnalyticsPage from './pages/AnalyticsPage';
import UserProfile from './pages/UserProfile';
import { checkAuth } from './utils/auth';
import UnauthorizedAccess from './components/UnauthorizedAccess';

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsAuthenticated(checkAuth());
  }, []);

  useEffect(() => {
    const handleUnauthorized = (event) => {
      setShowUnauthorized(true);
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  // Reset unauthorized state when location changes
  useEffect(() => {
    setShowUnauthorized(false);
  }, [location]);

  if (showUnauthorized) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar isAuthenticated={isAuthenticated} />
        <UnauthorizedAccess />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <LoginPage setIsAuthenticated={setIsAuthenticated} />
                )
              }
            />
            <Route
              path="/register"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <RegisterPage setIsAuthenticated={setIsAuthenticated} />
                )
              }
            />
            <Route
              path="/quiz/:topic/:difficulty"
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/result/:attemptId"
              element={
                <ProtectedRoute>
                  <ResultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route path="/coding-question/:topic" element={<CodingQuestionPage />} />
            <Route path="/mock-interviews" element={<MockInterviews />} />
            <Route path="/job-listings" element={<JobListings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;