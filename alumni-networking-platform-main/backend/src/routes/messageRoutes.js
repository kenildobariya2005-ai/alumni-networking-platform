import express from 'express';
import {
  sendMessage,
  getConversation,
  getMyConversations,
  markMessageAsRead,
  markConversationAsRead,
  deleteMessage,
} from '../controllers/messageController.js';
import {
  sendMessageValidator,
  getConversationValidator,
  messageIdValidator,
  userIdParamValidator,
} from '../validators/messageValidator.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply JWT authentication middleware to all message endpoints
router.use(protect);

/**
 * @route   POST /api/messages
 * @desc    Send message through REST fallback
 * @access  Private
 */
router.post('/', sendMessageValidator, sendMessage);

/**
 * @route   GET /api/messages/conversations
 * @desc    Get current user's recent conversations list with unread count
 * @access  Private
 */
router.get('/conversations', getMyConversations);

/**
 * @route   GET /api/messages/conversation/:userId
 * @desc    Get conversation history with another user (oldest to newest)
 * @access  Private
 */
router.get('/conversation/:userId', getConversationValidator, getConversation);

/**
 * @route   PATCH /api/messages/conversation/:userId/read
 * @desc    Mark all unread messages from a conversation partner as read
 * @access  Private
 */
router.patch('/conversation/:userId/read', userIdParamValidator, markConversationAsRead);

/**
 * @route   PATCH /api/messages/:id/read
 * @desc    Mark a single message as read
 * @access  Private
 */
router.patch('/:id/read', messageIdValidator, markMessageAsRead);

/**
 * @route   DELETE /api/messages/:id
 * @desc    Delete own message (soft delete)
 * @access  Private
 */
router.delete('/:id', messageIdValidator, deleteMessage);

export default router;
