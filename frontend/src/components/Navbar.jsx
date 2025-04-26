import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getUser, logout, checkAuth, fetchUserDetails } from '../utils/auth';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out
        ${isActive 
          ? 'text-white bg-gray-800/50 backdrop-blur-sm' 
          : 'text-gray-300 hover:text-white hover:bg-gray-800/30'
        }
        before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:w-0 before:h-0.5
        before:bg-gradient-to-r before:from-teal-400 before:to-blue-500 before:transform before:-translate-x-1/2
        before:transition-all before:duration-300 hover:before:w-3/4 ${isActive ? 'before:w-3/4' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check authentication status on mount and when location changes
    setIsAuthenticated(checkAuth());
    
    // Fetch user details if authenticated
    const loadUserDetails = async () => {
      if (checkAuth()) {
        const userData = await fetchUserDetails();
        setUser(userData);
      }
    };
    
    loadUserDetails();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [useLocation()]); // Re-run effect when location changes

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/80 backdrop-blur-md shadow-lg' 
        : 'bg-gradient-to-r from-gray-900 to-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 group"
              aria-label="Home"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 text-transparent bg-clip-text group-hover:from-teal-300 group-hover:to-blue-400 transition-all duration-300">
                CodeQuiz
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <NavLink to="/">Home</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/analytics">Analytics</NavLink>
                <NavLink to="/mock-interviews">Mock Interviews</NavLink>
                <NavLink to="/job-listings">Jobs</NavLink>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none rounded-lg px-3 py-2 transition-all duration-300 hover:bg-gray-800/50"
                  aria-expanded={showDropdown}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center text-white font-medium">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {/* <span className="text-sm font-medium">{user?.name}</span> */}
                  <svg className={`h-5 w-5 transition-transform duration-300 ${showDropdown ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-2 bg-gray-800/90 backdrop-blur-md ring-1 ring-gray-700/50 focus:outline-none transform transition-all duration-300 origin-top-right">
                    <div className="px-4 py-2 border-b border-gray-700/50">
                      <p className="text-sm text-gray-300">{user?.name}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                      onClick={() => setShowDropdown(false)}
                    >
                      Your Profile
                    </Link>
                    {/* <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors duration-200"
                      onClick={() => setShowDropdown(false)}
                    >
                      Settings
                    </Link> */}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-800/50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 focus:outline-none transition-all duration-300"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-gray-900/95 backdrop-blur-md`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/analytics"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                Analytics
              </Link>
              <Link
                to="/mock-interviews"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                Mock Interviews
              </Link>
              <Link
                to="/job-listings"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                Jobs
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-300"
              >
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <div className="px-3 py-2 space-y-2">
              <Link
                to="/login"
                className="block w-full px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block w-full px-3 py-2 rounded-lg text-base font-medium text-white bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 