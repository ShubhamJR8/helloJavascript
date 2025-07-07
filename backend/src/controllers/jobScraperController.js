import jobScraperService from '../services/jobScraperService.js';

// Scrape job from URL
export const scrapeJobFromUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ 
        message: 'URL is required',
        error: 'MISSING_URL'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ 
        message: 'Invalid URL format',
        error: 'INVALID_URL'
      });
    }

    // Allow any job site URL - the scraper service will handle site detection
    const domain = new URL(url).hostname.toLowerCase();

    // Scrape the job
    const result = await jobScraperService.scrapeJob(url);

    if (!result.success) {
      return res.status(500).json({
        message: 'Failed to scrape job data',
        error: 'SCRAPING_FAILED',
        details: result.error
      });
    }

    res.json({
      success: true,
      message: 'Job data scraped successfully',
      data: result.data,
      source: result.source,
      url: url,
      extractionQuality: result.extractionQuality || 0,
      learningStats: result.learningStats || null
    });

  } catch (error) {
    console.error('Job scraping controller error:', error);
    res.status(500).json({ 
      message: 'Error scraping job data',
      error: error.message 
    });
  }
};

// Test scraping functionality
export const testJobScraping = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ 
        message: 'URL parameter is required',
        error: 'MISSING_URL'
      });
    }

    const result = await jobScraperService.testScraping(url);

    res.json(result);

  } catch (error) {
    console.error('Test scraping error:', error);
    res.status(500).json({ 
      message: 'Error testing job scraping',
      error: error.message 
    });
  }
};

// Get learning statistics
export const getLearningStats = async (req, res) => {
  try {
    const { domain } = req.query;

    if (!domain) {
      return res.status(400).json({ 
        message: 'Domain parameter is required',
        error: 'MISSING_DOMAIN'
      });
    }

    const stats = jobScraperService.getLearningStats(domain);

    res.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Get learning stats error:', error);
    res.status(500).json({ 
      message: 'Error getting learning statistics',
      error: error.message 
    });
  }
};

// Get all learning data (admin only)
export const getAllLearningData = async (req, res) => {
  try {
    const learningData = jobScraperService.learningData;

    res.json({
      success: true,
      data: learningData
    });

  } catch (error) {
    console.error('Get all learning data error:', error);
    res.status(500).json({ 
      message: 'Error getting learning data',
      error: error.message 
    });
  }
};

// Get supported job sites
export const getSupportedSites = async (req, res) => {
  try {
    const supportedSites = [
      {
        name: 'LinkedIn',
        domain: 'linkedin.com',
        description: 'Professional networking and job platform',
        features: ['Job titles', 'Company names', 'Locations', 'Descriptions', 'Skills extraction']
      },
      {
        name: 'Indeed',
        domain: 'indeed.com',
        description: 'World\'s largest job site',
        features: ['Job titles', 'Company names', 'Locations', 'Descriptions', 'Salary information', 'Skills extraction']
      },
      {
        name: 'Glassdoor',
        domain: 'glassdoor.com',
        description: 'Job and company review platform',
        features: ['Job titles', 'Company names', 'Locations', 'Descriptions', 'Salary estimates', 'Skills extraction']
      },
      {
        name: 'Amazon Jobs',
        domain: 'amazon.jobs',
        description: 'Amazon\'s official job platform',
        features: ['Job titles', 'Company names', 'Locations', 'Descriptions', 'Skills extraction']
      },
      {
        name: 'Monster',
        domain: 'monster.com',
        description: 'Global job search platform',
        features: ['Job titles', 'Company names', 'Locations', 'Descriptions', 'Skills extraction']
      },
      {
        name: 'ZipRecruiter',
        domain: 'ziprecruiter.com',
        description: 'AI-powered job matching platform',
        features: ['Job titles', 'Company names', 'Locations', 'Descriptions', 'Skills extraction']
      },
      {
        name: 'Dice',
        domain: 'dice.com',
        description: 'Technology job board',
        features: ['Job titles', 'Company names', 'Locations', 'Descriptions', 'Skills extraction']
      },
      {
        name: 'Stack Overflow',
        domain: 'stackoverflow.com',
        description: 'Developer job platform',
        features: ['Job titles', 'Company names', 'Locations', 'Descriptions', 'Technology tags', 'Skills extraction']
      },
      {
        name: 'GitHub',
        domain: 'github.com',
        description: 'Developer job board',
        features: ['Job titles', 'Company names', 'Locations', 'Descriptions', 'Technology tags', 'Skills extraction']
      },
      {
        name: 'Flipkart Careers',
        domain: 'flipkartcareers.com',
        description: 'Flipkart\'s official career portal',
        features: ['Job titles', 'Company names', 'Locations', 'Descriptions', 'Skills extraction', 'URL-based extraction']
      },
      {
        name: 'Other Job Sites',
        domain: 'generic',
        description: 'Any other job posting website',
        features: ['Generic scraping with fallback selectors', 'Job titles', 'Company names', 'Locations', 'Descriptions', 'Skills extraction']
      }
    ];

    res.json({
      success: true,
      supportedSites,
      totalSites: supportedSites.length
    });

  } catch (error) {
    console.error('Get supported sites error:', error);
    res.status(500).json({ 
      message: 'Error getting supported sites',
      error: error.message 
    });
  }
};

// Validate URL for scraping
export const validateScrapingUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ 
        message: 'URL is required',
        error: 'MISSING_URL'
      });
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({ 
        message: 'Invalid URL format',
        error: 'INVALID_URL'
      });
    }

    // Check if URL is from a supported job site
    const supportedDomains = [
      'linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com',
      'ziprecruiter.com', 'dice.com', 'stackoverflow.com', 'github.com',
      'flipkartcareers.com'
    ];

    const domain = parsedUrl.hostname.toLowerCase();
    const isSupported = supportedDomains.some(supported => domain.includes(supported));

    const siteInfo = isSupported ? {
      name: getSiteName(domain),
      domain: domain,
      supported: true
    } : {
      name: 'Unknown',
      domain: domain,
      supported: false,
      message: 'This site is not currently supported for job scraping'
    };

    res.json({
      success: true,
      url: url,
      isValid: true,
      siteInfo,
      supportedSites: supportedDomains
    });

  } catch (error) {
    console.error('URL validation error:', error);
    res.status(500).json({ 
      message: 'Error validating URL',
      error: error.message 
    });
  }
};

// Helper function to get site name
function getSiteName(domain) {
  if (domain.includes('linkedin.com')) return 'LinkedIn';
  if (domain.includes('indeed.com')) return 'Indeed';
  if (domain.includes('glassdoor.com')) return 'Glassdoor';
  if (domain.includes('monster.com')) return 'Monster';
  if (domain.includes('ziprecruiter.com')) return 'ZipRecruiter';
  if (domain.includes('dice.com')) return 'Dice';
  if (domain.includes('stackoverflow.com')) return 'Stack Overflow';
  if (domain.includes('github.com')) return 'GitHub';
  return 'Unknown';
} 