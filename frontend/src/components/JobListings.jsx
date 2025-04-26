import React, { useState, useEffect, useMemo } from 'react';
import JobCard from './JobCard';
import JobFilters from './JobFilters';
import { FaSpinner, FaExclamationCircle, FaRedo } from 'react-icons/fa';
import { motion } from "framer-motion";
import { FaBriefcase, FaMapMarkerAlt, FaMoneyBillWave, FaClock } from "react-icons/fa";
import { fetchJobs } from "../apis/jobApi";
import UnderDevelopment from './UnderDevelopment';

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

  // Fetch jobs when filters change
  useEffect(() => {
    const loadJobs = async () => {
      try {
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
        setError('Failed to fetch jobs. Please try again later.');
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [filters, pagination.currentPage]);

  const handleSaveJob = async (jobId) => {
    try {
      // In a real app, this would make an API call to save the job
      console.log(`Job ${jobId} saved`);
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

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

  return (
    <>
    <UnderDevelopment />
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Job Listings</h1>
      
      <JobFilters 
        filters={filters} 
        setFilters={setFilters} 
        onClearFilters={handleClearFilters} 
      />

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
          <p className="text-gray-600">No jobs found matching your criteria.</p>
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
              <JobCard key={job._id} job={job} onSaveJob={handleSaveJob} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded ${
                    page === pagination.currentPage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
};

export default JobListings; 