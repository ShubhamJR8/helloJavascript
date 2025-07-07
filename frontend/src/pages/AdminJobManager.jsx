import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaCopy, 
  FaChartBar, 
  FaFilter, 
  FaDownload,
  FaCheck,
  FaTimes,
  FaSearch,
  FaCalendarAlt,
  FaLink
} from 'react-icons/fa';
import { jobApi } from '../services/jobApi';
import JobPreview from '../components/JobPreview';
import JobScraper from '../components/JobScraper';

const AdminJobManager = () => {
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showScraper, setShowScraper] = useState(false);
  const [previewJob, setPreviewJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [formKey, setFormKey] = useState(0); // Add a key to force form re-render
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showLearningStats, setShowLearningStats] = useState(false);
  const [learningData, setLearningData] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    experience: '',
    jobType: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    experience: 'Entry',
    salary: '',
    jobType: 'Full-time',
    description: '',
    skills: '',
    applyLink: '',
    status: 'active'
  });

  useEffect(() => {
    loadJobs();
    loadAnalytics();
  }, [currentPage, filters]);

  const loadLearningData = async () => {
    try {
      const data = await jobApi.getAllLearningData();
      setLearningData(data.data);
    } catch (error) {
      console.error('Error loading learning data:', error);
    }
  };

  // Debug formData changes
  useEffect(() => {
    console.log('FormData changed:', formData);
  }, [formData]);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const response = await jobApi.searchJobsAdmin({
        ...filters,
        page: currentPage,
        limit: 20
      });
      setJobs(response.jobs || []);
      setTotalPages(response.totalPages || 1);
      setTotalJobs(response.totalJobs || 0);
    } catch (error) {
      showMessage('error', 'Error loading jobs: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await jobApi.getJobAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jobData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };

      if (editingJob) {
        await jobApi.updateJob(editingJob._id, jobData);
        showMessage('success', 'Job updated successfully!');
      } else {
        await jobApi.createJob(jobData);
        showMessage('success', 'Job created successfully!');
      }

      resetForm();
      loadJobs();
      loadAnalytics();
    } catch (error) {
      showMessage('error', 'Error saving job: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      experience: 'Entry',
      salary: '',
      jobType: 'Full-time',
      description: '',
      skills: '',
      applyLink: '',
      status: 'active'
    });
    setEditingJob(null);
    setShowForm(false);
  };

  const handleJobDataExtracted = (scrapedJobData) => {
    console.log('Job data extracted:', scrapedJobData);
    console.log('Setting form data...');
    
    // Set form data and force re-render
    setFormData(scrapedJobData);
    setFormKey(prev => prev + 1); // Force form re-render
    setShowScraper(false);
    setShowForm(true);
    showMessage('success', 'Job data extracted successfully! Please review and edit before saving.');
    console.log('Form data set, closing scraper and showing form...');
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      ...job,
      skills: job.skills.join(', ')
    });
    setShowForm(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobApi.deleteJob(jobId);
        showMessage('success', 'Job deleted successfully!');
        loadJobs();
        loadAnalytics();
      } catch (error) {
        showMessage('error', 'Error deleting job: ' + error.message);
      }
    }
  };

  const handleDuplicate = async (jobId) => {
    try {
      await jobApi.duplicateJob(jobId);
      showMessage('success', 'Job duplicated successfully!');
      loadJobs();
      loadAnalytics();
    } catch (error) {
      showMessage('error', 'Error duplicating job: ' + error.message);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await jobApi.updateJobStatus(jobId, newStatus);
      showMessage('success', 'Job status updated successfully!');
      loadJobs();
      loadAnalytics();
    } catch (error) {
      showMessage('error', 'Error updating job status: ' + error.message);
    }
  };

  const handleBulkAction = async (action, status = null) => {
    if (selectedJobs.length === 0) {
      showMessage('error', 'Please select jobs first');
      return;
    }

    const confirmMessage = action === 'delete' 
      ? `Are you sure you want to delete ${selectedJobs.length} jobs?`
      : `Are you sure you want to update ${selectedJobs.length} jobs to ${status}?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      if (action === 'delete') {
        await jobApi.bulkDeleteJobs(selectedJobs);
        showMessage('success', `${selectedJobs.length} jobs deleted successfully!`);
      } else if (action === 'status') {
        await jobApi.bulkUpdateJobStatus(selectedJobs, status);
        showMessage('success', `${selectedJobs.length} jobs updated to ${status}!`);
      }
      setSelectedJobs([]);
      loadJobs();
      loadAnalytics();
    } catch (error) {
      showMessage('error', `Error performing bulk ${action}: ` + error.message);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedJobs(jobs.map(job => job._id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (jobId, checked) => {
    if (checked) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };

  const handlePreview = (job) => {
    setPreviewJob(job);
    setShowPreview(true);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      experience: '',
      jobType: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const exportJobs = () => {
    const csvContent = [
      ['Title', 'Company', 'Location', 'Experience', 'Job Type', 'Status', 'Posted Date'],
      ...jobs.map(job => [
        job.title,
        job.company,
        job.location,
        job.experience,
        job.jobType,
        job.status,
        new Date(job.uploadDate).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading && jobs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading jobs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Message Display */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Job Manager</h1>
          <p className="text-gray-600">Manage job listings and view analytics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaChartBar />
            Analytics
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaFilter />
            Filters
          </button>
          <button
            onClick={() => setShowScraper(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaLink />
            Scrape Job
          </button>
          <button
            onClick={() => {
              setShowLearningStats(!showLearningStats);
              if (!showLearningStats && !learningData) {
                loadLearningData();
              }
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaChartBar />
            Learning Stats
          </button>
          <button
            onClick={exportJobs}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaDownload />
            Export
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaPlus />
            Add Job
          </button>
        </div>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && analytics && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Job Analytics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalJobs}</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.activeJobs}</div>
              <div className="text-sm text-gray-600">Active Jobs</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{analytics.draftJobs}</div>
              <div className="text-sm text-gray-600">Draft Jobs</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{analytics.closedJobs}</div>
              <div className="text-sm text-gray-600">Closed Jobs</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Jobs by Type</h3>
              {analytics.jobsByType?.map(item => (
                <div key={item._id} className="flex justify-between py-1">
                  <span>{item._id}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold mb-2">Jobs by Experience</h3>
              {analytics.jobsByExperience?.map(item => (
                <div key={item._id} className="flex justify-between py-1">
                  <span>{item._id}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Learning Stats Panel */}
      {showLearningStats && learningData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Scraper Learning Statistics</h2>
          <div className="mb-4">
            <p className="text-gray-600 mb-2">
              The scraper learns from each extraction attempt to improve future results. 
              New job sites start with low confidence but improve over time.
            </p>
            <div className="text-sm text-gray-500">
              Last updated: {new Date(learningData.lastUpdated).toLocaleString()}
            </div>
          </div>
          
          {Object.keys(learningData.sites).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No learning data available yet. Start scraping jobs to build the learning database.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(learningData.sites).map(([domain, siteData]) => {
                const confidence = siteData.attempts >= 10 && siteData.successRate > 0.8 ? 'high' :
                                 siteData.attempts >= 5 && siteData.successRate > 0.6 ? 'medium' : 'low';
                
                const confidenceColor = confidence === 'high' ? 'text-green-600' :
                                       confidence === 'medium' ? 'text-yellow-600' : 'text-orange-600';
                
                return (
                  <div key={domain} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{domain}</h3>
                      <span className={`text-sm font-medium ${confidenceColor}`}>
                        {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Attempts:</span>
                        <span className="font-semibold ml-1">{siteData.attempts}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="font-semibold ml-1">{(siteData.successRate * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">First Seen:</span>
                        <span className="font-semibold ml-1">{new Date(siteData.firstSeen).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Seen:</span>
                        <span className="font-semibold ml-1">{new Date(siteData.lastSeen).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Advanced Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search jobs..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedJobs.length} job(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('status', 'active')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('status', 'draft')}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                Set Draft
              </button>
              <button
                onClick={() => handleBulkAction('status', 'closed')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Close
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-800 text-white rounded text-sm hover:bg-red-900"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {console.log('Rendering form with data:', formData)}
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            {editingJob ? 'Edit Job' : 'Add New Job'}
          </h2>
          <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="Enter job title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level *
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="Entry">Entry</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                  <option value="2-5 years">2-5 years</option>
                  <option value="5+ years">5+ years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                  placeholder="e.g., $80,000 - $100,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional. The scraper will attempt to extract salary information if available.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type *
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobType: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apply Link
              </label>
              <input
                type="url"
                name="applyLink"
                value={formData.applyLink}
                onChange={(e) => setFormData(prev => ({ ...prev, applyLink: e.target.value }))}
                placeholder="https://example.com/apply"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional. The scraper will use the original job URL if no specific apply link is found.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="JavaScript, React, Node.js, Python, AWS"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter skills separated by commas. The scraper will automatically detect and populate this field.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                placeholder="Enter detailed job description..."
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  The scraper will automatically populate this field with the job description.
                </p>
                <span className="text-xs text-gray-500">
                  {formData.description.length} characters
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingJob ? 'Update Job' : 'Add Job'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Job Preview Modal */}
      {showPreview && previewJob && (
        <JobPreview 
          job={previewJob} 
          onClose={() => setShowPreview(false)}
          showModal={true}
        />
      )}

      {/* Job Scraper Modal */}
      {showScraper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <JobScraper 
              onJobDataExtracted={handleJobDataExtracted}
              onClose={() => setShowScraper(false)}
            />
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Jobs ({totalJobs})
            </h3>
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedJobs.length === jobs.length && jobs.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job._id)}
                      onChange={(e) => handleSelectJob(job._id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2" title={job.title}>
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate" title={job.experience}>
                        {job.experience}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-32 truncate" title={job.company}>
                      {job.company}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-32 truncate" title={job.location}>
                      {job.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.jobType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job._id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${
                        job.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : job.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <option value="active">active</option>
                      <option value="draft">draft</option>
                      <option value="closed">closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePreview(job)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Preview"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(job)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDuplicate(job._id)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Duplicate"
                      >
                        <FaCopy />
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalJobs)} of {totalJobs} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobManager; 