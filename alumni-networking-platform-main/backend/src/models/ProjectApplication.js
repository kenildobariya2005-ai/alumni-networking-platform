import mongoose from 'mongoose';

const ProjectApplicationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Application message cannot exceed 1000 characters'],
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'withdrawn'],
        message: '{VALUE} is not a valid application status',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound and individual indexes for query optimization
ProjectApplicationSchema.index({ project: 1, student: 1 });
ProjectApplicationSchema.index({ student: 1, status: 1 });
ProjectApplicationSchema.index({ project: 1, status: 1 });
ProjectApplicationSchema.index({ createdAt: -1 });

const ProjectApplication = mongoose.model('ProjectApplication', ProjectApplicationSchema);

export default ProjectApplication;
