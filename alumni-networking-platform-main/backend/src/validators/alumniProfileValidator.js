import { body, validationResult } from 'express-validator';

/**
 * Validation rules for creating an Alumni Profile
 */
export const createAlumniProfileValidator = [
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  
  body('designation')
    .trim()
    .notEmpty()
    .withMessage('Designation is required'),
  
  body('experienceYears')
    .notEmpty()
    .withMessage('Years of experience is required')
    .isInt({ min: 0 })
    .withMessage('Experience must be a positive integer'),
  
  body('linkedin')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid LinkedIn URL'),
  
  body('skills')
    .optional()
    .custom((value) => {
      if (typeof value === 'string' || Array.isArray(value)) {
        return true;
      }
      throw new Error('Skills must be a string or an array of strings');
    }),

  // Response handler
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

/**
 * Validation rules for updating an Alumni Profile
 */
export const updateAlumniProfileValidator = [
  body('company')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty'),
  
  body('designation')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Designation cannot be empty'),
  
  body('experienceYears')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Experience must be a positive integer'),
  
  body('linkedin')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid LinkedIn URL'),
  
  body('skills')
    .optional()
    .custom((value) => {
      if (typeof value === 'string' || Array.isArray(value)) {
        return true;
      }
      throw new Error('Skills must be a string or an array of strings');
    }),

  // Response handler
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
