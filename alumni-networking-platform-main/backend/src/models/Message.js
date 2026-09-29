import mongoose from 'mongoose';

/**
 * Message Schema for real-time one-to-one messaging
 */
const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender reference is required'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver reference is required'],
    },
    message: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    isDeletedBySender: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound and single-field indexes for optimal conversation query performance
MessageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ receiver: 1 });
MessageSchema.index({ receiver: 1, isRead: 1 });
MessageSchema.index({ createdAt: 1 });
MessageSchema.index({ sender: 1, isDeletedBySender: 1 });

const Message = mongoose.model('Message', MessageSchema);

export default Message;
