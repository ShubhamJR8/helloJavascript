import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserDetails, setUser, getUser, logout as authLogout } from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await fetchUserDetails();
        if (userData) {
          setUserState(userData);
          setUser(userData); // Store in localStorage
        } else {
          setUserState(null);
          localStorage.removeItem('user');
        }
      } else {
        setUserState(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUserState(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for token changes
    const handleTokenChange = () => {
      loadUser();
    };

    window.addEventListener('tokenChange', handleTokenChange);
    return () => window.removeEventListener('tokenChange', handleTokenChange);
  }, []);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    setUserState(userData.user);
    setUser(userData.user); // Store in localStorage
    window.dispatchEvent(new Event('tokenChange'));
  };

  const logout = () => {
    authLogout(); // This will remove both token and user from localStorage
    setUserState(null);
    window.dispatchEvent(new Event('tokenChange'));
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