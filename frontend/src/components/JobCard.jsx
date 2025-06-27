import React, { useState } from 'react';
import { FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaClock, FaShare, FaEllipsisH } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';

const JobCard = ({ job }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();

  // Safe date formatting function
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Recently';
      
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      await navigator.share({
        title: job.title,
        text: `Check out this job opportunity: ${job.title} at ${job.company}`,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const openModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const applyBtnStyle = {
    backgroundColor: theme === 'dark' ? '#1e40af' : '#2563eb',
    textShadow: '0 1px 4px rgba(0,0,0,0.25)',
    color: '#fff',
    fontWeight: 'bold',
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h2 className="text-lg font-bold text-gray-800 truncate">{job.title}</h2>
              <h3 className="text-base text-blue-600 font-medium truncate">{job.company}</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 transition-colors duration-300"
                aria-label="Share job"
              >
                <FaShare />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 flex-grow">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <FaBriefcase className="text-blue-500 flex-shrink-0" />
              <span className="truncate">{job.experience}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaMapMarkerAlt className="text-blue-500 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaClock className="text-blue-500 flex-shrink-0" />
              <span className="truncate">{formatDate(job.uploadDate)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={openModal}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded transition-colors duration-300"
              aria-label="View details"
            >
              <FaEllipsisH />
              <span>Details</span>
            </button>
            <button
              onClick={() => window.open(job.applyLink, '_blank', 'noopener,noreferrer')}
              className="flex-1 flex items-center justify-center gap-2 font-bold py-2 px-4 rounded transition-colors duration-300 shadow-sm text-white"
              style={applyBtnStyle}
              aria-label="Apply Now">
              Apply Now
            </button>
          </div>
        </div>
      </div>

      {/* Modal for detailed view */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{job.title}</h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <h3 className="text-xl text-blue-600 mb-4 font-medium">{job.company}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <FaMapMarkerAlt className="text-blue-500" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FaBriefcase className="text-blue-500" />
                <span>{job.experience}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FaMoneyBillWave className="text-blue-500" />
                <span>{job.salary}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FaClock className="text-blue-500" />
                <span>{formatDate(job.uploadDate)}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Job Description</h4>
              <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.skills && job.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => window.open(job.applyLink, '_blank', 'noopener,noreferrer')}
                className="px-4 py-2 font-bold rounded-lg transition-colors duration-300 shadow-sm text-white"
                style={applyBtnStyle}
                aria-label="Apply Now">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobCard; 