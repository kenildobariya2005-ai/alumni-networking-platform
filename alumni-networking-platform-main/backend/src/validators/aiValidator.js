import { body, validationResult } from 'express-validator';

/**
 * Validation rules and handler for AI Chat endpoint
 */
export const aiChatValidator = [
  body('message')
    .exists({ checkFalsy: true })
    .withMessage('Please enter a question or message for the AI assistant')
    .isString()
    .withMessage('Message must be a string')
    .trim()
    .notEmpty()
    .withMessage('Message cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Message exceeds the maximum allowed length of 2000 characters'),

  body('history')
    .optional()
    .isArray()
    .withMessage('History must be an array of previous messages'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        message: firstError.msg || 'Validation failed',
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];

export default {
  aiChatValidator,
};
