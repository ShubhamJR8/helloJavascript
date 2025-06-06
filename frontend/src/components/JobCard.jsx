import React, { useState } from 'react';
import { FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaClock, FaBookmark, FaShare, FaEllipsisH } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const JobCard = ({ job, onSaveJob }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveJob = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSaveJob(job.id);
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
                onClick={handleSaveJob}
                className={`p-1.5 rounded-full transition-colors duration-300 ${
                  isSaved ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'
                }`}
                aria-label={isSaved ? 'Unsave job' : 'Save job'}
              >
                <FaBookmark />
              </button>
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
              <span className="truncate">{formatDistanceToNow(new Date(job.uploadDate), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={openModal}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
              aria-label="View details"
            >
              <FaEllipsisH />
              <span>Details</span>
            </button>
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
            >
              Apply Now
            </a>
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
                <span>{formatDistanceToNow(new Date(job.uploadDate), { addSuffix: true })}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Job Description</h4>
              <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
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
              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300"
              >
                Apply Now
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobCard; 