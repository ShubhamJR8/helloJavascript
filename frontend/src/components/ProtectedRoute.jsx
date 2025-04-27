import { useLocation } from "react-router-dom";
import { checkAuth } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = checkAuth();

  if (!isAuthenticated) {
    // Store the attempted URL for redirect after login
    localStorage.setItem('redirectAfterLogin', location.pathname);
    // Dispatch unauthorized event
    window.dispatchEvent(new CustomEvent('unauthorized', {
      detail: { path: location.pathname }
    }));
    return null; // The App component will handle showing UnauthorizedAccess
  }

  return children;
};

export default ProtectedRoute; 