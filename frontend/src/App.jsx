import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import UnauthorizedAccess from './components/UnauthorizedAccess';
import { Toaster, toast } from 'react-hot-toast';
import { checkAuth } from './utils/auth';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
          <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-light-error dark:text-dark-error mb-4">Something went wrong</h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">Please try refreshing the page</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-light-primary dark:border-dark-primary"></div>
  </div>
);

// Lazy load components
const HomePage = lazy(() => import('./pages/HomePage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const CodingQuestionPage = lazy(() => import('./pages/CodingQuestionPage'));
const ResultPage = lazy(() => {
  console.log('App - Attempting to load ResultPage');
  return import('./pages/ResultPage')
    .then(module => {
      console.log('App - ResultPage loaded successfully');
      return module;
    })
    .catch(error => {
      console.error('App - Error loading ResultPage:', error);
      return {
        default: () => (
          <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-8 rounded-lg text-center">
              <h2 className="text-xl font-semibold text-light-error dark:text-dark-error mb-4">Error Loading Results</h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">Unable to load the results page. Please try again.</p>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        )
      };
    });
});
const MockInterviews = lazy(() => import('./pages/MockInterviews'));
const JobListings = lazy(() => import('./components/JobListings'));
const AdminJobManager = lazy(() => import('./pages/AdminJobManager'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const DailyJavaScriptChallenge = lazy(() => import('./pages/DailyJavaScriptChallenge'));
const ConceptBasedMCQs = lazy(() => import('./pages/ConceptBasedMCQs'));
const CodingQuestions = lazy(() => import('./pages/CodingQuestions'));
const JavaScriptConceptsVisual = lazy(() => import('./pages/JavaScriptConceptsVisual'));
const EventLoop = lazy(() => import('./pages/concepts/EventLoop'));
const Blogs = lazy(() => import('./pages/Blogs'));

const NavigationGuard = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const previousLocation = useRef(location);

  useEffect(() => {
    // Check if we're trying to go back to quiz from result
    if (previousLocation.current?.pathname?.includes('/result') && 
        location.pathname.includes('/quiz') &&
        !location.state?.isRetry) {  // Only block if it's not a retry attempt
      toast.error("Cannot go back to quiz from result page. Please start a new quiz.");
      navigate('/');
      return;
    }
    previousLocation.current = location;
  }, [location, navigate]);

  return children;
};

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Initial check
    setIsAuthenticated(checkAuth());

    // Listen for storage changes
    const handleStorageChange = () => {
      const newAuthState = checkAuth();
      setIsAuthenticated(newAuthState);
      if (!newAuthState) {
        navigate('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  // Listen for token changes
  useEffect(() => {
    const handleTokenChange = () => {
      const newAuthState = checkAuth();
      setIsAuthenticated(newAuthState);
      if (!newAuthState) {
        navigate('/login');
      }
    };

    window.addEventListener('tokenChange', handleTokenChange);
    return () => window.removeEventListener('tokenChange', handleTokenChange);
  }, [navigate]);

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
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <Navbar isAuthenticated={isAuthenticated} />
        <UnauthorizedAccess />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Navbar isAuthenticated={isAuthenticated} />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
        }}
      />
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <NavigationGuard>
            <Suspense fallback={<LoadingSpinner />}>
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
                  path="/quiz/:tag/mixed"
                  element={<QuizPage />}
                />
                <Route
                  path="/result/:attemptId"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingSpinner />}>
                          <ResultPage />
                        </Suspense>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/result/tag/:tag"
                  element={
                    <ErrorBoundary>
                      <Suspense fallback={<LoadingSpinner />}>
                        <ResultPage />
                      </Suspense>
                    </ErrorBoundary>
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
                <Route path="/daily-javascript-challenge" element={<DailyJavaScriptChallenge />} />
                <Route path="/concept-based-mcqs" element={<ConceptBasedMCQs />} />
                <Route path="/coding-questions" element={<CodingQuestions />} />
                <Route path="/javascript-concepts-visual" element={<JavaScriptConceptsVisual />} />
                <Route path="/concepts/event-loop" element={<EventLoop />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/admin-job-manager" element={<AdminJobManager />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </NavigationGuard>
        </AnimatePresence>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
        }}
      />
      <AppContent />
    </Router>
  );
};

export default App;