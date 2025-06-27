import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

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

// Create root with error handling
const root = ReactDOM.createRoot(document.getElementById('root'));

// Wrap the app with error boundary and strict mode
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
