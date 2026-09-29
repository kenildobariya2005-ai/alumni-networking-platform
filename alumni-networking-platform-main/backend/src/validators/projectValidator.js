import { body, param, validationResult } from 'express-validator';

/**
 * Helper to process, normalize, and parse skills into an array of strings
 */
export const parseSkills = (skills) => {
  if (!skills) return [];
  let skillList = [];
  if (Array.isArray(skills)) {
    skillList = skills;
  } else if (typeof skills === 'string') {
    const trimmed = skills.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        skillList = JSON.parse(trimmed);
      } catch (err) {
        skillList = trimmed.split(',');
      }
    } else {
      skillList = trimmed.split(',');
    }
  }

  const seen = new Set();
  const result = [];
  for (const s of skillList) {
    if (typeof s === 'string') {
      const trimmed = s.trim();
      if (trimmed) {
        const lower = trimmed.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          result.push(trimmed);
        }
      }
    }
  }
  return result;
};

export const ALLOWED_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'AI/ML',
  'Data Science',
  'Cybersecurity',
  'Cloud',
  'IoT',
  'Other',
];

export const ALLOWED_STATUSES = [
  'recruiting',
  'in-progress',
  'completed',
  'cancelled',
];

/**
 * Validation rules and handler for creating a Project
 */
export const createProjectValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Project title must be between 3 and 150 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ min: 10, max: 3000 })
    .withMessage('Project description must be between 10 and 3000 characters'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Project category is required')
    .isIn(ALLOWED_CATEGORIES)
    .withMessage(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`),

  body('requiredSkills')
    .customSanitizer((value) => parseSkills(value))
    .custom((skills) => {
      if (!Array.isArray(skills) || skills.length === 0) {
        throw new Error('At least one required skill must be provided');
      }
      return true;
    }),

  body('maxTeamSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Maximum team size must be an integer between 1 and 100'),

  body('deadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Deadline must be a valid ISO 8601 date')
    .custom((value) => {
      if (value && new Date(value) < new Date()) {
        throw new Error('Project deadline must be a future date');
      }
      return true;
    }),

  body('repositoryUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Repository URL must be a valid URL (http/https)'),

  body('demoUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Demo URL must be a valid URL (http/https)'),

  // Validation response handler
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
 * Validation rules and handler for updating a Project
 */
export const updateProjectValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project title cannot be empty')
    .isLength({ min: 3, max: 150 })
    .withMessage('Project title must be between 3 and 150 characters'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project description cannot be empty')
    .isLength({ min: 10, max: 3000 })
    .withMessage('Project description must be between 10 and 3000 characters'),

  body('category')
    .optional()
    .trim()
    .isIn(ALLOWED_CATEGORIES)
    .withMessage(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`),

  body('requiredSkills')
    .optional()
    .customSanitizer((value) => parseSkills(value))
    .custom((skills) => {
      if (!Array.isArray(skills) || skills.length === 0) {
        throw new Error('Required skills list cannot be empty');
      }
      return true;
    }),

  body('maxTeamSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Maximum team size must be an integer between 1 and 100'),

  body('status')
    .optional()
    .trim()
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),

  body('deadline')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Deadline must be a valid ISO 8601 date'),

  body('repositoryUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Repository URL must be a valid URL (http/https)'),

  body('demoUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Demo URL must be a valid URL (http/https)'),

  // Prevent modifying immutable fields directly
  body(['createdBy', 'createdAt', 'updatedAt', 'teamMembers', 'isDeleted']).custom((value, { path }) => {
    if (value !== undefined) {
      throw new Error(`Changing '${path}' is not permitted in project update`);
    }
    return true;
  }),

  // Validation response handler
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
 * Validation rules and handler for updating Project Status
 */
export const updateProjectStatusValidator = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Project status is required')
    .isIn(ALLOWED_STATUSES)
    .withMessage(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`),

  // Validation response handler
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
