import React from 'react';
import { FaTimes, FaMapMarkerAlt, FaBriefcase, FaClock, FaDollarSign, FaExternalLinkAlt } from 'react-icons/fa';

const JobPreview = ({ job, onClose, showModal = true }) => {
  if (!job) return null;

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
            <p className="text-lg text-gray-600 mb-3">{job.company}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-gray-400" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaBriefcase className="text-gray-400" />
                <span>{job.jobType}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaClock className="text-gray-400" />
                <span>{job.experience}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaDollarSign className="text-gray-400" />
                <span>{job.salary}</span>
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <FaTimes size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {job.description}
          </p>
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Job Type:</span>
              <span className="font-medium">{job.jobType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Experience Level:</span>
              <span className="font-medium">{job.experience}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{job.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Salary:</span>
              <span className="font-medium">{job.salary}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Posted:</span>
              <span className="font-medium">
                {new Date(job.uploadDate).toLocaleDateString()}
              </span>
            </div>
            {job.status && (
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                  job.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : job.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {job.status}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Company Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Company:</span>
              <span className="font-medium">{job.company}</span>
            </div>
            {job.postedBy && (
              <div className="flex justify-between">
                <span className="text-gray-600">Posted By:</span>
                <span className="font-medium">{job.postedBy.name || job.postedBy.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Link */}
      {job.applyLink && (
        <div className="border-t border-gray-200 pt-4">
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <FaExternalLinkAlt />
            Apply for this position
          </a>
        </div>
      )}
    </div>
  );

  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {content}
    </div>
  );
};

export default JobPreview; 