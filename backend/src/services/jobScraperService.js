import axios from 'axios';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

class JobScraperService {
  constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
    ];
    
    // Learning system data
    this.learningDataPath = path.join(process.cwd(), 'data', 'scraper-learning.json');
    this.learningData = this.loadLearningData();
    
    // Enhanced skill patterns for better extraction
    this.skillPatterns = {
      programming: [
        'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Node.js', 'Next.js', 'Nuxt.js',
        'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala',
        'Dart', 'R', 'MATLAB', 'Perl', 'Shell', 'Bash', 'PowerShell', 'Assembly', 'COBOL',
        'Fortran', 'Pascal', 'Delphi', 'Objective-C', 'Clojure', 'Haskell', 'Erlang', 'Elixir',
        'F#', 'OCaml', 'Lisp', 'Prolog', 'Smalltalk', 'Ada', 'VHDL', 'Verilog'
      ],
      web: [
        'HTML', 'CSS', 'Sass', 'Less', 'Stylus', 'Bootstrap', 'Tailwind CSS', 'Material-UI',
        'Ant Design', 'Chakra UI', 'Semantic UI', 'Foundation', 'Bulma', 'Pure CSS',
        'Webpack', 'Babel', 'Vite', 'Rollup', 'Parcel', 'Gulp', 'Grunt', 'Browserify',
        'ESLint', 'Prettier', 'Stylelint', 'PostCSS', 'Autoprefixer'
      ],
      databases: [
        'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Elasticsearch', 'Cassandra',
        'DynamoDB', 'Firebase', 'Supabase', 'Neo4j', 'InfluxDB', 'CouchDB', 'RethinkDB',
        'MariaDB', 'Oracle', 'SQL Server', 'DB2', 'Sybase', 'Teradata', 'Snowflake',
        'BigQuery', 'Redshift', 'Athena', 'Hive', 'Impala', 'Presto'
      ],
      cloud: [
        'AWS', 'Azure', 'GCP', 'Firebase', 'Heroku', 'Vercel', 'Netlify', 'DigitalOcean',
        'Linode', 'Vultr', 'Cloudflare', 'Fastly', 'Akamai', 'CDN', 'Lambda', 'Serverless',
        'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Chef', 'Puppet', 'Jenkins',
        'GitHub Actions', 'GitLab CI', 'Travis CI', 'CircleCI', 'TeamCity', 'Bamboo'
      ],
      frameworks: [
        'Express.js', 'Fastify', 'Koa', 'NestJS', 'AdonisJS', 'Django', 'Flask', 'FastAPI',
        'Spring Boot', 'Spring MVC', 'Laravel', 'Symfony', 'CodeIgniter', 'ASP.NET',
        'ASP.NET Core', 'Ruby on Rails', 'Sinatra', 'Phoenix', 'Gin', 'Echo', 'Fiber',
        'Gorilla', 'Mux', 'Chi', 'JWT', 'OAuth', 'OpenID Connect', 'SAML'
      ],
      testing: [
        'Jest', 'Mocha', 'Chai', 'Sinon', 'Cypress', 'Playwright', 'Selenium', 'Puppeteer',
        'TestCafe', 'Nightwatch.js', 'Protractor', 'Karma', 'Jasmine', 'Vitest',
        'PyTest', 'Unittest', 'Robot Framework', 'JUnit', 'TestNG', 'Mockito',
        'PowerMock', 'Selenium WebDriver', 'Appium', 'Detox', 'XCUITest', 'Espresso'
      ],
      methodologies: [
        'Agile', 'Scrum', 'Kanban', 'Lean', 'DevOps', 'CI/CD', 'TDD', 'BDD', 'DDD',
        'Microservices', 'Monolith', 'Event-Driven', 'CQRS', 'Event Sourcing',
        'Domain-Driven Design', 'Clean Architecture', 'SOLID', 'DRY', 'KISS'
      ]
    };
  }

  loadLearningData() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.learningDataPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.learningDataPath)) {
        const data = fs.readFileSync(this.learningDataPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading learning data:', error);
    }
    
    return {
      sites: {},
      patterns: {},
      lastUpdated: new Date().toISOString()
    };
  }

  saveLearningData() {
    try {
      this.learningData.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.learningDataPath, JSON.stringify(this.learningData, null, 2));
    } catch (error) {
      console.error('Error saving learning data:', error);
    }
  }

  learnFromScraping(domain, url, scrapedData, successRate) {
    try {
      if (!this.learningData.sites[domain]) {
        this.learningData.sites[domain] = {
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          attempts: 0,
          successRate: 0,
          patterns: {},
          selectors: {},
          urlPatterns: []
        };
      }

      const siteData = this.learningData.sites[domain];
      siteData.lastSeen = new Date().toISOString();
      siteData.attempts++;
      
      // Update success rate
      const totalSuccess = (siteData.successRate * (siteData.attempts - 1)) + successRate;
      siteData.successRate = totalSuccess / siteData.attempts;

      // Learn URL patterns
      if (!siteData.urlPatterns.includes(url)) {
        siteData.urlPatterns.push(url);
      }

      // Learn successful selectors
      if (scrapedData && scrapedData.title) {
        if (!siteData.selectors.title) siteData.selectors.title = [];
        // Store successful title extraction method
        siteData.selectors.title.push({
          method: 'extracted',
          success: true,
          timestamp: new Date().toISOString()
        });
      }

      if (scrapedData && scrapedData.company) {
        if (!siteData.selectors.company) siteData.selectors.company = [];
        siteData.selectors.company.push({
          method: 'extracted',
          success: true,
          timestamp: new Date().toISOString()
        });
      }

      // Save learning data
      this.saveLearningData();
      
      console.log(`📚 Learning data updated for ${domain}. Success rate: ${(successRate * 100).toFixed(1)}%`);
    } catch (error) {
      console.error('Error learning from scraping:', error);
    }
  }

  getLearningStats(domain) {
    const siteData = this.learningData.sites[domain];
    if (!siteData) {
      return {
        isNewSite: true,
        attempts: 0,
        successRate: 0,
        confidence: 'low'
      };
    }

    let confidence = 'low';
    if (siteData.attempts >= 10 && siteData.successRate > 0.8) {
      confidence = 'high';
    } else if (siteData.attempts >= 5 && siteData.successRate > 0.6) {
      confidence = 'medium';
    }

    return {
      isNewSite: false,
      attempts: siteData.attempts,
      successRate: siteData.successRate,
      confidence: confidence,
      lastSeen: siteData.lastSeen
    };
  }

  async scrapeJob(url) {
    try {
      console.log(`🔍 Starting enhanced job scraping from: ${url}`);
      
      // Parse URL for initial data extraction
      const urlData = this.extractDataFromUrl(url);
      const domain = urlData.domain;
      console.log('📊 URL data extracted:', urlData);
      
      // Get learning stats for this domain
      const learningStats = this.getLearningStats(domain);
      console.log(`📚 Learning stats for ${domain}:`, learningStats);
      
      // Add overall timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Scraping timeout: Request took too long')), 15000); // Reduced to 15 seconds
      });

      const scrapingPromise = this.performEnhancedScraping(url, urlData);
      
      const scrapedData = await Promise.race([scrapingPromise, timeoutPromise]);

      // Merge URL data with scraped data
      const mergedData = this.mergeUrlAndScrapedData(urlData, scrapedData);
      
      // Enhanced validation and cleaning
      const cleanedData = this.validateAndCleanJobData(mergedData, url);
      
      // Calculate success rate for learning
      const successRate = this.calculateExtractionQuality(cleanedData) / 100;
      
      // Learn from this scraping attempt
      this.learnFromScraping(domain, url, cleanedData, successRate);
      
      console.log('✅ Final cleaned data:', cleanedData);
      
      return {
        success: true,
        data: cleanedData,
        source: scrapedData.source,
        url: url,
        extractionQuality: this.calculateExtractionQuality(cleanedData),
        learningStats: learningStats
      };

    } catch (error) {
      console.error('❌ Job scraping error:', error);
      
      // Learn from failed attempt
      const domain = new URL(url).hostname.toLowerCase();
      this.learnFromScraping(domain, url, null, 0);
      
      return {
        success: false,
        error: error.message,
        url: url,
        fallbackData: this.createFallbackData(url),
        learningStats: this.getLearningStats(domain)
      };
    }
  }

  extractDataFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part);
      const queryParams = Object.fromEntries(urlObj.searchParams.entries());
      
      const urlData = {
        domain: urlObj.hostname.toLowerCase(),
        pathParts: pathParts,
        queryParams: queryParams,
        extractedInfo: {}
      };

      // Extract job title from URL path
      const titlePatterns = [
        /job[-\s]?title[-\s]?([^\/\?]+)/i,
        /position[-\s]?([^\/\?]+)/i,
        /role[-\s]?([^\/\?]+)/i,
        /([^\/\?]+)-developer/i,
        /([^\/\?]+)-engineer/i,
        /([^\/\?]+)-specialist/i,
        /([^\/\?]+)-manager/i
      ];

      for (const pattern of titlePatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          urlData.extractedInfo.title = decodeURIComponent(match[1].replace(/[-_]/g, ' '));
          break;
        }
      }

      // Extract company from URL
      const companyPatterns = [
        /jobs\.([^.]+)\.com/i,
        /([^.]+)\.jobs/i,
        /([^.]+)\.com\/jobs/i
      ];

      for (const pattern of companyPatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          urlData.extractedInfo.company = match[1].replace(/[-_]/g, ' ').toUpperCase();
          break;
        }
      }

      // Extract location from URL
      const locationPatterns = [
        /location[-\s]?([^\/\?]+)/i,
        /city[-\s]?([^\/\?]+)/i,
        /([a-z]{2,3})-([a-z]{2,3})/i, // Country codes
        /remote/i,
        /hybrid/i
      ];

      for (const pattern of locationPatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          urlData.extractedInfo.location = decodeURIComponent(match[1].replace(/[-_]/g, ' '));
          break;
        }
      }

      // Extract job type from URL
      if (url.toLowerCase().includes('remote')) {
        urlData.extractedInfo.jobType = 'Remote';
      } else if (url.toLowerCase().includes('hybrid')) {
        urlData.extractedInfo.jobType = 'Hybrid';
      } else if (url.toLowerCase().includes('part-time')) {
        urlData.extractedInfo.jobType = 'Part-time';
      } else if (url.toLowerCase().includes('contract')) {
        urlData.extractedInfo.jobType = 'Contract';
      } else if (url.toLowerCase().includes('intern')) {
        urlData.extractedInfo.jobType = 'Internship';
      }

      // Extract experience level from URL
      if (url.toLowerCase().includes('senior') || url.toLowerCase().includes('lead')) {
        urlData.extractedInfo.experience = 'Senior';
      } else if (url.toLowerCase().includes('junior') || url.toLowerCase().includes('entry')) {
        urlData.extractedInfo.experience = 'Entry';
      } else if (url.toLowerCase().includes('mid') || url.toLowerCase().includes('intermediate')) {
        urlData.extractedInfo.experience = 'Mid';
      }

      return urlData;
    } catch (error) {
      console.error('Error extracting URL data:', error);
      return { domain: '', pathParts: [], queryParams: {}, extractedInfo: {} };
    }
  }

  async performEnhancedScraping(url, urlData) {
    const siteType = this.detectJobSite(url);
    let jobData = null;

    console.log(`🎯 Detected site type: ${siteType}`);

    // Try site-specific scraper first
    try {
      switch (siteType) {
        case 'linkedin':
          jobData = await this.scrapeLinkedIn(url);
          break;
        case 'indeed':
          jobData = await this.scrapeIndeed(url);
          break;
        case 'glassdoor':
          jobData = await this.scrapeGlassdoor(url);
          break;
        case 'monster':
          jobData = await this.scrapeMonster(url);
          break;
        case 'ziprecruiter':
          jobData = await this.scrapeZipRecruiter(url);
          break;
        case 'dice':
          jobData = await this.scrapeDice(url);
          break;
        case 'stackoverflow':
          jobData = await this.scrapeStackOverflow(url);
          break;
        case 'github':
          jobData = await this.scrapeGitHub(url);
          break;
        case 'amazon':
          jobData = await this.scrapeAmazon(url);
          break;
        case 'flipkart':
          jobData = await this.scrapeFlipkart(url);
          break;
        default:
          jobData = await this.scrapeGeneric(url);
      }
    } catch (error) {
      console.log(`⚠️ Site-specific scraper failed for ${siteType}, falling back to generic:`, error.message);
      jobData = await this.scrapeGeneric(url);
    }

    // If still no data, try advanced generic scraping
    if (!jobData || !jobData.title) {
      console.log('🔄 Trying advanced generic scraping...');
      jobData = await this.scrapeAdvancedGeneric(url);
    }

    jobData.source = siteType;
    return jobData;
  }

  async scrapeAdvancedGeneric(url) {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    
    const jobData = {
      title: '',
      company: '',
      location: '',
      description: '',
      skills: [],
      salary: '',
      jobType: 'Full-time',
      experience: 'Entry',
      applyLink: url
    };

    // Enhanced title extraction with multiple strategies
    const titleSelectors = [
      // Common job title selectors
      'h1',
      '[class*="title"]',
      '[id*="title"]',
      '[class*="job-title"]',
      '[id*="job-title"]',
      '[class*="position"]',
      '[id*="position"]',
      '[class*="role"]',
      '[id*="role"]',
      // Meta tags
      'meta[property="og:title"]',
      'meta[name="title"]',
      // Schema.org markup
      '[itemprop="title"]',
      '[data-testid*="title"]',
      '[data-test*="title"]'
    ];

    for (const selector of titleSelectors) {
      const element = $(selector).first();
      if (element.length) {
        const text = element.text().trim() || element.attr('content') || element.attr('value');
        if (text && text.length > 5 && text.length < 100 && !text.includes('Home') && !text.includes('About')) {
          jobData.title = text;
          break;
        }
      }
    }

    // Enhanced company extraction
    const companySelectors = [
      '[class*="company"]',
      '[id*="company"]',
      '[class*="employer"]',
      '[id*="employer"]',
      '[class*="organization"]',
      '[id*="organization"]',
      '[itemprop="hiringOrganization"]',
      '[itemprop="name"]',
      'meta[property="og:site_name"]',
      '[data-testid*="company"]',
      '[data-test*="company"]'
    ];

    for (const selector of companySelectors) {
      const element = $(selector).first();
      if (element.length) {
        const text = element.text().trim() || element.attr('content');
        if (text && text.length > 2 && text.length < 50) {
          jobData.company = text;
          break;
        }
      }
    }

    // Enhanced location extraction
    const locationSelectors = [
      '[class*="location"]',
      '[id*="location"]',
      '[class*="address"]',
      '[id*="address"]',
      '[itemprop="jobLocation"]',
      '[itemprop="address"]',
      '[data-testid*="location"]',
      '[data-test*="location"]'
    ];

    for (const selector of locationSelectors) {
      const element = $(selector).first();
      if (element.length) {
        const text = element.text().trim();
        if (text && text.length > 3 && text.length < 100) {
          jobData.location = text;
          break;
        }
      }
    }

    // Enhanced description extraction
    const descriptionSelectors = [
      '[class*="description"]',
      '[id*="description"]',
      '[class*="content"]',
      '[id*="content"]',
      '[class*="details"]',
      '[id*="details"]',
      '[itemprop="description"]',
      'article',
      '.job-content',
      '.posting-content',
      '.job-details',
      '[data-testid*="description"]',
      '[data-test*="description"]'
    ];

    for (const selector of descriptionSelectors) {
      const element = $(selector);
      if (element.length) {
        const text = element.text().trim();
        if (text && text.length > 200) {
          jobData.description = text;
          break;
        }
      }
    }

    // Extract skills from description
    jobData.skills = this.extractSkillsFromText(jobData.description);

    // Extract salary information
    const salaryPatterns = [
      /\$[\d,]+(?:-\$[\d,]+)?\s*(?:per\s+)?(?:year|month|hour|week)/gi,
      /(?:salary|compensation|pay):\s*\$[\d,]+(?:-\$[\d,]+)?/gi,
      /(?:USD|CAD|EUR|GBP)\s*[\d,]+(?:-\s*[\d,]+)?/gi
    ];

    for (const pattern of salaryPatterns) {
      const matches = jobData.description.match(pattern);
      if (matches && matches.length > 0) {
        jobData.salary = matches[0];
        break;
      }
    }

    return jobData;
  }

  mergeUrlAndScrapedData(urlData, scrapedData) {
    const merged = { ...scrapedData };

    // Use URL data as fallback for missing scraped data
    if (!merged.title && urlData.extractedInfo.title) {
      merged.title = urlData.extractedInfo.title;
    }

    if (!merged.company && urlData.extractedInfo.company) {
      merged.company = urlData.extractedInfo.company;
    }

    if (!merged.location && urlData.extractedInfo.location) {
      merged.location = urlData.extractedInfo.location;
    }

    if (!merged.jobType && urlData.extractedInfo.jobType) {
      merged.jobType = urlData.extractedInfo.jobType;
    }

    if (!merged.experience && urlData.extractedInfo.experience) {
      merged.experience = urlData.extractedInfo.experience;
    }

    // Enhance company name from domain if available
    if (!merged.company && urlData.domain) {
      const domainCompany = this.extractCompanyFromDomain(urlData.domain);
      if (domainCompany) {
        merged.company = domainCompany;
      }
    }

    return merged;
  }

  extractCompanyFromDomain(domain) {
    const domainMap = {
      'amazon.jobs': 'Amazon',
      'jobs.apple.com': 'Apple',
      'careers.google.com': 'Google',
      'jobs.microsoft.com': 'Microsoft',
      'careers.facebook.com': 'Meta',
      'jobs.netflix.com': 'Netflix',
      'careers.twitter.com': 'Twitter',
      'jobs.spotify.com': 'Spotify',
      'careers.uber.com': 'Uber',
      'jobs.airbnb.com': 'Airbnb',
      'careers.lyft.com': 'Lyft',
      'jobs.salesforce.com': 'Salesforce',
      'careers.adobe.com': 'Adobe',
      'jobs.oracle.com': 'Oracle',
      'careers.ibm.com': 'IBM',
      'jobs.intel.com': 'Intel',
      'careers.nvidia.com': 'NVIDIA',
      'jobs.amd.com': 'AMD',
      'careers.cisco.com': 'Cisco',
      'jobs.dell.com': 'Dell'
    };

    return domainMap[domain] || null;
  }

  extractSkillsFromText(text) {
    if (!text) return [];

    const allSkills = [];
    const lowerText = text.toLowerCase();

    // Extract skills from all categories
    for (const category in this.skillPatterns) {
      for (const skill of this.skillPatterns[category]) {
        if (lowerText.includes(skill.toLowerCase())) {
          allSkills.push(skill);
        }
      }
    }

    // Enhanced skill pattern matching
    const skillPatterns = [
      /(?:experience with|proficient in|knowledge of|familiar with|expertise in|strong|solid)\s+([A-Za-z#+]+(?:\s*[A-Za-z#+]+)*)/gi,
      /([A-Za-z#+]+(?:\s*[A-Za-z#+]+)*)\s+(?:experience|proficiency|knowledge|skills|expertise)/gi,
      /(?:technologies|tools|frameworks|languages|platforms):\s*([A-Za-z,\s#+]+)/gi,
      /(?:required|preferred|must have|should have):\s*([A-Za-z,\s#+]+)/gi
    ];

    for (const pattern of skillPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const skills = match
            .replace(/(?:experience with|proficient in|knowledge of|familiar with|expertise in|strong|solid|experience|proficiency|knowledge|skills|expertise|technologies|tools|frameworks|languages|platforms|required|preferred|must have|should have):/gi, '')
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 2 && skill.length < 30);
          
          allSkills.push(...skills);
        }
      }
    }

    // Remove duplicates and limit results
    const uniqueSkills = [...new Set(allSkills)];
    return uniqueSkills.slice(0, 15);
  }

  calculateExtractionQuality(data) {
    let score = 0;
    const maxScore = 100;

    if (data.title) score += 20;
    if (data.company) score += 15;
    if (data.location) score += 15;
    if (data.description && data.description.length > 200) score += 25;
    if (data.skills && data.skills.length > 0) score += 15;
    if (data.salary) score += 10;

    return Math.min(score, maxScore);
  }

  createFallbackData(url) {
    const urlData = this.extractDataFromUrl(url);
    return {
      title: urlData.extractedInfo.title || 'Job Title Not Found',
      company: urlData.extractedInfo.company || 'Company Not Found',
      location: urlData.extractedInfo.location || 'Location Not Specified',
      description: 'Job description could not be extracted. Please manually review the job posting.',
      skills: [],
      salary: '',
      jobType: urlData.extractedInfo.jobType || 'Full-time',
      experience: urlData.extractedInfo.experience || 'Entry',
      applyLink: url,
      status: 'draft'
    };
  }

  detectJobSite(url) {
    const domain = new URL(url).hostname.toLowerCase();
    
    if (domain.includes('linkedin.com')) return 'linkedin';
    if (domain.includes('indeed.com')) return 'indeed';
    if (domain.includes('glassdoor.com')) return 'glassdoor';
    if (domain.includes('monster.com')) return 'monster';
    if (domain.includes('ziprecruiter.com')) return 'ziprecruiter';
    if (domain.includes('dice.com')) return 'dice';
    if (domain.includes('stackoverflow.com')) return 'stackoverflow';
    if (domain.includes('github.com')) return 'github';
    if (domain.includes('amazon.jobs')) return 'amazon';
    if (domain.includes('flipkartcareers.com')) return 'flipkart';
    
    return 'generic';
  }

  async fetchPage(url) {
    const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 10000, // Reduced timeout to 10 seconds
        maxRedirects: 3, // Reduced redirects
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept 2xx and 3xx status codes
        }
      });

      return response.data;
    } catch (error) {
      console.error(`Error fetching page from ${url}:`, error.message);
      
      // If it's a timeout or network error, try with different settings
      if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error(`Failed to fetch page: ${error.message}. The site might be blocking automated requests or be temporarily unavailable.`);
      }
      
      throw error;
    }
  }

  async scrapeLinkedIn(url) {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    
    const jobData = {
      title: '',
      company: '',
      location: '',
      description: '',
      skills: [],
      salary: '',
      jobType: 'Full-time',
      experience: 'Entry',
      applyLink: url
    };

    // LinkedIn job title
    jobData.title = $('.job-details-jobs-unified-top-card__job-title').text().trim() ||
                   $('h1').first().text().trim() ||
                   $('[data-test-id="job-details-job-title"]').text().trim();

    // LinkedIn company name
    jobData.company = $('.job-details-jobs-unified-top-card__company-name').text().trim() ||
                     $('[data-test-id="job-details-company-name"]').text().trim() ||
                     $('.jobs-unified-top-card__company-name').text().trim();

    // LinkedIn location
    jobData.location = $('.job-details-jobs-unified-top-card__bullet').first().text().trim() ||
                      $('[data-test-id="job-details-location"]').text().trim() ||
                      $('.jobs-unified-top-card__location').text().trim();

    // LinkedIn job description
    jobData.description = $('.jobs-description__content').text().trim() ||
                         $('.jobs-box__html-content').text().trim() ||
                         $('[data-test-id="job-details-description"]').text().trim();

    // Extract skills from description
    jobData.skills = this.extractSkillsFromText(jobData.description);

    return jobData;
  }

  async scrapeIndeed(url) {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    
    const jobData = {
      title: '',
      company: '',
      location: '',
      description: '',
      skills: [],
      salary: '',
      jobType: 'Full-time',
      experience: 'Entry',
      applyLink: url
    };

    // Indeed job title
    jobData.title = $('h1[data-testid="jobsearch-JobInfoHeader-title"]').text().trim() ||
                   $('.jobsearch-JobInfoHeader-title').text().trim() ||
                   $('h1').first().text().trim();

    // Indeed company name
    jobData.company = $('[data-testid="jobsearch-JobInfoHeader-companyName"]').text().trim() ||
                     $('.jobsearch-JobInfoHeader-companyName').text().trim();

    // Indeed location
    jobData.location = $('[data-testid="jobsearch-JobInfoHeader-locationText"]').text().trim() ||
                      $('.jobsearch-JobInfoHeader-locationText').text().trim();

    // Indeed job description
    jobData.description = $('[data-testid="jobsearch-JobComponent-description"]').text().trim() ||
                         $('.jobsearch-JobComponent-description').text().trim();

    // Indeed salary
    jobData.salary = $('[data-testid="jobsearch-JobInfoHeader-salaryText"]').text().trim() ||
                    $('.jobsearch-JobInfoHeader-salaryText').text().trim();

    // Extract skills from description
    jobData.skills = this.extractSkillsFromText(jobData.description);

    return jobData;
  }

  async scrapeGlassdoor(url) {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    
    const jobData = {
      title: '',
      company: '',
      location: '',
      description: '',
      skills: [],
      salary: '',
      jobType: 'Full-time',
      experience: 'Entry',
      applyLink: url
    };

    // Glassdoor job title
    jobData.title = $('.job-title').text().trim() ||
                   $('h1').first().text().trim();

    // Glassdoor company name
    jobData.company = $('.employer-name').text().trim() ||
                     $('.company-name').text().trim();

    // Glassdoor location
    jobData.location = $('.location').text().trim() ||
                      $('.job-location').text().trim();

    // Glassdoor job description
    jobData.description = $('.jobDescriptionContent').text().trim() ||
                         $('.desc').text().trim();

    // Glassdoor salary
    jobData.salary = $('.salary-estimate').text().trim() ||
                    $('.salary').text().trim();

    // Extract skills from description
    jobData.skills = this.extractSkillsFromText(jobData.description);

    return jobData;
  }

  async scrapeStackOverflow(url) {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    
    const jobData = {
      title: '',
      company: '',
      location: '',
      description: '',
      skills: [],
      salary: '',
      jobType: 'Full-time',
      experience: 'Entry',
      applyLink: url
    };

    // Stack Overflow job title
    jobData.title = $('.job-details--title').text().trim() ||
                   $('h1').first().text().trim();

    // Stack Overflow company name
    jobData.company = $('.job-details--company-name').text().trim() ||
                     $('.company-name').text().trim();

    // Stack Overflow location
    jobData.location = $('.job-details--location').text().trim() ||
                      $('.location').text().trim();

    // Stack Overflow job description
    jobData.description = $('.job-details--description').text().trim() ||
                         $('.description').text().trim();

    // Stack Overflow tags/skills
    const tags = $('.job-details--tags .tag').map((i, el) => $(el).text().trim()).get();
    jobData.skills = tags.length > 0 ? tags : this.extractSkillsFromText(jobData.description);

    return jobData;
  }

  async scrapeGitHub(url) {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    
    const jobData = {
      title: '',
      company: '',
      location: '',
      description: '',
      skills: [],
      salary: '',
      jobType: 'Full-time',
      experience: 'Entry',
      applyLink: url
    };

    // GitHub job title
    jobData.title = $('.job-title').text().trim() ||
                   $('h1').first().text().trim();

    // GitHub company name
    jobData.company = $('.company-name').text().trim() ||
                     $('.employer-name').text().trim();

    // GitHub location
    jobData.location = $('.location').text().trim() ||
                      $('.job-location').text().trim();

    // GitHub job description
    jobData.description = $('.job-description').text().trim() ||
                         $('.description').text().trim();

    // GitHub tags/skills
    const tags = $('.job-tags .tag').map((i, el) => $(el).text().trim()).get();
    jobData.skills = tags.length > 0 ? tags : this.extractSkillsFromText(jobData.description);

    return jobData;
  }

  async scrapeAmazon(url) {
    try {
      const html = await this.fetchPage(url);
      const $ = cheerio.load(html);
      
      const jobData = {
        title: '',
        company: 'Amazon',
        location: '',
        description: '',
        skills: [],
        salary: '',
        jobType: 'Full-time',
        experience: 'Entry',
        applyLink: url
      };

      // Amazon job title - multiple selectors
      jobData.title = $('.job-title').text().trim() ||
                     $('h1').first().text().trim() ||
                     $('[data-testid="job-title"]').text().trim() ||
                     $('.job-details-title').text().trim();

      // Amazon location
      jobData.location = $('.job-location').text().trim() ||
                        $('.location').text().trim() ||
                        $('[data-testid="job-location"]').text().trim();

      // Amazon job description
      jobData.description = $('.job-description').text().trim() ||
                           $('.description').text().trim() ||
                           $('.job-details-description').text().trim();

      // Extract skills from description
      jobData.skills = this.extractSkillsFromText(jobData.description);

      // If we couldn't get much data, enhance with URL parsing
      if (!jobData.title || !jobData.description) {
        const urlData = this.extractDataFromUrl(url);
        if (urlData.extractedInfo.title && !jobData.title) {
          jobData.title = urlData.extractedInfo.title;
        }
        if (urlData.extractedInfo.location && !jobData.location) {
          jobData.location = urlData.extractedInfo.location;
        }
      }

      return jobData;
    } catch (error) {
      console.log('Amazon scraper failed, using URL-based fallback:', error.message);
      // Fallback to URL-based extraction
      return this.createAmazonFallbackData(url);
    }
  }

  createAmazonFallbackData(url) {
    const jobData = {
      title: '',
      company: 'Amazon',
      location: '',
      description: 'Amazon job posting. Please visit the original link for complete details and to apply.',
      skills: ['Software Development', 'Engineering', 'Problem Solving', 'Team Collaboration'],
      salary: '',
      jobType: 'Full-time',
      experience: 'Entry',
      applyLink: url
    };

    // Extract title from URL path
    const urlParts = url.split('/');
    const titlePart = urlParts[urlParts.length - 1];
    if (titlePart && titlePart.length > 3) {
      jobData.title = titlePart.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }

    // Extract location from URL
    const locationMap = {
      'chennai': 'Chennai, TN',
      'bangalore': 'Bangalore, KA', 
      'hyderabad': 'Hyderabad, TG',
      'mumbai': 'Mumbai, MH',
      'delhi': 'Delhi, DL',
      'pune': 'Pune, MH',
      'gurgaon': 'Gurgaon, HR',
      'noida': 'Noida, UP',
      'remote': 'Remote',
      'hybrid': 'Hybrid'
    };

    for (const [key, value] of Object.entries(locationMap)) {
      if (url.toLowerCase().includes(key)) {
        jobData.location = value;
        break;
      }
    }

    // Extract job type from URL
    if (url.toLowerCase().includes('intern')) {
      jobData.jobType = 'Internship';
      jobData.experience = 'Entry';
    } else if (url.toLowerCase().includes('senior') || url.toLowerCase().includes('lead')) {
      jobData.experience = 'Senior';
    } else if (url.toLowerCase().includes('junior')) {
      jobData.experience = 'Entry';
    } else if (url.toLowerCase().includes('mid') || url.toLowerCase().includes('intermediate')) {
      jobData.experience = 'Mid';
    }

    return jobData;
  }

  async scrapeFlipkart(url) {
    try {
      console.log('🛒 Attempting to scrape Flipkart job...');
      
      // Flipkart careers often use JavaScript-heavy pages, so we'll use URL-based extraction first
      const urlData = this.extractDataFromUrl(url);
      
      const jobData = {
        title: '',
        company: 'Flipkart',
        location: '',
        description: 'Flipkart job posting. Please visit the original link for complete details and to apply.',
        skills: ['Software Development', 'Engineering', 'Problem Solving', 'Team Collaboration', 'E-commerce'],
        salary: '',
        jobType: 'Full-time',
        experience: 'Entry',
        applyLink: url
      };

      // Extract title from URL - Flipkart uses patterns like "software-development-engineer-iii"
      const urlParts = url.split('/');
      const titlePart = urlParts[urlParts.length - 1];
      if (titlePart && titlePart.length > 3) {
        // Convert "software-development-engineer-iii" to "Software Development Engineer III"
        jobData.title = titlePart.split('-').map(word => {
          // Handle roman numerals and special cases
          if (word === 'iii') return 'III';
          if (word === 'ii') return 'II';
          if (word === 'i') return 'I';
          if (word === 'iv') return 'IV';
          if (word === 'v') return 'V';
          return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
      }

      // Extract location from URL
      const locationMap = {
        'bangalore': 'Bangalore, Karnataka',
        'karnataka': 'Bangalore, Karnataka',
        'mumbai': 'Mumbai, Maharashtra',
        'delhi': 'Delhi, Delhi',
        'gurgaon': 'Gurgaon, Haryana',
        'noida': 'Noida, Uttar Pradesh',
        'hyderabad': 'Hyderabad, Telangana',
        'chennai': 'Chennai, Tamil Nadu',
        'pune': 'Pune, Maharashtra',
        'remote': 'Remote',
        'hybrid': 'Hybrid'
      };

      for (const [key, value] of Object.entries(locationMap)) {
        if (url.toLowerCase().includes(key)) {
          jobData.location = value;
          break;
        }
      }

      // Extract experience level from title
      if (jobData.title.toLowerCase().includes('senior') || jobData.title.toLowerCase().includes('iii')) {
        jobData.experience = 'Senior';
      } else if (jobData.title.toLowerCase().includes('junior') || jobData.title.toLowerCase().includes('i')) {
        jobData.experience = 'Entry';
      } else if (jobData.title.toLowerCase().includes('mid') || jobData.title.toLowerCase().includes('ii')) {
        jobData.experience = 'Mid';
      }

      // Try to fetch the page for additional data (with shorter timeout)
      try {
        const html = await this.fetchPage(url);
        const $ = cheerio.load(html);
        
        // Try to extract additional information if available
        const pageTitle = $('title').text().trim();
        if (pageTitle && !jobData.title) {
          jobData.title = pageTitle.replace(' - Flipkart Careers', '').replace(' | Flipkart Careers', '');
        }

        // Try to find description
        const description = $('.job-description').text().trim() ||
                           $('.description').text().trim() ||
                           $('[class*="description"]').text().trim();
        
        if (description && description.length > 100) {
          jobData.description = description;
          jobData.skills = this.extractSkillsFromText(description);
        }
      } catch (fetchError) {
        console.log('⚠️ Could not fetch Flipkart page, using URL-based data only:', fetchError.message);
      }

      console.log('✅ Flipkart job data extracted:', jobData);
      return jobData;
      
    } catch (error) {
      console.log('❌ Flipkart scraper failed, using fallback:', error.message);
      return this.createFlipkartFallbackData(url);
    }
  }

  createFlipkartFallbackData(url) {
    const jobData = {
      title: '',
      company: 'Flipkart',
      location: '',
      description: 'Flipkart job posting. Please visit the original link for complete details and to apply.',
      skills: ['Software Development', 'Engineering', 'Problem Solving', 'Team Collaboration', 'E-commerce', 'Java', 'Python'],
      salary: '',
      jobType: 'Full-time',
      experience: 'Entry',
      applyLink: url
    };

    // Extract title from URL
    const urlParts = url.split('/');
    const titlePart = urlParts[urlParts.length - 1];
    if (titlePart && titlePart.length > 3) {
      jobData.title = titlePart.split('-').map(word => {
        if (word === 'iii') return 'III';
        if (word === 'ii') return 'II';
        if (word === 'i') return 'I';
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ');
    }

    // Extract location
    if (url.toLowerCase().includes('bangalore')) {
      jobData.location = 'Bangalore, Karnataka';
    } else if (url.toLowerCase().includes('mumbai')) {
      jobData.location = 'Mumbai, Maharashtra';
    } else if (url.toLowerCase().includes('delhi')) {
      jobData.location = 'Delhi, Delhi';
    }

    // Extract experience level
    if (jobData.title.toLowerCase().includes('senior') || jobData.title.toLowerCase().includes('iii')) {
      jobData.experience = 'Senior';
    } else if (jobData.title.toLowerCase().includes('junior') || jobData.title.toLowerCase().includes('i')) {
      jobData.experience = 'Entry';
    } else if (jobData.title.toLowerCase().includes('mid') || jobData.title.toLowerCase().includes('ii')) {
      jobData.experience = 'Mid';
    }

    return jobData;
  }

  async scrapeMonster(url) {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    
    const jobData = {
      title: '',
      company: '',
      location: '',
      description: '',
      skills: [],
      salary: '',
      jobType: 'Full-time',
      experience: 'Entry',
      applyLink: url
    };

    // Monster job title
    jobData.title = $('.job-title').text().trim() ||
                   $('h1').first().text().trim();

    // Monster company name
    jobData.company = $('.company-name').text().trim() ||
                     $('.employer-name').text().trim();

    // Monster location
    jobData.location = $('.location').text().trim() ||
                      $('.job-location').text().trim();

    // Monster job description
    jobData.description = $('.job-description').text().trim() ||
                         $('.description').text().trim();

    // Extract skills from description
    jobData.skills = this.extractSkillsFromText(jobData.description);

    return jobData;
  }

  async scrapeZipRecruiter(url) {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    
    const jobData = {
      title: '',
      company: '',
      location: '',
      description: '',
      skills: [],
      salary: '',
      jobType: 'Full-time',
      experience: 'Entry',
      applyLink: url
    };

    // ZipRecruiter job title
    jobData.title = $('.job-title').text().trim() ||
                   $('h1').first().text().trim();

    // ZipRecruiter company name
    jobData.company = $('.company-name').text().trim() ||
                     $('.employer-name').text().trim();

    // ZipRecruiter location
    jobData.location = $('.location').text().trim() ||
                      $('.job-location').text().trim();

    // ZipRecruiter job description
    jobData.description = $('.job-description').text().trim() ||
                         $('.description').text().trim();

    // Extract skills from description
    jobData.skills = this.extractSkillsFromText(jobData.description);

    return jobData;
  }

  async scrapeDice(url) {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    
    const jobData = {
      title: '',
      company: '',
      location: '',
      description: '',
      skills: [],
      salary: '',
      jobType: 'Full-time',
      experience: 'Entry',
      applyLink: url
    };

    // Dice job title
    jobData.title = $('.job-title').text().trim() ||
                   $('h1').first().text().trim();

    // Dice company name
    jobData.company = $('.company-name').text().trim() ||
                     $('.employer-name').text().trim();

    // Dice location
    jobData.location = $('.location').text().trim() ||
                      $('.job-location').text().trim();

    // Dice job description
    jobData.description = $('.job-description').text().trim() ||
                         $('.description').text().trim();

    // Extract skills from description
    jobData.skills = this.extractSkillsFromText(jobData.description);

    return jobData;
  }

  async scrapeGeneric(url) {
    const html = await this.fetchPage(url);
    const $ = cheerio.load(html);
    
    const jobData = {
      title: '',
      company: '',
      location: '',
      description: '',
      skills: [],
      salary: '',
      jobType: 'Full-time',
      experience: 'Entry',
      applyLink: url
    };

    // Generic selectors for common job posting patterns
    const titleSelectors = [
      'h1',
      '.job-title',
      '.title',
      '[class*="title"]',
      '[id*="title"]',
      'h2',
      'h3'
    ];

    const companySelectors = [
      '.company',
      '.company-name',
      '.employer',
      '.employer-name',
      '[class*="company"]',
      '[id*="company"]'
    ];

    const locationSelectors = [
      '.location',
      '.job-location',
      '[class*="location"]',
      '[id*="location"]'
    ];

    const descriptionSelectors = [
      '.description',
      '.job-description',
      '.content',
      '.details',
      '[class*="description"]',
      '[id*="description"]',
      'article',
      '.job-content'
    ];

    // Try to find job title
    for (const selector of titleSelectors) {
      const text = $(selector).first().text().trim();
      if (text && text.length > 5 && text.length < 100) {
        jobData.title = text;
        break;
      }
    }

    // Try to find company name
    for (const selector of companySelectors) {
      const text = $(selector).first().text().trim();
      if (text && text.length > 2 && text.length < 50) {
        jobData.company = text;
        break;
      }
    }

    // Try to find location
    for (const selector of locationSelectors) {
      const text = $(selector).first().text().trim();
      if (text && text.length > 3 && text.length < 50) {
        jobData.location = text;
        break;
      }
    }

    // Try to find description
    for (const selector of descriptionSelectors) {
      const text = $(selector).text().trim();
      if (text && text.length > 100) {
        jobData.description = text;
        break;
      }
    }

    // Extract skills from description
    jobData.skills = this.extractSkillsFromText(jobData.description);

    return jobData;
  }

  validateAndCleanJobData(jobData, url) {
    const cleaned = { ...jobData };

    // Clean and validate title
    if (cleaned.title) {
      cleaned.title = cleaned.title.replace(/\s+/g, ' ').trim();
      if (cleaned.title.length > 100) {
        cleaned.title = cleaned.title.substring(0, 100) + '...';
      }
    }

    // Clean and validate company
    if (cleaned.company) {
      cleaned.company = cleaned.company.replace(/\s+/g, ' ').trim();
      if (cleaned.company.length > 50) {
        cleaned.company = cleaned.company.substring(0, 50) + '...';
      }
    }

    // Clean and validate location
    if (cleaned.location) {
      cleaned.location = cleaned.location.replace(/\s+/g, ' ').trim();
      if (cleaned.location.length > 50) {
        cleaned.location = cleaned.location.substring(0, 50) + '...';
      }
    }

    // Clean and validate description
    if (cleaned.description) {
      cleaned.description = cleaned.description.replace(/\s+/g, ' ').trim();
      if (cleaned.description.length > 2000) {
        cleaned.description = cleaned.description.substring(0, 2000) + '...';
      }
    }

    // Clean skills array
    if (cleaned.skills && Array.isArray(cleaned.skills)) {
      cleaned.skills = cleaned.skills
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0 && skill.length < 30)
        .slice(0, 10);
    } else {
      cleaned.skills = [];
    }

    // Set default values for missing fields
    if (!cleaned.jobType) cleaned.jobType = 'Full-time';
    if (!cleaned.experience) cleaned.experience = 'Entry';
    if (!cleaned.applyLink) cleaned.applyLink = url;

    return cleaned;
  }

  async testScraping(url) {
    try {
      const result = await this.scrapeJob(url);
      return {
        success: result.success,
        data: result.data,
        source: result.source,
        url: url,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        url: url,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default new JobScraperService(); 