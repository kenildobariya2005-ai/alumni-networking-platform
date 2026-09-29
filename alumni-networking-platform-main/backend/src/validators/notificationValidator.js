import { param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

/**
 * Handle express-validator validation results
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
      message: 'Validation failed',
      errors: errorMessages,
    });
  }
  next();
};

/**
 * Validation rules for notification ID parameter
 */
export const notificationIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid notification ID format');
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * Validation rules for querying notifications list
 */
export const getNotificationsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean value (true or false)'),
  handleValidationErrors,
];
