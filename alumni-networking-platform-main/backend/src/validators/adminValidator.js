import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
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
};

/**
 * Validates ObjectId parameter
 */
export const objectIdParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('ID parameter is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid ID format');
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * Validates user status update body
 */
export const updateUserStatusValidator = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid User ID format');
      }
      return true;
    }),
  body('isActive')
    .notEmpty()
    .withMessage('isActive status is required')
    .isBoolean()
    .withMessage('isActive must be a boolean value (true or false)'),
  handleValidationErrors,
];

/**
 * Validates project status update body
 */
export const updateProjectStatusValidator = [
  param('id')
    .notEmpty()
    .withMessage('Project ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Project ID format');
      }
      return true;
    }),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['recruiting', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid project status value'),
  handleValidationErrors,
];

/**
 * Validates list pagination and filter query params
 */
export const adminListQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  handleValidationErrors,
];

/**
 * Validates admin jobs list query params
 */
export const adminJobsQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  query('status')
    .optional({ checkFalsy: true })
    .isIn(['Open', 'Closed', 'all'])
    .withMessage('Status must be one of: Open, Closed, all'),
  query('jobType')
    .optional({ checkFalsy: true })
    .isIn(['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'all'])
    .withMessage('Job type must be one of: Full-time, Part-time, Internship, Contract, Freelance, all'),
  query('company')
    .optional()
    .trim(),
  query('search')
    .optional()
    .trim(),
  query('sort')
    .optional({ checkFalsy: true })
    .isIn(['newest', 'oldest', 'deadline'])
    .withMessage('Sort must be one of: newest, oldest, deadline'),
  handleValidationErrors,
];

/**
 * Validates admin projects list query params
 */
export const adminProjectsQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  query('status')
    .optional({ checkFalsy: true })
    .isIn(['recruiting', 'in-progress', 'completed', 'cancelled', 'all'])
    .withMessage('Status must be one of: recruiting, in-progress, completed, cancelled, all'),
  query('category')
    .optional({ checkFalsy: true })
    .isIn([
      'Web Development',
      'Mobile Development',
      'AI/ML',
      'Data Science',
      'Cybersecurity',
      'Cloud',
      'IoT',
      'Other',
      'all',
    ])
    .withMessage('Category must be a valid project category or all'),
  query('search')
    .optional()
    .trim(),
  query('includeDeleted')
    .optional({ checkFalsy: true })
    .isIn(['true', 'false'])
    .withMessage('includeDeleted must be true or false'),
  query('sort')
    .optional({ checkFalsy: true })
    .isIn(['newest', 'oldest'])
    .withMessage('Sort must be one of: newest, oldest'),
  handleValidationErrors,
];

