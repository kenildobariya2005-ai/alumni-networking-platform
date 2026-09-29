import mongoose from 'mongoose';

const StudentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    enrollmentNumber: {
      type: String,
      required: [true, 'Enrollment number is required'],
      unique: true,
      trim: true,
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester cannot be less than 1'],
      max: [8, 'Semester cannot be greater than 8'],
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required'],
      min: [2000, 'Graduation year must be valid'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    resumeFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    github: {
      type: String,
      default: '',
      trim: true,
    },
    linkedin: {
      type: String,
      default: '',
      trim: true,
    },
    portfolio: {
      type: String,
      default: '',
      trim: true,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching
StudentProfileSchema.index({ branch: 1 });
StudentProfileSchema.index({ skills: 1 });
StudentProfileSchema.index({ graduationYear: -1 });

const StudentProfile = mongoose.model('StudentProfile', StudentProfileSchema);

export default StudentProfile;
