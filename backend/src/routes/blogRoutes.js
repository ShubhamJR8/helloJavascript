import express from 'express';
import {
  getBlogs,
  getBlogsOrganizedByTopic,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublish,
  toggleFeature,
  likeBlog,
  getCategories,
  getFeaturedBlogs,
  searchBlogs
} from '../controllers/blogController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateBlog } from '../middleware/validationMiddleware.js';
import { blogLimiter, blogSearchLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply blog-specific rate limiter to all blog routes
router.use(blogLimiter);

// Public routes
router.get('/', getBlogs);
router.get('/organized', getBlogsOrganizedByTopic);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedBlogs);
router.get('/search', blogSearchLimiter, searchBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/:id/like', likeBlog);

// Protected routes (Admin only)
router.post('/', protect, validateBlog, createBlog);
router.put('/:id', protect, validateBlog, updateBlog);
router.delete('/:id', protect, deleteBlog);
router.patch('/:id/publish', protect, togglePublish);
router.patch('/:id/feature', protect, toggleFeature);

export default router; 