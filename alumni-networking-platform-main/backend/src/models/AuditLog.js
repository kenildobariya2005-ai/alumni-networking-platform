import mongoose from 'mongoose';

/**
 * AuditLog Schema for tracking administrative and moderation actions
 */
const AuditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin user reference is required'],
    },
    action: {
      type: String,
      required: [true, 'Action identifier is required'],
      trim: true,
    },
    targetType: {
      type: String,
      required: [true, 'Target entity type is required'],
      enum: [
        'User',
        'StudentProfile',
        'AlumniProfile',
        'Job',
        'Application',
        'Project',
        'ProjectApplication',
        'Post',
        'Comment',
        'MentorshipRequest',
        'System',
      ],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target ID is required'],
    },
    description: {
      type: String,
      required: [true, 'Action description is required'],
      trim: true,
    },
    ipAddress: {
      type: String,
      default: '',
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// High performance audit querying indexes
AuditLogSchema.index({ admin: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ targetType: 1, targetId: 1 });
AuditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

export default AuditLog;
