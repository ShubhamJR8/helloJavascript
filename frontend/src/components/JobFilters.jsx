import React from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const JobFilters = ({ filters, setFilters, onClearFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const locations = [
    "All Locations",
    "New York, NY",
    "San Francisco, CA",
    "Los Angeles, CA",
    "Chicago, IL",
    "Austin, TX",
    "Seattle, WA",
    "Boston, MA",
    "Denver, CO",
    "Remote"
  ];

  const experienceOptions = [
    "All Experience Levels",
    "Entry",
    "2-5 years",
    "5+ years",
    "10+ years"
  ];

  const jobTypes = [
    "All Types",
    "Full-time",
    "Part-time",
    "Contract",
    "Freelance",
    "Internship"
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <FaFilter className="text-blue-500 mr-2" />
        <h2 className="text-lg font-bold text-gray-800">Filters</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Search jobs..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            id="location"
            name="location"
            value={filters.location}
            onChange={handleChange}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level
          </label>
          <select
            id="experience"
            name="experience"
            value={filters.experience}
            onChange={handleChange}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            {experienceOptions.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
            Job Type
          </label>
          <select
            id="jobType"
            name="jobType"
            value={filters.jobType}
            onChange={handleChange}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          >
            {jobTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors duration-300 font-medium"
        >
          <FaTimes />
          <span>Clear Filters</span>
        </button>
      </div>
    </div>
  );
};

export default JobFilters; 