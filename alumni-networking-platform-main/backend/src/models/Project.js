import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [150, 'Project title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [3000, 'Project description cannot exceed 3000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project creator reference is required'],
    },
    requiredSkills: {
      type: [String],
      required: [true, 'At least one required skill is needed'],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Project category is required'],
      enum: {
        values: [
          'Web Development',
          'Mobile Development',
          'AI/ML',
          'Data Science',
          'Cybersecurity',
          'Cloud',
          'IoT',
          'Other',
        ],
        message: '{VALUE} is not a valid project category',
      },
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxTeamSize: {
      type: Number,
      default: 5,
      min: [1, 'Maximum team size must be at least 1'],
    },
    status: {
      type: String,
      enum: {
        values: ['recruiting', 'in-progress', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid project status',
      },
      default: 'recruiting',
    },
    deadline: {
      type: Date,
    },
    repositoryUrl: {
      type: String,
      trim: true,
      default: '',
    },
    demoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for applications list
ProjectSchema.virtual('applications', {
  ref: 'ProjectApplication',
  localField: '_id',
  foreignField: 'project',
});

// Indexes for high performance searches and filtering
ProjectSchema.index({ createdBy: 1 });
ProjectSchema.index({ requiredSkills: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ isDeleted: 1, status: 1, createdAt: -1 });
ProjectSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });

const Project = mongoose.model('Project', ProjectSchema);

export default Project;
