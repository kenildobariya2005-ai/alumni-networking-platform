import mongoose from 'mongoose';

const AlumniProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: [true, 'Experience in years is required'],
      min: [0, 'Experience cannot be negative'],
    },
    location: {
      type: String,
      trim: true,
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
    linkedin: {
      type: String,
      default: '',
      trim: true,
    },
    mentorAvailable: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching and admin filtering
AlumniProfileSchema.index({ company: 1 });
AlumniProfileSchema.index({ skills: 1 });
AlumniProfileSchema.index({ location: 1 });
AlumniProfileSchema.index({ mentorAvailable: 1 });
AlumniProfileSchema.index({ isVerified: 1 });

const AlumniProfile = mongoose.model('AlumniProfile', AlumniProfileSchema);

export default AlumniProfile;
