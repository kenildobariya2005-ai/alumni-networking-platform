import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';

// Safe user projection for Socket payloads (never exposes passwords, tokens, or private credentials)
export const SAFE_USER_FIELDS = '_id fullName profilePicture role';

let io = null;

/**
 * In-memory map to track active user socket connections
 * Structure: Map<userId (String), Set<socketId (String)>>
 */
const onlineUsers = new Map();

/**
 * Helper to check if a specific user is currently online
 * @param {string} userId
 * @returns {boolean}
 */
export const isUserOnline = (userId) => {
  if (!userId) return false;
  const userSockets = onlineUsers.get(userId.toString());
  return !!(userSockets && userSockets.size > 0);
};

/**
 * Helper to get list of all online user IDs
 * @returns {string[]}
 */
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

/**
 * Helper to send real-time notification to a user if connected
 * @param {string} recipientId
 * @param {object} notificationData
 */
export const emitNotificationToUser = (recipientId, notificationData) => {
  if (!io || !recipientId) return;
  io.to(recipientId.toString()).emit('notification:new', notificationData);
};

/**
 * Helper to emit a custom event to a specific user's room
 * @param {string} userId
 * @param {string} event
 * @param {object} data
 */
export const emitToUser = (userId, event, data) => {
  if (!io || !userId) return;
  io.to(userId.toString()).emit(event, data);
};

/**
 * Get active Socket.io instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io server has not been initialized!');
  }
  return io;
};

/**
 * Initialize Socket.io Server with authentication, events, and room management
 * @param {object} httpServer HTTP Server instance created with http.createServer(app)
 */
export const initSocketServer = (httpServer) => {
  const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

  io = new Server(httpServer, {
    cors: {
      origin: [clientOrigin, 'http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ==========================================
  // SOCKET JWT AUTHENTICATION MIDDLEWARE
  // ==========================================
  io.use(async (socket, next) => {
    try {
      // 1. Extract token from auth payload, headers, or query string
      let token = null;

      if (socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      } else if (
        socket.handshake.headers &&
        socket.handshake.headers.authorization &&
        socket.handshake.headers.authorization.startsWith('Bearer ')
      ) {
        token = socket.handshake.headers.authorization.split(' ')[1];
      } else if (socket.handshake.query && socket.handshake.query.token) {
        token = socket.handshake.query.token;
      }

      if (!token) {
        return next(new Error('Authentication error: No JWT token provided in connection handshake'));
      }

      // 2. Verify JWT signature
      const jwtSecret = process.env.JWT_SECRET || 'default_local_dev_secret_key_12345';
      const decoded = jwt.verify(token, jwtSecret);

      if (!decoded || !decoded.id) {
        return next(new Error('Authentication error: Invalid or malformed token'));
      }

      // 3. Verify user in database
      const user = await User.findById(decoded.id).select(SAFE_USER_FIELDS + ' isActive email');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      if (!user.isActive) {
        return next(new Error('Authentication error: Account is deactivated'));
      }

      // 4. Attach verified user & userId to socket
      socket.userId = user._id.toString();
      socket.user = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture || '',
        role: user.role,
      };

      next();
    } catch (err) {
      console.error(`Socket authentication error: ${err.message}`);
      return next(new Error(`Authentication error: ${err.message}`));
    }
  });

  // ==========================================
  // CONNECTION & EVENT HANDLERS
  // ==========================================
  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] User connected: ${socket.user.fullName} (${userId}) on socket ID: ${socket.id}`);

    // Join the authenticated user's private room (room name = userId)
    socket.join(userId);

    // Track online user socket IDs
    const isFirstConnectionForUser = !onlineUsers.has(userId) || onlineUsers.get(userId).size === 0;

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast user:online event if this is their first active tab/device connection
    if (isFirstConnectionForUser) {
      socket.broadcast.emit('user:online', {
        userId,
        user: socket.user,
        timestamp: new Date(),
      });
    }

    // Send the currently connected user the list of all online user IDs
    socket.emit('user:online_list', {
      onlineUserIds: Array.from(onlineUsers.keys()),
    });

    // ----------------------------------------------------
    // EVENT: message:send
    // ----------------------------------------------------
    socket.on('message:send', async (payload, callback) => {
      try {
        const { receiverId, message } = payload || {};

        // 1. Validate receiverId
        if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
          const errPayload = { success: false, message: 'Invalid or missing receiver ID' };
          socket.emit('error', errPayload);
          if (typeof callback === 'function') callback(errPayload);
          return;
        }

        const receiverIdStr = receiverId.toString();

        // 2. Prevent sending message to self
        if (receiverIdStr === userId) {
          const errPayload = { success: false, message: 'Cannot send message to yourself' };
          socket.emit('error', errPayload);
          if (typeof callback === 'function') callback(errPayload);
          return;
        }

        // 3. Validate message content
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
          const errPayload = { success: false, message: 'Message content cannot be empty' };
          socket.emit('error', errPayload);
          if (typeof callback === 'function') callback(errPayload);
          return;
        }

        const trimmedMessage = message.trim();

        if (trimmedMessage.length > 2000) {
          const errPayload = { success: false, message: 'Message exceeds maximum length of 2000 characters' };
          socket.emit('error', errPayload);
          if (typeof callback === 'function') callback(errPayload);
          return;
        }

        // 4. Verify receiver exists in database and is active
        const receiverUser = await User.findById(receiverIdStr).select(SAFE_USER_FIELDS + ' isActive');
        if (!receiverUser || !receiverUser.isActive) {
          const errPayload = { success: false, message: 'Receiver user not found or account is inactive' };
          socket.emit('error', errPayload);
          if (typeof callback === 'function') callback(errPayload);
          return;
        }

        // 5. Save message to MongoDB
        const newMessage = await Message.create({
          sender: socket.userId,
          receiver: receiverIdStr,
          message: trimmedMessage,
          isRead: false,
        });

        // Populate sender & receiver with safe fields
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', SAFE_USER_FIELDS)
          .populate('receiver', SAFE_USER_FIELDS)
          .lean();

        // 6. Create database Notification for the receiver
        const messageSnippet = trimmedMessage.length > 50 ? `${trimmedMessage.substring(0, 50)}...` : trimmedMessage;
        const notification = await Notification.create({
          recipient: receiverIdStr,
          sender: socket.userId,
          title: 'New Message',
          message: `${socket.user.fullName}: ${messageSnippet}`,
          type: 'message',
          relatedId: newMessage._id,
          relatedModel: 'Message',
          isRead: false,
        });

        const populatedNotification = await Notification.findById(notification._id)
          .populate('sender', SAFE_USER_FIELDS)
          .lean();

        // 7. Real-time delivery to receiver if online
        const receiverIsOnline = isUserOnline(receiverIdStr);

        if (receiverIsOnline) {
          // Emit message:receive to the receiver's private room
          io.to(receiverIdStr).emit('message:receive', populatedMessage);

          // Emit notification:new to the receiver's private room
          io.to(receiverIdStr).emit('notification:new', populatedNotification);

          // Emit message:delivered confirmation to the sender
          socket.emit('message:delivered', {
            messageId: newMessage._id,
            receiverId: receiverIdStr,
            deliveredAt: new Date(),
          });
        }

        // 8. Return saved message confirmation to the sender
        socket.emit('message:sent', {
          success: true,
          data: populatedMessage,
        });

        if (typeof callback === 'function') {
          callback({
            success: true,
            message: 'Message sent successfully',
            data: populatedMessage,
          });
        }
      } catch (err) {
        console.error(`Error in message:send event: ${err.message}`);
        const errPayload = { success: false, message: 'Failed to send message', error: err.message };
        socket.emit('error', errPayload);
        if (typeof callback === 'function') callback(errPayload);
      }
    });

    // ----------------------------------------------------
    // EVENT: typing:start
    // ----------------------------------------------------
    socket.on('typing:start', (payload) => {
      try {
        const { receiverId } = payload || {};
        if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) return;

        const receiverIdStr = receiverId.toString();
        // Forward typing event directly to the intended recipient's room
        io.to(receiverIdStr).emit('typing:start', {
          senderId: socket.userId,
          user: socket.user,
        });
      } catch (err) {
        console.error(`Error in typing:start: ${err.message}`);
      }
    });

    // ----------------------------------------------------
    // EVENT: typing:stop
    // ----------------------------------------------------
    socket.on('typing:stop', (payload) => {
      try {
        const { receiverId } = payload || {};
        if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) return;

        const receiverIdStr = receiverId.toString();
        // Forward typing:stop directly to the intended recipient's room
        io.to(receiverIdStr).emit('typing:stop', {
          senderId: socket.userId,
        });
      } catch (err) {
        console.error(`Error in typing:stop: ${err.message}`);
      }
    });

    // ----------------------------------------------------
    // EVENT: message:read
    // ----------------------------------------------------
    socket.on('message:read', async (payload, callback) => {
      try {
        const { messageId, conversationWithUserId } = payload || {};

        // Case A: Read specific message by ID
        if (messageId && mongoose.Types.ObjectId.isValid(messageId)) {
          const message = await Message.findById(messageId);
          if (!message) {
            const errPayload = { success: false, message: 'Message not found' };
            socket.emit('error', errPayload);
            if (typeof callback === 'function') callback(errPayload);
            return;
          }

          // Verify that current socket user is indeed the recipient
          if (message.receiver.toString() !== socket.userId) {
            const errPayload = {
              success: false,
              message: 'Unauthorized: You can only mark messages sent to you as read',
            };
            socket.emit('error', errPayload);
            if (typeof callback === 'function') callback(errPayload);
            return;
          }

          if (!message.isRead) {
            message.isRead = true;
            message.readAt = new Date();
            await message.save();

            // Notify sender that their message was read
            const senderIdStr = message.sender.toString();
            io.to(senderIdStr).emit('message:read', {
              messageId: message._id,
              readerId: socket.userId,
              readAt: message.readAt,
            });
          }

          socket.emit('message:read_ack', { success: true, messageId: message._id });
          if (typeof callback === 'function') {
            callback({ success: true, messageId: message._id });
          }
          return;
        }

        // Case B: Read entire conversation with another user
        if (conversationWithUserId && mongoose.Types.ObjectId.isValid(conversationWithUserId)) {
          const senderIdStr = conversationWithUserId.toString();
          const readTimestamp = new Date();

          const updateResult = await Message.updateMany(
            {
              sender: senderIdStr,
              receiver: socket.userId,
              isRead: false,
            },
            {
              isRead: true,
              readAt: readTimestamp,
            }
          );

          if (updateResult.modifiedCount > 0) {
            // Notify other user that all their sent messages in this chat have been read
            io.to(senderIdStr).emit('conversation:read', {
              readerId: socket.userId,
              modifiedCount: updateResult.modifiedCount,
              readAt: readTimestamp,
            });
          }

          socket.emit('conversation:read_ack', {
            success: true,
            conversationWithUserId: senderIdStr,
            modifiedCount: updateResult.modifiedCount,
          });

          if (typeof callback === 'function') {
            callback({
              success: true,
              modifiedCount: updateResult.modifiedCount,
            });
          }
        }
      } catch (err) {
        console.error(`Error in message:read event: ${err.message}`);
        const errPayload = { success: false, message: 'Failed to mark message as read', error: err.message };
        socket.emit('error', errPayload);
        if (typeof callback === 'function') callback(errPayload);
      }
    });

    // ----------------------------------------------------
    // EVENT: disconnect
    // ----------------------------------------------------
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${socket.user.fullName} (${socket.id}) - Reason: ${reason}`);

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);

          // Broadcast user:offline event to all remaining clients
          socket.broadcast.emit('user:offline', {
            userId,
            timestamp: new Date(),
          });
        }
      }
    });
  });

  return io;
};

// Aliases for compatibility
export const initSocket = initSocketServer;
export default initSocketServer;
