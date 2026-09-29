import { body, validationResult } from 'express-validator';

/**
 * Validation rules and handler for applying to a job
 */
export const applyJobValidator = [
  body('coverLetter')
    .optional()
    .trim(),

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
 * Validation rules and handler for updating application status
 */
export const updateApplicationStatusValidator = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Applied', 'Reviewing', 'Shortlisted', 'Accepted', 'Rejected'])
    .withMessage(
      'Status must be one of: Applied, Reviewing, Shortlisted, Accepted, Rejected'
    ),

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
