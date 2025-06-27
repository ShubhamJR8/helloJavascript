import { Link } from 'react-router-dom';

const UnauthorizedAccess = () => {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-light-primary dark:text-dark-primary mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">Authentication Required</h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
          Please sign in to access this feature. If you don't have an account, you can create one for free.
        </p>
        <div className="space-y-4">
          <Link
            to="/login"
            className="block w-full px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded-lg hover:bg-light-primary-hover dark:hover:bg-dark-primary-hover transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="block w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text dark:text-dark-text rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedAccess; 