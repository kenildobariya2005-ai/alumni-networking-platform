import mongoose from 'mongoose';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import AlumniProfile from '../models/AlumniProfile.js';
import Notification from '../models/Notification.js';
import { logAdminAction } from '../utils/auditLogger.js';
import { emitNotificationToUser } from '../socket/socketServer.js';

/**
 * @desc    Get all users with advanced filtering, search, and pagination
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
export const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      isActive,
      isVerified,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const query = {};

    if (role && ['student', 'alumni', 'admin'].includes(role.toLowerCase())) {
      query.role = role.toLowerCase();
    }

    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true' || isActive === true;
    }

    if (isVerified !== undefined && isVerified !== '') {
      query.isVerified = isVerified === 'true' || isVerified === true;
    }

    // Advanced search across User, StudentProfile, and AlumniProfile
    if (search && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim(), 'i');

      // Search profile collections in parallel to identify matching user IDs
      const [matchingStudents, matchingAlumni] = await Promise.all([
        StudentProfile.find({
          $or: [{ branch: searchRegex }, { enrollmentNumber: searchRegex }, { skills: searchRegex }],
        })
          .select('user')
          .lean(),
        AlumniProfile.find({
          $or: [{ company: searchRegex }, { designation: searchRegex }, { skills: searchRegex }, { location: searchRegex }],
        })
          .select('user')
          .lean(),
      ]);

      const profileUserIds = [
        ...matchingStudents.map((s) => s.user),
        ...matchingAlumni.map((a) => a.user),
      ];

      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { role: searchRegex },
        { _id: { $in: profileUserIds } },
      ];
    }

    // Determine sort ordering
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'name_asc') {
      sortOption = { fullName: 1 };
    } else if (sort === 'name_desc') {
      sortOption = { fullName: -1 };
    }

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    // Attach profile references
    const userIds = users.map((u) => u._id);
    const [studentProfiles, alumniProfiles] = await Promise.all([
      StudentProfile.find({ user: { $in: userIds } }).lean(),
      AlumniProfile.find({ user: { $in: userIds } }).lean(),
    ]);

    const studentMap = new Map(studentProfiles.map((p) => [p.user.toString(), p]));
    const alumniMap = new Map(alumniProfiles.map((p) => [p.user.toString(), p]));

    const enrichedUsers = users.map((user) => {
      const uId = user._id.toString();
      return {
        ...user,
        profile: user.role === 'student' ? studentMap.get(uId) || null : alumniMap.get(uId) || null,
      };
    });

    const totalPages = Math.ceil(totalUsers / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        users: enrichedUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalUsers,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user details with full profile
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin only)
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    const user = await User.findById(id).select('-password').lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: id }).lean();
    } else if (user.role === 'alumni') {
      profile = await AlumniProfile.findOne({ user: id }).lean();
    }

    return res.status(200).json({
      success: true,
      message: 'User details fetched successfully',
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Activate or deactivate a user account
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin only)
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive status must be a boolean value (true or false)',
      });
    }

    // Security check: Prevent admin from deactivating their own account
    if (req.user._id.toString() === id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Forbidden: You cannot deactivate your own administrator account',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = isActive;
    await user.save();

    // Log admin action
    await logAdminAction({
      adminId: req.user._id,
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      targetType: 'User',
      targetId: user._id,
      description: `User account ${user.email} (${user.fullName}) was ${isActive ? 'activated' : 'deactivated'} by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
      metadata: { isActive, role: user.role },
    });

    return res.status(200).json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete/Deactivate a user account (Soft deletion)
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    // Security check: Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Forbidden: You cannot delete your own administrator account',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Soft delete by deactivating
    user.isActive = false;
    await user.save();

    // Log admin action
    await logAdminAction({
      adminId: req.user._id,
      action: 'USER_DELETED',
      targetType: 'User',
      targetId: user._id,
      description: `User account ${user.email} (${user.fullName}) was soft-deleted/deactivated by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    return res.status(200).json({
      success: true,
      message: 'User account soft-deleted/deactivated successfully',
      data: {
        userId: id,
        isActive: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify an alumni account
 * @route   PATCH /api/admin/alumni/:id/verify
 * @access  Private (Admin only)
 */
export const verifyAlumni = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alumni ID format',
      });
    }

    // Find by user ID or profile ID
    let user = await User.findById(id);
    if (!user) {
      const profile = await AlumniProfile.findById(id);
      if (profile) {
        user = await User.findById(profile.user);
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Alumni user not found',
      });
    }

    if (user.role !== 'alumni') {
      return res.status(400).json({
        success: false,
        message: 'Only accounts with role alumni can be verified',
      });
    }

    // Update User and AlumniProfile verification state
    user.isVerified = true;
    await user.save();

    await AlumniProfile.findOneAndUpdate({ user: user._id }, { isVerified: true });

    // Create system notification for alumni
    try {
      const notification = await Notification.create({
        recipient: user._id,
        title: 'Alumni Profile Verified',
        message: 'Your alumni profile has been verified by the administrator.',
        type: 'system',
        isRead: false,
      });

      emitNotificationToUser(user._id.toString(), notification);
    } catch (notifErr) {
      console.error(`Failed to send verification notification: ${notifErr.message}`);
    }

    // Log admin audit action
    await logAdminAction({
      adminId: req.user._id,
      action: 'USER_VERIFIED',
      targetType: 'AlumniProfile',
      targetId: user._id,
      description: `Alumni ${user.fullName} (${user.email}) was verified by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    return res.status(200).json({
      success: true,
      message: 'Alumni profile verified successfully',
      data: {
        userId: user._id,
        fullName: user.fullName,
        isVerified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove verification from an alumni account
 * @route   PATCH /api/admin/alumni/:id/unverify
 * @access  Private (Admin only)
 */
export const removeAlumniVerification = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alumni ID format',
      });
    }

    let user = await User.findById(id);
    if (!user) {
      const profile = await AlumniProfile.findById(id);
      if (profile) {
        user = await User.findById(profile.user);
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Alumni user not found',
      });
    }

    user.isVerified = false;
    await user.save();

    await AlumniProfile.findOneAndUpdate({ user: user._id }, { isVerified: false });

    // Create system notification for alumni
    try {
      const notification = await Notification.create({
        recipient: user._id,
        title: 'Alumni Verification Status Updated',
        message: 'Your alumni verification status has been updated by the administrator.',
        type: 'system',
        isRead: false,
      });

      emitNotificationToUser(user._id.toString(), notification);
    } catch (notifErr) {
      console.error(`Failed to send unverify notification: ${notifErr.message}`);
    }

    // Log admin audit action
    await logAdminAction({
      adminId: req.user._id,
      action: 'USER_UNVERIFIED',
      targetType: 'AlumniProfile',
      targetId: user._id,
      description: `Alumni verification for ${user.fullName} (${user.email}) was removed by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    return res.status(200).json({
      success: true,
      message: 'Alumni verification removed successfully',
      data: {
        userId: user._id,
        fullName: user.fullName,
        isVerified: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user distribution statistics
 * @route   GET /api/admin/users/stats
 * @access  Private (Admin only)
 */
export const getUserStatistics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalAlumni,
      verifiedAlumni,
      activeUsers,
      inactiveUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      User.countDocuments({ role: 'alumni', isVerified: true }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'User statistics fetched successfully',
      data: {
        totalUsers,
        totalStudents,
        totalAlumni,
        verifiedAlumni,
        activeUsers,
        inactiveUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};
