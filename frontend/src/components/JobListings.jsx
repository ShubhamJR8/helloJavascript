import React, { useState, useEffect, useMemo, useCallback } from 'react';
import JobCard from './JobCard';
import JobFilters from './JobFilters';
import { FaSpinner, FaExclamationCircle, FaRedo } from 'react-icons/fa';
import { motion } from "framer-motion";
import { FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave, FaClock } from "react-icons/fa";
import { fetchJobs } from "../apis/jobApi";

const JobListings = () => {
  const [filters, setFilters] = useState({
    search: '',
    location: 'All Locations',
    experience: 'All Experience Levels',
    jobType: 'All Types'
  });

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0
  });

  // Search validation and optimization
  const isValidSearch = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.trim().length === 0) return true; // Empty search is valid
    return searchTerm.trim().length >= 3; // Minimum 3 characters
  }, []);

  const shouldPerformSearch = useCallback((searchTerm) => {
    // Don't search if less than 3 characters (unless empty)
    if (searchTerm && searchTerm.trim().length > 0 && searchTerm.trim().length < 3) {
      return false;
    }
    return true;
  }, []);

  // Debounced search effect with validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (shouldPerformSearch(filters.search)) {
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on search
      }
    }, 800); // Increased delay to 800ms for better debouncing

    return () => clearTimeout(timeoutId);
  }, [filters.search, shouldPerformSearch]);

  // Fetch jobs when filters change
  useEffect(() => {
    const loadJobs = async () => {
      try {
        // Don't make API call if search is invalid
        if (!shouldPerformSearch(filters.search)) {
          return;
        }

        setIsLoading(true);
        setError(null);
        
        const response = await fetchJobs({
          ...filters,
          page: pagination.currentPage
        });

        setJobs(response.jobs);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalJobs: response.totalJobs
        });
      } catch (error) {
        console.error('Error fetching jobs:', error);
        
        if (error.response?.status === 429) {
          setError('Too many search requests. Please wait a moment before searching again.');
        } else if (error.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('Failed to fetch jobs. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [filters, pagination.currentPage, shouldPerformSearch]);

  const handleClearFilters = () => {
    setFilters({
      search: '',
      location: 'All Locations',
      experience: 'All Experience Levels',
      jobType: 'All Types'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Show search hint if user types less than 3 characters
  const showSearchHint = filters.search && filters.search.trim().length > 0 && filters.search.trim().length < 3;

  return (
    <div className="container mx-auto px-4 py-8 pt-16">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Job Listings</h1>
      
      <JobFilters 
        filters={filters} 
        setFilters={setFilters} 
        onClearFilters={handleClearFilters} 
      />

      {/* Search hint */}
      {showSearchHint && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-700 text-sm">
            💡 Type at least 3 characters to search jobs
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FaSpinner className="text-blue-500 text-4xl animate-spin mb-4" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-4" />
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors duration-300 font-medium mx-auto"
          >
            <FaRedo />
            <span>Try Again</span>
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">
            {filters.search && filters.search.trim().length >= 3
              ? `No jobs found matching "${filters.search}". Try different keywords or clear filters.`
              : 'No jobs found matching your criteria.'
            }
          </p>
          <button 
            onClick={handleClearFilters}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors duration-300 font-medium mx-auto"
          >
            <FaRedo />
            <span>Clear Filters</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>

          {/* Job count and pagination info */}
          <div className="mt-6 text-center text-gray-600">
            <p>Showing {jobs.length} of {pagination.totalJobs} jobs</p>
            {pagination.totalPages > 1 && (
              <p className="mt-2">Page {pagination.currentPage} of {pagination.totalPages}</p>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {/* Previous button */}
              {pagination.currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors"
                >
                  Previous
                </button>
              )}

              {/* Page numbers */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded transition-colors ${
                    page === pagination.currentPage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next button */}
              {pagination.currentPage < pagination.totalPages && (
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JobListings;