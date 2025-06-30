import { body, validationResult } from 'express-validator';

export const validateStartQuizAttempt = [
  body('topic').notEmpty().withMessage('Topic is required'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateCompleteQuizAttempt = [
  body('attemptId').isMongoId().withMessage('Invalid attempt ID'),
  body('answers').isArray().withMessage('Answers must be an array'),
  body('answers.*.questionId').isMongoId().withMessage('Invalid question ID'),
  body('answers.*.selectedOption').optional({ nullable: true }).isString().withMessage('Selected option must be a string or null'),
  body('answers.*.submittedCode').optional({ nullable: true }).isString().withMessage('Submitted code must be a string or null'),
  body('answers.*.timeTaken').isNumeric().withMessage('Time taken must be a number'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateBlog = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters long'),
  
  body('excerpt')
    .notEmpty().withMessage('Excerpt is required')
    .isLength({ min: 10, max: 300 }).withMessage('Excerpt must be between 10 and 300 characters'),
  
  body('topic')
    .notEmpty().withMessage('Topic is required')
    .isIn(['javascript', 'typescript', 'react', 'angular', 'node'])
    .withMessage('Invalid topic'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Advanced Concepts', 'Best Practices', 'Tutorials', 'Tips & Tricks', 'Case Studies'])
    .withMessage('Invalid category'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return true;
    }),
  
  body('tags.*')
    .optional()
    .isString().withMessage('Each tag must be a string')
    .isLength({ min: 1, max: 20 }).withMessage('Each tag must be between 1 and 20 characters'),
  
  body('coverImage')
    .optional()
    .isURL().withMessage('Cover image must be a valid URL'),
  
  body('seoTitle')
    .optional()
    .isLength({ max: 60 }).withMessage('SEO title cannot exceed 60 characters'),
  
  body('seoDescription')
    .optional()
    .isLength({ max: 160 }).withMessage('SEO description cannot exceed 160 characters'),
  
  body('readTime')
    .optional()
    .isInt({ min: 1 }).withMessage('Read time must be a positive integer'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
]; 