import { body, validationResult } from 'express-validator';

/**
 * Validation rules for creating a Student Profile
 */
export const createStudentProfileValidator = [
  body('enrollmentNumber')
    .trim()
    .notEmpty()
    .withMessage('Enrollment number is required'),
  
  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required'),
  
  body('semester')
    .notEmpty()
    .withMessage('Semester is required')
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be an integer between 1 and 8'),
  
  body('graduationYear')
    .notEmpty()
    .withMessage('Graduation year is required')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Please provide a valid graduation year'),
  
  body('skills')
    .optional()
    .custom((value) => {
      // If skills are sent as string (comma-separated), it is fine.
      // If array, it is also fine.
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
 * Validation rules for updating a Student Profile
 */
export const updateStudentProfileValidator = [
  body('enrollmentNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Enrollment number cannot be empty'),
  
  body('branch')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Branch cannot be empty'),
  
  body('semester')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be an integer between 1 and 8'),
  
  body('graduationYear')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Please provide a valid graduation year'),
  
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
