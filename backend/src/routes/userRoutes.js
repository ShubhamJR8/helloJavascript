import express from 'express';
import {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);

export default router; 