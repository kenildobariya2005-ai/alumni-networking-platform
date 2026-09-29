import { body, validationResult } from 'express-validator';

/**
 * Validation rules and handler for creating a new job posting
 */
export const createJobValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Job title must be between 2 and 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 10 })
    .withMessage('Job description must be at least 10 characters long'),

  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Job location is required'),

  body('jobType')
    .customSanitizer((value, { req }) => value || req.body.employmentType)
    .notEmpty()
    .withMessage('Job type / employment type is required')
    .isIn(['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'])
    .withMessage('Job type must be one of: Full-time, Part-time, Internship, Contract, Freelance'),

  body('deadline')
    .notEmpty()
    .withMessage('Application deadline is required')
    .isISO8601()
    .withMessage('Application deadline must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Application deadline must be a future date');
      }
      return true;
    }),

  body('salaryRange')
    .optional()
    .trim(),

  body('requiredSkills')
    .optional(),

  // Validation response middleware
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
 * Validation rules and handler for updating an existing job posting
 */
export const updateJobValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Job title cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Job title must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Job description cannot be empty')
    .isLength({ min: 10 })
    .withMessage('Job description must be at least 10 characters long'),

  body('company')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty'),

  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Job location cannot be empty'),

  body('jobType')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'])
    .withMessage('Job type must be one of: Full-time, Part-time, Internship, Contract, Freelance'),

  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Application deadline must be a valid date'),

  body('status')
    .optional()
    .isIn(['Open', 'Closed'])
    .withMessage('Status must be either Open or Closed'),

  // Validation response middleware
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
