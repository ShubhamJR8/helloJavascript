import express from 'express';
import { 
  getJobs, 
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob,
  getUserJobs 
} from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected routes (require authentication)
router.use(protect);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.get('/user/jobs', getUserJobs);

export default router; 