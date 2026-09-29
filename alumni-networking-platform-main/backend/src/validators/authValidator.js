import { body, validationResult } from 'express-validator';

/**
 * Validation rules and handler for User Registration
 * Note: Admin accounts cannot be created via public registration.
 */
export const registerValidator = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .optional()
    .trim()
    .isIn(['student', 'alumni'])
    .withMessage('Role must be one of: student, alumni (Admin role cannot be self-assigned)'),

  // Validation response handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }
    next();
  }
];

/**
 * Validation rules and handler for User Login
 */
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  body('expectedRole')
    .optional()
    .trim()
    .isIn(['student', 'alumni', 'admin'])
    .withMessage('Invalid expected login role specified'),

  body('role')
    .optional()
    .trim()
    .isIn(['student', 'alumni', 'admin'])
    .withMessage('Invalid login role specified'),

  // Validation response handler
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }
    next();
  }
];
