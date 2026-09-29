import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { SAFE_USER_FIELDS } from '../socket/socketServer.js';

/**
 * @desc    Get all notifications for authenticated user with pagination and optional isRead filter
 * @route   GET /api/notifications
 * @access  Private (Authenticated users)
 */
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isRead, type } = req.query;
    const currentUserId = req.user._id;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Filter by recipient
    const query = {
      recipient: currentUserId,
    };

    // Filter by isRead status if specified
    if (isRead !== undefined && isRead !== '') {
      query.isRead = isRead === 'true' || isRead === true;
    }

    // Filter by type if specified
    if (type) {
      query.type = type;
    }

    const [notifications, totalNotifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('sender', SAFE_USER_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: currentUserId, isRead: false }),
    ]);

    const totalPages = Math.ceil(totalNotifications / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: 'Notifications fetched successfully',
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalNotifications,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get unread notifications for authenticated user
 * @route   GET /api/notifications/unread
 * @access  Private (Authenticated users)
 */
export const getUnreadNotifications = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const notifications = await Notification.find({
      recipient: currentUserId,
      isRead: false,
    })
      .populate('sender', SAFE_USER_FIELDS)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Unread notifications fetched successfully',
      data: {
        notifications,
        unreadCount: notifications.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private (Recipient only)
 */
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format',
      });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Security check: Only the recipient can mark their notification as read
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to mark this notification as read',
      });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    await notification.populate('sender', SAFE_USER_FIELDS);

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read for the authenticated user
 * @route   PATCH /api/notifications/read-all
 * @access  Private (Authenticated users)
 */
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const readTimestamp = new Date();

    const result = await Notification.updateMany(
      {
        recipient: currentUserId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: readTimestamp,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private (Recipient only)
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID format',
      });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Security check: Only the recipient can delete their notification
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this notification',
      });
    }

    await Notification.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
      data: {
        notificationId: id,
      },
    });
  } catch (error) {
    next(error);
  }
};
