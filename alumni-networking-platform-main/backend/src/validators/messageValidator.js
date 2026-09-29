import { body, param, query, validationResult } from 'express-validator';
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
 * Validation rules for sending a message via REST
 */
export const sendMessageValidator = [
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid receiver ID format');
      }
      return true;
    }),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message text is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  handleValidationErrors,
];

/**
 * Validation rules for retrieving a conversation
 */
export const getConversationValidator = [
  param('userId')
    .notEmpty()
    .withMessage('User ID parameter is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid user ID format');
      }
      return true;
    }),
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
 * Validation rules for message ID parameter
 */
export const messageIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Message ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid message ID format');
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * Validation rules for user ID parameter (mark conversation read)
 */
export const userIdParamValidator = [
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid user ID format');
      }
      return true;
    }),
  handleValidationErrors,
];
