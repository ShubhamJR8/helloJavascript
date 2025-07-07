import React, { useState, useEffect } from 'react';
import { FaLink, FaSpinner, FaCheck, FaTimes, FaInfoCircle, FaExternalLinkAlt, FaStar, FaEdit, FaEye } from 'react-icons/fa';
import { jobApi } from '../services/jobApi';

const JobScraper = ({ onJobDataExtracted, onClose }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [scrapingResult, setScrapingResult] = useState(null);
  const [supportedSites, setSupportedSites] = useState([]);
  const [error, setError] = useState('');
  const [showSupportedSites, setShowSupportedSites] = useState(false);
  const [extractionQuality, setExtractionQuality] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [learningStats, setLearningStats] = useState(null);

  useEffect(() => {
    loadSupportedSites();
  }, []);

  const loadSupportedSites = async () => {
    try {
      const response = await jobApi.getSupportedSites();
      setSupportedSites(response.supportedSites || []);
    } catch (error) {
      console.error('Error loading supported sites:', error);
    }
  };

  const validateUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsValidating(true);
    setError('');
    setValidationResult(null);

    try {
      const result = await jobApi.validateScrapingUrl(url);
      setValidationResult(result);
      
      if (!result.siteInfo.supported) {
        setError(`This site (${result.siteInfo.name}) is not currently supported for job scraping.`);
      }
    } catch (error) {
      setError('Error validating URL: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsValidating(false);
    }
  };

  const scrapeJob = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setScrapingResult(null);
    setExtractionQuality(0);

    try {
      const result = await jobApi.scrapeJobFromUrl(url);
      
      if (result.success) {
        setScrapingResult(result);
        setExtractionQuality(result.extractionQuality || 0);
        setLearningStats(result.learningStats || null);
        
        // Auto-fill the form with scraped data
        if (onJobDataExtracted && result.data) {
          const jobData = {
            title: result.data.title || '',
            company: result.data.company || '',
            location: result.data.location || '',
            experience: result.data.experience || 'Entry',
            salary: result.data.salary || '',
            jobType: result.data.jobType || 'Full-time',
            description: result.data.description || '',
            skills: result.data.skills ? result.data.skills.join(', ') : '',
            applyLink: result.data.applyLink || url,
            status: 'draft' // Set as draft by default
          };
          
          console.log('Sending enhanced job data to form:', jobData);
          onJobDataExtracted(jobData);
        }
      } else {
        setError('Failed to scrape job data: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      setError('Error scraping job: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setError('');
    setValidationResult(null);
    setScrapingResult(null);
    setExtractionQuality(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    scrapeJob();
  };

  const resetForm = () => {
    setUrl('');
    setError('');
    setValidationResult(null);
    setScrapingResult(null);
    setExtractionQuality(0);
    setShowPreview(false);
    setLearningStats(null);
  };

  const getQualityColor = (quality) => {
    if (quality >= 80) return 'text-green-600';
    if (quality >= 60) return 'text-yellow-600';
    if (quality >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getQualityText = (quality) => {
    if (quality >= 80) return 'Excellent';
    if (quality >= 60) return 'Good';
    if (quality >= 40) return 'Fair';
    return 'Poor';
  };

  const renderQualityIndicator = () => {
    if (extractionQuality === 0) return null;
    
    return (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-gray-700">Extraction Quality:</span>
        <div className="flex items-center gap-1">
          <FaStar className={`${getQualityColor(extractionQuality)}`} size={16} />
          <span className={`text-sm font-semibold ${getQualityColor(extractionQuality)}`}>
            {getQualityText(extractionQuality)} ({extractionQuality}%)
          </span>
        </div>
      </div>
    );
  };

  const renderLearningInfo = () => {
    if (!learningStats) return null;

    const getConfidenceColor = (confidence) => {
      switch (confidence) {
        case 'high': return 'text-green-600';
        case 'medium': return 'text-yellow-600';
        case 'low': return 'text-orange-600';
        default: return 'text-gray-600';
      }
    };

    const getConfidenceIcon = (confidence) => {
      switch (confidence) {
        case 'high': return '🎯';
        case 'medium': return '📈';
        case 'low': return '🔍';
        default: return '❓';
      }
    };

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{getConfidenceIcon(learningStats.confidence)}</span>
          <span className="font-medium text-blue-800">
            {learningStats.isNewSite ? 'New Job Site Detected' : 'Learning Progress'}
          </span>
        </div>
        
        <div className="text-sm text-blue-700 space-y-1">
          {learningStats.isNewSite ? (
            <p>This is a new job site. The system will learn from this extraction to improve future results.</p>
          ) : (
            <>
              <p>This site has been scraped <strong>{learningStats.attempts}</strong> times before.</p>
              <p>Success rate: <strong>{(learningStats.successRate * 100).toFixed(1)}%</strong></p>
              <p>Confidence: <span className={`font-semibold ${getConfidenceColor(learningStats.confidence)}`}>
                {learningStats.confidence.charAt(0).toUpperCase() + learningStats.confidence.slice(1)}
              </span></p>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderDataPreview = () => {
    if (!scrapingResult || !scrapingResult.success) return null;

    const data = scrapingResult.data;
    
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaCheck className="text-green-600" />
            <span className="font-medium text-green-800">Job data extracted successfully!</span>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            {showPreview ? <FaEye /> : <FaEdit />}
            {showPreview ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        <div className="text-sm text-gray-700 space-y-1">
          <div><strong>Title:</strong> {data.title || 'Not found'}</div>
          <div><strong>Company:</strong> {data.company || 'Not found'}</div>
          <div><strong>Location:</strong> {data.location || 'Not found'}</div>
          <div><strong>Skills Found:</strong> {data.skills?.length || 0} skills</div>
          <div><strong>Source:</strong> {scrapingResult.source}</div>
        </div>

        {showPreview && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-2">Detailed Preview:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Job Type:</strong> {data.jobType || 'Not specified'}
              </div>
              <div>
                <strong>Experience Level:</strong> {data.experience || 'Not specified'}
              </div>
              {data.salary && (
                <div>
                  <strong>Salary:</strong> {data.salary}
                </div>
              )}
              {data.skills && data.skills.length > 0 && (
                <div>
                  <strong>Skills:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.skills.slice(0, 8).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {data.skills.length > 8 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{data.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              {data.description && (
                <div>
                  <strong>Description Preview:</strong>
                  <div className="mt-1 text-gray-600 max-h-32 overflow-y-auto">
                    {data.description.length > 300 
                      ? `${data.description.substring(0, 300)}...` 
                      : data.description
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Enhanced Job Scraper</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes size={20} />
        </button>
      </div>

      <p className="text-gray-600 mb-4">
        Enter any job posting URL to automatically extract job information and fill the form. 
        Our enhanced scraper uses multiple strategies to extract the most accurate data possible.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Posting URL *
          </label>
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://www.amazon.jobs/en/jobs/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            required
          />
        </div>

        {/* Supported Sites Info */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowSupportedSites(!showSupportedSites)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            <FaInfoCircle />
            {showSupportedSites ? 'Hide' : 'Show'} Supported Sites
          </button>
          
          <button
            type="button"
            onClick={validateUrl}
            disabled={isValidating || !url.trim()}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
          >
            {isValidating ? (
              <>
                <FaSpinner className="animate-spin" size={12} />
                Validating...
              </>
            ) : (
              <>
                <FaCheck size={12} />
                Validate URL
              </>
            )}
          </button>
        </div>

        {showSupportedSites && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Supported Job Sites:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {supportedSites.map((site, index) => (
                <div key={index} className="flex items-center gap-2">
                  <FaExternalLinkAlt className="text-blue-600" size={12} />
                  <span className="font-medium">{site.name}</span>
                  <span className="text-gray-600">- {site.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Result */}
        {validationResult && (
          <div className={`border rounded-lg p-3 ${
            validationResult.siteInfo.supported 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-2">
              {validationResult.siteInfo.supported ? (
                <FaCheck className="text-green-600" />
              ) : (
                <FaTimes className="text-yellow-600" />
              )}
              <span className={`font-medium ${
                validationResult.siteInfo.supported ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {validationResult.siteInfo.supported 
                  ? `Site supported: ${validationResult.siteInfo.name}` 
                  : `Site not fully supported: ${validationResult.siteInfo.name}`
                }
              </span>
            </div>
          </div>
        )}

        {/* Quality Indicator */}
        {renderQualityIndicator()}

        {/* Learning Information */}
        {renderLearningInfo()}

        {/* Scraping Result */}
        {renderDataPreview()}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FaTimes className="text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <FaLink />
                Extract Job Data
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Enhanced Tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Enhanced Features:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Smart URL parsing:</strong> Extracts data from URL patterns and structure</li>
          <li>• <strong>Multiple extraction strategies:</strong> Uses various selectors and fallback methods</li>
          <li>• <strong>Quality scoring:</strong> Shows how well the data was extracted</li>
          <li>• <strong>Enhanced skill detection:</strong> Identifies 100+ programming skills and technologies</li>
          <li>• <strong>Company recognition:</strong> Automatically identifies companies from domain names</li>
          <li>• <strong>Location mapping:</strong> Converts location codes to readable names</li>
          <li>• <strong>Experience level detection:</strong> Determines seniority from job title and description</li>
        </ul>
      </div>
    </div>
  );
};

export default JobScraper; 