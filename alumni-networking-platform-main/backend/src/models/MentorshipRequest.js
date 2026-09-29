import mongoose from 'mongoose';

const MentorshipRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor reference is required'],
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      maxlength: [150, 'Topic cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    preferredDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    meetingLink: {
      type: String,
      default: '',
      trim: true,
    },
    scheduledAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query optimization
MentorshipRequestSchema.index({ student: 1 });
MentorshipRequestSchema.index({ mentor: 1 });
MentorshipRequestSchema.index({ status: 1 });
MentorshipRequestSchema.index({ student: 1, mentor: 1, status: 1 });

const MentorshipRequest = mongoose.model('MentorshipRequest', MentorshipRequestSchema);

export default MentorshipRequest;
