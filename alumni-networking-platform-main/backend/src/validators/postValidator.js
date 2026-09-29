import { body, validationResult } from 'express-validator';

/**
 * Helper to process, normalize, and deduplicate tags
 * Converts array or comma-separated string to an array of lowercase unique tags
 */
export const sanitizeTags = (tags) => {
  if (!tags) return [];

  let tagList = [];
  if (Array.isArray(tags)) {
    tagList = tags;
  } else if (typeof tags === 'string') {
    const trimmed = tags.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        tagList = JSON.parse(trimmed);
      } catch (err) {
        tagList = trimmed.split(',');
      }
    } else {
      tagList = trimmed.split(',');
    }
  }

  // Normalize: string, trim, lowercase, remove empty, deduplicate
  const normalized = Array.from(
    new Set(
      tagList
        .map((tag) => (typeof tag === 'string' ? tag.trim().toLowerCase() : ''))
        .filter((tag) => tag.length > 0)
    )
  );

  return normalized;
};

/**
 * Validation rules and handler for creating a new Post
 */
export const createPostValidator = [
  // Content validation
  body('content')
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Post content cannot exceed 3000 characters'),

  // Image URL validation (optional, must be valid URL if provided)
  body('image')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Image must be a valid URL (http/https)'),

  // Visibility validation
  body('visibility')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(['public', 'institution', 'alumni', 'student', 'connections'])
    .withMessage('Visibility must be one of: public, institution, alumni, student, connections'),

  // Tags validation & normalization
  body('tags')
    .optional()
    .customSanitizer((value) => sanitizeTags(value))
    .custom((tags) => {
      if (!Array.isArray(tags)) {
        throw new Error('Tags must be an array or comma-separated string');
      }
      if (tags.length > 10) {
        throw new Error('Maximum 10 tags are allowed per post');
      }
      for (const tag of tags) {
        if (typeof tag !== 'string' || tag.length > 50) {
          throw new Error('Each tag must be a string with a maximum of 50 characters');
        }
      }
      return true;
    }),

  // Rule: At least content or image must be present
  body().custom((value, { req }) => {
    const content = req.body.content ? String(req.body.content).trim() : '';
    const image = req.body.image ? String(req.body.image).trim() : '';

    if (!content && !image) {
      throw new Error('At least post content or an image must be provided');
    }
    return true;
  }),

  // Response handler for validation errors
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
 * Validation rules and handler for updating an existing Post
 */
export const updatePostValidator = [
  // Content validation
  body('content')
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Post content cannot exceed 3000 characters'),

  // Image URL validation
  body('image')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Image must be a valid URL (http/https)'),

  // Visibility validation
  body('visibility')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(['public', 'institution', 'alumni', 'student', 'connections'])
    .withMessage('Visibility must be one of: public, institution, alumni, student, connections'),

  // Tags validation & normalization
  body('tags')
    .optional()
    .customSanitizer((value) => sanitizeTags(value))
    .custom((tags) => {
      if (!Array.isArray(tags)) {
        throw new Error('Tags must be an array or comma-separated string');
      }
      if (tags.length > 10) {
        throw new Error('Maximum 10 tags are allowed per post');
      }
      for (const tag of tags) {
        if (typeof tag !== 'string' || tag.length > 50) {
          throw new Error('Each tag must be a string with a maximum of 50 characters');
        }
      }
      return true;
    }),

  // Prevent changing immutable fields in update body
  body(['author', 'likes', 'likesCount', 'commentsCount', 'createdAt', 'status']).custom((value, { path }) => {
    if (value !== undefined) {
      throw new Error(`Changing '${path}' is not allowed`);
    }
    return true;
  }),

  // Response handler for validation errors
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
