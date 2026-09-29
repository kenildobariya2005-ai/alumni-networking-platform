import mongoose from 'mongoose';

/**
 * Notification Schema supporting multi-type notifications (messages, mentorship, jobs, projects, posts, comments, system)
 */
const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient reference is required'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'message',
        'mentorship',
        'job',
        'application',
        'project',
        'post',
        'comment',
        'system',
        'Social',
        'Mentorship',
        'Job',
        'Project',
        'System',
      ],
      required: [true, 'Notification type is required'],
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      refPath: 'relatedModel',
    },
    relatedModel: {
      type: String,
      enum: ['Message', 'MentorshipRequest', 'Job', 'Application', 'Project', 'ProjectApplication', 'Post', 'Comment', 'User', null],
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ sender: 1 });
NotificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
