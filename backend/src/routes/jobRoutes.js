import express from 'express';
import { 
  getJobs, 
  getActiveJobs,
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob,
  getAllJobsForAdmin,
  updateJobStatus,
  bulkUpdateJobStatus,
  bulkDeleteJobs,
  duplicateJob,
  getJobAnalytics,
  searchJobsAdmin
} from '../controllers/jobController.js';
import {
  scrapeJobFromUrl,
  testJobScraping,
  getSupportedSites,
  validateScrapingUrl,
  getLearningStats,
  getAllLearningData
} from '../controllers/jobScraperController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { jobSearchLimiter, adminLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply job search rate limiter to public routes
router.use(jobSearchLimiter);

// Public routes
router.get('/', getJobs); // Shows all jobs regardless of status
router.get('/active', getActiveJobs); // Shows only active jobs
router.get('/:id', getJobById);

// Job scraping routes (public for testing, but rate limited)
router.get('/scrape/test', testJobScraping);
router.get('/scrape/supported-sites', getSupportedSites);
router.post('/scrape/validate-url', validateScrapingUrl);

// Admin routes (require authentication + admin role + stricter rate limiting)
router.use(protect, admin, adminLimiter);
router.get('/admin/all', getAllJobsForAdmin);
router.get('/admin/search', searchJobsAdmin);
router.get('/admin/analytics', getJobAnalytics);
router.post('/', createJob);
router.put('/:id', updateJob);
router.patch('/:id/status', updateJobStatus);
router.post('/bulk/status', bulkUpdateJobStatus);
router.post('/bulk/delete', bulkDeleteJobs);
router.post('/:id/duplicate', duplicateJob);
router.delete('/:id', deleteJob);

// Admin scraping routes
router.post('/scrape/job', scrapeJobFromUrl);
router.get('/scrape/learning-stats', getLearningStats);
router.get('/scrape/learning-data', getAllLearningData);

export default router; 