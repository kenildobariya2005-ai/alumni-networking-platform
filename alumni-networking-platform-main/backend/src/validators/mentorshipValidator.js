import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

/**
 * Middleware to process validation errors and format response
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({
      success: false,
      message: errorMessages[0]?.message || 'Validation failed',
      errors: errorMessages,
    });
  }
  next();
};

/**
 * Validator for creating a new mentorship request
 */
export const createMentorshipRequestValidator = [
  body('mentorId')
    .custom((value, { req }) => {
      const mentor = value || req.body.mentor;
      if (!mentor) {
        throw new Error('Mentor ID is required');
      }
      if (!mongoose.Types.ObjectId.isValid(mentor)) {
        throw new Error('Invalid Mentor ID format');
      }
      return true;
    }),

  body('topic')
    .trim()
    .notEmpty()
    .withMessage('Mentorship topic is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Topic must be between 3 and 150 characters'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Mentorship message is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Message must be between 5 and 1000 characters'),

  body('preferredDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Preferred date must be a valid ISO8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Preferred date must be a future date');
      }
      return true;
    }),

  handleValidationErrors,
];

/**
 * Validator for scheduling a mentorship session
 */
export const scheduleMentorshipValidator = [
  body('scheduledAt')
    .notEmpty()
    .withMessage('scheduledAt date and time is required')
    .isISO8601()
    .withMessage('scheduledAt must be a valid ISO8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Scheduled session date must be in the future');
      }
      return true;
    }),

  body('meetingLink')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Meeting link cannot exceed 500 characters'),

  handleValidationErrors,
];

/**
 * Validator for submitting mentorship feedback and rating
 */
export const submitFeedbackValidator = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),

  body('feedback')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters'),

  handleValidationErrors,
];

/**
 * Validator for route params with :id
 */
export const mentorshipIdParamValidator = [
  param('id')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid Mentorship Request ID format');
      }
      return true;
    }),

  handleValidationErrors,
];
