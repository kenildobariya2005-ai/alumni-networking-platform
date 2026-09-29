import express from 'express';
import { chatWithAI } from '../controllers/aiController.js';
import { aiChatValidator } from '../validators/aiValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { aiRateLimiter } from '../middleware/aiRateLimiter.js';

const router = express.Router();

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AlumniConnect AI Career & Learning Assistant
 * @access  Private (Students only)
 */
router.post(
  '/chat',
  protect,
  authorizeRoles('student', 'alumni'),
  aiRateLimiter(),
  aiChatValidator,
  chatWithAI
);

export default router;
