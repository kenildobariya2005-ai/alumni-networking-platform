import express from 'express';
import {
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import {
  getNotificationsValidator,
  notificationIdValidator,
} from '../validators/notificationValidator.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply JWT authentication middleware to all notification endpoints
router.use(protect);

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for authenticated user
 * @access  Private
 */
router.get('/', getNotificationsValidator, getNotifications);

/**
 * @route   GET /api/notifications/unread
 * @desc    Get unread notifications for authenticated user
 * @access  Private
 */
router.get('/unread', getUnreadNotifications);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/read-all', markAllNotificationsAsRead);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark single notification as read
 * @access  Private
 */
router.patch('/:id/read', notificationIdValidator, markNotificationAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', notificationIdValidator, deleteNotification);

export default router;
