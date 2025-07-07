import React, { useState, useEffect } from 'react';
import { FaChartBar, FaBriefcase, FaMapMarkerAlt, FaClock, FaUsers } from 'react-icons/fa';
import { jobApi } from '../services/jobApi';

const JobAnalytics = ({ showDetails = true }) => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await jobApi.getJobAnalytics();
      setAnalytics(data);
    } catch (error) {
      setError('Failed to load analytics');
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600 text-center">
          {error}
          <button 
            onClick={loadAnalytics}
            className="ml-2 text-blue-600 hover:text-blue-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <FaChartBar className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Job Analytics</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <FaBriefcase className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Jobs</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{analytics.totalJobs}</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <FaUsers className="text-green-600" />
            <span className="text-sm font-medium text-green-800">Active Jobs</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{analytics.activeJobs}</div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <FaClock className="text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Draft Jobs</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{analytics.draftJobs}</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <FaMapMarkerAlt className="text-red-600" />
            <span className="text-sm font-medium text-red-800">Closed Jobs</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{analytics.closedJobs}</div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-800">{analytics.recentJobs}</div>
          <div className="text-sm text-gray-600">Jobs posted in the last 30 days</div>
        </div>
      </div>

      {/* Detailed Analytics */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jobs by Type */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Jobs by Type</h3>
            <div className="space-y-2">
              {analytics.jobsByType?.map(item => (
                <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item._id}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(item.count / analytics.totalJobs) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="font-semibold text-blue-600">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Jobs by Experience */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Jobs by Experience Level</h3>
            <div className="space-y-2">
              {analytics.jobsByExperience?.map(item => (
                <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item._id}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(item.count / analytics.totalJobs) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="font-semibold text-green-600">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Locations */}
          {analytics.jobsByLocation && analytics.jobsByLocation.length > 0 && (
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-3">Top Job Locations</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {analytics.jobsByLocation.slice(0, 10).map(item => (
                  <div key={item._id} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-800">{item.count}</div>
                    <div className="text-sm text-gray-600 truncate" title={item._id}>
                      {item._id}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Active Rate</div>
            <div className="text-lg font-semibold text-green-600">
              {analytics.totalJobs > 0 ? Math.round((analytics.activeJobs / analytics.totalJobs) * 100) : 0}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Draft Rate</div>
            <div className="text-lg font-semibold text-yellow-600">
              {analytics.totalJobs > 0 ? Math.round((analytics.draftJobs / analytics.totalJobs) * 100) : 0}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Closed Rate</div>
            <div className="text-lg font-semibold text-red-600">
              {analytics.totalJobs > 0 ? Math.round((analytics.closedJobs / analytics.totalJobs) * 100) : 0}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Recent Rate</div>
            <div className="text-lg font-semibold text-blue-600">
              {analytics.totalJobs > 0 ? Math.round((analytics.recentJobs / analytics.totalJobs) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAnalytics; 