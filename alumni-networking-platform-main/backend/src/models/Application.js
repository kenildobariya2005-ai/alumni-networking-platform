import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume URL is required'],
      trim: true,
    },
    coverLetter: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Reviewing', 'Shortlisted', 'Accepted', 'Rejected'],
      default: 'Applied',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a student can only apply once to a specific job
ApplicationSchema.index({ student: 1, job: 1 }, { unique: true });
ApplicationSchema.index({ job: 1 });
ApplicationSchema.index({ status: 1 });

const Application = mongoose.model('Application', ApplicationSchema);

export default Application;
