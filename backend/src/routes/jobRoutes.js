import express from 'express';
import { 
  getJobs, 
  getActiveJobs,
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob,
  getAllJobsForAdmin
} from '../controllers/jobController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { jobSearchLimiter, adminLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply job search rate limiter to public routes
router.use(jobSearchLimiter);

// Public routes
router.get('/', getJobs); // Shows all jobs regardless of status
router.get('/active', getActiveJobs); // Shows only active jobs
router.get('/:id', getJobById);

// Admin routes (require authentication + admin role + stricter rate limiting)
router.use(protect, admin, adminLimiter);
router.get('/admin/all', getAllJobsForAdmin);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router; 