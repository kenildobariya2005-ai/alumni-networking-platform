import AlumniProfile from '../models/AlumniProfile.js';
import User from '../models/User.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';
import mongoose from 'mongoose';

/**
 * Helper to parse comma separated string or array to clean array
 */
const parseToArray = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(item => item.trim());
  if (typeof input === 'string') {
    return input.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
};

/**
 * @desc    Create alumni profile
 * @route   POST /api/alumni/profile
 * @access  Private (Alumni only)
 */
export const createAlumniProfile = async (req, res, next) => {
  try {
    // Check if the user is an alumni
    if (req.user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only alumni can create an alumni profile.',
      });
    }

    // Check if profile already exists
    const profileExists = await AlumniProfile.findOne({ user: req.user._id });
    if (profileExists) {
      return res.status(400).json({
        success: false,
        message: 'Profile already exists. Use PUT /api/alumni/profile to update.',
      });
    }

    const {
      company,
      designation,
      experienceYears,
      location,
      bio,
      skills,
      linkedin,
      mentorAvailable,
    } = req.body;

    // Upload Profile Picture to Cloudinary if provided
    if (req.files && req.files.profilePicture && req.files.profilePicture[0]) {
      const uploadResult = await uploadBufferToCloudinary(
        req.files.profilePicture[0].buffer,
        'alumni_connect/avatars',
        'image'
      );
      // Update User profile picture
      await User.findByIdAndUpdate(req.user._id, {
        profilePicture: uploadResult.secure_url,
      });
    }

    const newProfile = await AlumniProfile.create({
      user: req.user._id,
      company,
      designation,
      experienceYears,
      location: location || '',
      bio: bio || '',
      skills: parseToArray(skills),
      linkedin: linkedin || '',
      mentorAvailable: mentorAvailable === 'true' || mentorAvailable === true,
      profileCompleted: true,
    });

    const populatedProfile = await AlumniProfile.findById(newProfile._id).populate(
      'user',
      'fullName email role profilePicture'
    );

    return res.status(201).json({
      success: true,
      message: 'Alumni profile created successfully',
      profile: populatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current alumni's own profile
 * @route   GET /api/alumni/profile
 * @access  Private (Alumni/Admin)
 */
export const getMyAlumniProfile = async (req, res, next) => {
  try {
    const profile = await AlumniProfile.findOne({ user: req.user._id }).populate(
      'user',
      'fullName email role profilePicture'
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Alumni profile not found. Please create one.',
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update alumni profile
 * @route   PUT /api/alumni/profile
 * @access  Private (Alumni only)
 */
export const updateAlumniProfile = async (req, res, next) => {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only alumni can edit alumni profiles.',
      });
    }

    let profile = await AlumniProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Alumni profile not found. Please create a profile first.',
      });
    }

    const {
      company,
      designation,
      experienceYears,
      location,
      bio,
      skills,
      linkedin,
      mentorAvailable,
    } = req.body;

    // Update text fields if sent
    if (company) profile.company = company;
    if (designation) profile.designation = designation;
    if (experienceYears !== undefined) profile.experienceYears = experienceYears;
    if (location !== undefined) profile.location = location;
    if (bio !== undefined) profile.bio = bio;
    if (linkedin !== undefined) profile.linkedin = linkedin;
    if (mentorAvailable !== undefined) {
      profile.mentorAvailable = mentorAvailable === 'true' || mentorAvailable === true;
    }

    if (skills !== undefined) {
      profile.skills = parseToArray(skills);
    }

    // Process new Profile Picture upload if sent
    if (req.files && req.files.profilePicture && req.files.profilePicture[0]) {
      const uploadResult = await uploadBufferToCloudinary(
        req.files.profilePicture[0].buffer,
        'alumni_connect/avatars',
        'image'
      );
      await User.findByIdAndUpdate(req.user._id, {
        profilePicture: uploadResult.secure_url,
      });
    }

    profile.profileCompleted = true;
    await profile.save();

    const populatedProfile = await AlumniProfile.findById(profile._id).populate(
      'user',
      'fullName email role profilePicture'
    );

    return res.status(200).json({
      success: true,
      message: 'Alumni profile updated successfully',
      profile: populatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get alumni profile by profile ID or user ID
 * @route   GET /api/alumni/:id
 * @access  Private (Authenticated)
 */
export const getAlumniById = async (req, res, next) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format provided.',
    });
  }

  try {
    // 1. Try to find by profile ID
    let profile = await AlumniProfile.findById(id).populate(
      'user',
      'fullName email role profilePicture'
    );

    // 2. If not found, try to find by User ID
    if (!profile) {
      profile = await AlumniProfile.findOne({ user: id }).populate(
        'user',
        'fullName email role profilePicture'
      );
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Alumni profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search and filter alumni profiles
 * @route   GET /api/alumni
 * @access  Private (Authenticated)
 */
export const searchAlumni = async (req, res, next) => {
  const { company, skills, location, mentorAvailable, page = 1, limit = 10 } = req.query;

  const query = {};

  // Case-insensitive regex matching for company, location
  if (company) {
    query.company = { $regex: company, $options: 'i' };
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Mentor filter
  if (mentorAvailable !== undefined) {
    query.mentorAvailable = mentorAvailable === 'true';
  }

  // Case-insensitive array skill matching
  if (skills) {
    const skillsArray = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills;
    query.skills = {
      $in: skillsArray.map((skill) => new RegExp(skill, 'i')),
    };
  }

  try {
    // Pagination calculation
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const profiles = await AlumniProfile.find(query)
      .populate('user', 'fullName email role profilePicture')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ experienceYears: -1 }); // Order by experience primarily

    const total = await AlumniProfile.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: profiles.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      profiles,
    });
  } catch (error) {
    next(error);
  }
};
