import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center justify-center w-11 h-11 rounded-full
        transition-all duration-300 ease-in-out
        bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600
        border border-gray-700 dark:border-gray-600
        text-gray-300 dark:text-gray-200
        focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-gray-900
        shadow-md
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{padding: 0}}
    >
      <span className="flex items-center justify-center w-6 h-6">
        {/* Sun icon */}
        <svg 
          className={`absolute w-6 h-6 transition-all duration-300 ${isDark ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        {/* Moon icon */}
        <svg 
          className={`absolute w-6 h-6 transition-all duration-300 ${isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </span>
    </button>
  );
};

export default ThemeToggle; 