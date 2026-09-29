import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'],
      required: [true, 'Job type is required'],
    },
    salaryRange: {
      type: String,
      trim: true,
      default: '',
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Posted by reference is required'],
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching
JobSchema.index({ company: 1 });
JobSchema.index({ requiredSkills: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ postedBy: 1 });

const Job = mongoose.model('Job', JobSchema);

export default Job;
