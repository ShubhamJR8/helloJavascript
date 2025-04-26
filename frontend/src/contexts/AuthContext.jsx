import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserDetails } from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user details
      const loadUserDetails = async () => {
        const userData = await fetchUserDetails();
        setUser(userData);
        setLoading(false);
      };
      loadUserDetails();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    setUser(userData.user);
    // Dispatch tokenChange event
    window.dispatchEvent(new Event('tokenChange'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Clear any other auth-related data
    localStorage.removeItem('user');
    // Dispatch tokenChange event
    window.dispatchEvent(new Event('tokenChange'));
    // Force a re-render of the app
    window.location.reload();
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 