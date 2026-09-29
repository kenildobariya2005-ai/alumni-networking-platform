import { body, validationResult } from 'express-validator';
import { parseSkills } from './projectValidator.js';

/**
 * Validation rules and handler for applying to a project
 */
export const applyProjectValidator = [
  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Application message cannot exceed 1000 characters'),

  body('skills')
    .optional()
    .customSanitizer((value) => parseSkills(value))
    .custom((skills) => {
      if (!Array.isArray(skills)) {
        throw new Error('Skills must be an array or comma-separated string');
      }
      return true;
    }),

  // Validation response handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
      });
    }
    next();
  },
];
