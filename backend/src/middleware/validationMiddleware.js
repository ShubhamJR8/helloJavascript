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
  body('answers.*.selectedOption').optional().isString(),
  body('answers.*.submittedCode').optional().isString(),
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