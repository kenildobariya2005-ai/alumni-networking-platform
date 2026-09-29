import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import {
  emitToUser,
  emitNotificationToUser,
  isUserOnline,
  SAFE_USER_FIELDS,
} from '../socket/socketServer.js';

/**
 * @desc    Send a message to another user (REST fallback)
 * @route   POST /api/messages
 * @access  Private (Authenticated users)
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;
    const currentUserId = req.user._id.toString();

    // 1. Validate receiver ID format
    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receiver ID format',
      });
    }

    const receiverIdStr = receiverId.toString();

    // 2. Prevent messaging self
    if (receiverIdStr === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a message to yourself',
      });
    }

    // 3. Validate message body
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required',
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 2000 characters',
      });
    }

    // 4. Verify receiver exists and is active
    const receiverUser = await User.findById(receiverIdStr).select(SAFE_USER_FIELDS + ' isActive');
    if (!receiverUser || !receiverUser.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found or user account is inactive',
      });
    }

    // 5. Create Message in Database
    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverIdStr,
      message: trimmedMessage,
      isRead: false,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', SAFE_USER_FIELDS)
      .populate('receiver', SAFE_USER_FIELDS)
      .lean();

    // 6. Create Database Notification for receiver
    const snippet = trimmedMessage.length > 50 ? `${trimmedMessage.substring(0, 50)}...` : trimmedMessage;
    const notification = await Notification.create({
      recipient: receiverIdStr,
      sender: req.user._id,
      title: 'New Message',
      message: `${req.user.fullName}: ${snippet}`,
      type: 'message',
      relatedId: newMessage._id,
      relatedModel: 'Message',
      isRead: false,
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', SAFE_USER_FIELDS)
      .lean();

    // 7. Emit real-time Socket.io events if receiver is online
    const receiverOnline = isUserOnline(receiverIdStr);
    if (receiverOnline) {
      emitToUser(receiverIdStr, 'message:receive', populatedMessage);
      emitNotificationToUser(receiverIdStr, populatedNotification);
      emitToUser(currentUserId, 'message:delivered', {
        messageId: newMessage._id,
        receiverId: receiverIdStr,
        deliveredAt: new Date(),
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: populatedMessage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get conversation history with a specific user (Sorted oldest to newest)
 * @route   GET /api/messages/conversation/:userId
 * @access  Private (Authenticated users)
 */
export const getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50, sort = 'asc' } = req.query;
    const currentUserId = req.user._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    // Verify other user exists
    const participant = await User.findById(userId).select(SAFE_USER_FIELDS + ' isActive');
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Conversation partner not found',
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Filter messages between current user and target user (excluding soft-deleted by sender)
    const query = {
      $or: [
        {
          sender: currentUserId,
          receiver: userId,
          isDeletedBySender: { $ne: true },
        },
        {
          sender: userId,
          receiver: currentUserId,
        },
      ],
    };

    const sortOption = sort === 'desc' ? { createdAt: -1 } : { createdAt: 1 };

    const [messages, totalMessages] = await Promise.all([
      Message.find(query)
        .populate('sender', SAFE_USER_FIELDS)
        .populate('receiver', SAFE_USER_FIELDS)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Message.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalMessages / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: 'Conversation fetched successfully',
      data: {
        messages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalMessages,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
        participant: {
          _id: participant._id,
          fullName: participant.fullName,
          profilePicture: participant.profilePicture || '',
          role: participant.role,
          isOnline: isUserOnline(participant._id.toString()),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all distinct conversations for authenticated user with last message & unread count
 * @route   GET /api/messages/conversations
 * @access  Private (Authenticated users)
 */
export const getMyConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    // Aggregate to find unique conversation partners, latest message, and unread counts
    const conversations = await Message.aggregate([
      // 1. Match only messages where user is sender (and not deleted) or receiver
      {
        $match: {
          $or: [
            { sender: currentUserId, isDeletedBySender: { $ne: true } },
            { receiver: currentUserId },
          ],
        },
      },
      // 2. Identify partner ID for grouping
      {
        $addFields: {
          partnerId: {
            $cond: [{ $eq: ['$sender', currentUserId] }, '$receiver', '$sender'],
          },
        },
      },
      // 3. Sort newest messages first before grouping
      {
        $sort: { createdAt: -1 },
      },
      // 4. Group by partnerId
      {
        $group: {
          _id: '$partnerId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', currentUserId] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      // 5. Lookup partner details from users collection
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'partner',
        },
      },
      {
        $unwind: '$partner',
      },
      // 6. Project clean safe fields
      {
        $project: {
          _id: 1,
          unreadCount: 1,
          lastMessage: {
            _id: '$lastMessage._id',
            sender: '$lastMessage.sender',
            receiver: '$lastMessage.receiver',
            message: '$lastMessage.message',
            isRead: '$lastMessage.isRead',
            createdAt: '$lastMessage.createdAt',
          },
          partner: {
            _id: '$partner._id',
            fullName: '$partner.fullName',
            profilePicture: { $ifNull: ['$partner.profilePicture', ''] },
            role: '$partner.role',
          },
        },
      },
      // 7. Sort conversations by latest message timestamp
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    // Attach real-time online status to each partner
    const conversationsWithOnlineStatus = conversations.map((conv) => ({
      ...conv,
      partner: {
        ...conv.partner,
        isOnline: isUserOnline(conv.partner._id.toString()),
      },
    }));

    return res.status(200).json({
      success: true,
      message: 'Conversations fetched successfully',
      data: {
        conversations: conversationsWithOnlineStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a specific message as read
 * @route   PATCH /api/messages/:id/read
 * @access  Private (Receiver only)
 */
export const markMessageAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID format',
      });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Security check: Only the recipient can mark a message as read
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are only authorized to mark messages sent to you as read',
      });
    }

    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();

      // Real-time socket notification to message sender
      emitToUser(message.sender.toString(), 'message:read', {
        messageId: message._id,
        readerId: req.user._id.toString(),
        readAt: message.readAt,
      });
    }

    await message.populate('sender', SAFE_USER_FIELDS);
    await message.populate('receiver', SAFE_USER_FIELDS);

    return res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: {
        message,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all messages in a conversation as read
 * @route   PATCH /api/messages/conversation/:userId/read
 * @access  Private (Receiver only)
 */
export const markConversationAsRead = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id.toString();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    const readTimestamp = new Date();
    const result = await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: readTimestamp,
      }
    );

    if (result.modifiedCount > 0) {
      // Notify the other user in real-time
      emitToUser(userId, 'conversation:read', {
        readerId: currentUserId,
        modifiedCount: result.modifiedCount,
        readAt: readTimestamp,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation marked as read',
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete own message (Soft deletion by sender)
 * @route   DELETE /api/messages/:id
 * @access  Private (Sender only)
 */
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message ID format',
      });
    }

    const message = await Message.findById(id);
    if (!message || message.isDeletedBySender) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or already deleted',
      });
    }

    // Security check: Only the sender can delete their own message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are only authorized to delete your own messages',
      });
    }

    // Perform soft deletion
    message.isDeletedBySender = true;
    message.deletedAt = new Date();
    await message.save();

    // Notify receiver in real-time if online
    emitToUser(message.receiver.toString(), 'message:deleted', {
      messageId: message._id,
      senderId: req.user._id.toString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: {
        messageId: id,
      },
    });
  } catch (error) {
    next(error);
  }
};
