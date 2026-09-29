import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import MentorshipRequest from '../models/MentorshipRequest.js';
import Project from '../models/Project.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import AlumniProfile from '../models/AlumniProfile.js';

/**
 * @desc    Get comprehensive platform dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Private (Admin only)
 */
export const getDashboardStatistics = async (req, res, next) => {
  try {
    // Run optimized database counts in parallel
    const [
      totalUsers,
      totalStudents,
      totalAlumni,
      totalAdmins,
      verifiedAlumni,
      pendingAlumni,
      activeUsers,
      inactiveUsers,
      totalJobs,
      openJobs,
      totalApplications,
      totalMentorshipRequests,
      activeMentorshipRequests,
      completedMentorships,
      totalProjects,
      activeProjects,
      totalPosts,
      totalComments,
      hiddenPosts,
      hiddenComments,
      totalMessages,
      unreadNotifications,
      recentAuditLogs,
      recentUsers,
    ] = await Promise.all([
      // User statistics
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'alumni', isVerified: true }),
      User.countDocuments({ role: 'alumni', isVerified: false }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),

      // Job statistics
      Job.countDocuments(),
      Job.countDocuments({ status: 'Open' }),
      Application.countDocuments(),

      // Mentorship statistics
      MentorshipRequest.countDocuments(),
      MentorshipRequest.countDocuments({ status: { $in: ['pending', 'accepted'] } }),
      MentorshipRequest.countDocuments({ status: 'completed' }),

      // Project statistics
      Project.countDocuments({ isDeleted: { $ne: true } }),
      Project.countDocuments({
        status: { $in: ['recruiting', 'in-progress'] },
        isDeleted: { $ne: true },
      }),

      // Community & Moderation statistics
      Post.countDocuments({ status: { $ne: 'deleted' } }),
      Comment.countDocuments({ status: { $ne: 'deleted' } }),
      Post.countDocuments({ status: 'hidden' }),
      Comment.countDocuments({ status: 'hidden' }),

      // Messaging & Notifications
      Message.countDocuments(),
      Notification.countDocuments({ isRead: false }),

      // Recent platform activity
      AuditLog.find()
        .populate('admin', 'fullName email profilePicture')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      User.find()
        .select('fullName email role isVerified isActive createdAt profilePicture')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const reportedFlaggedContent = hiddenPosts + hiddenComments + inactiveUsers;

    return res.status(200).json({
      success: true,
      message: 'Dashboard statistics fetched successfully',
      data: {
        // Platform-level top cards
        totalStudents,
        totalAlumni,
        pendingAlumniVerifications: pendingAlumni,
        activeJobPosts: openJobs,
        activeMentorshipRequests,
        activeProjects,
        communityPosts: totalPosts,
        reportedFlaggedContent,

        // Flat keys for backwards compatibility
        totalUsers,
        totalAdmins,
        verifiedAlumni,
        activeUsers,
        inactiveUsers,
        totalJobs,
        openJobs,
        totalApplications,
        totalMentorshipRequests,
        completedMentorships,
        totalProjects,
        totalComments,
        hiddenPosts,
        hiddenComments,
        totalMessages,
        unreadNotifications,

        // Categorized object maps
        users: {
          total: totalUsers,
          students: totalStudents,
          alumni: totalAlumni,
          admins: totalAdmins,
          verifiedAlumni,
          pendingAlumni,
          active: activeUsers,
          inactive: inactiveUsers,
        },
        jobs: {
          total: totalJobs,
          open: openJobs,
          applications: totalApplications,
        },
        mentorship: {
          total: totalMentorshipRequests,
          active: activeMentorshipRequests,
          completed: completedMentorships,
        },
        projects: {
          total: totalProjects,
          recruiting: activeProjects,
          active: activeProjects,
        },
        community: {
          posts: totalPosts,
          comments: totalComments,
        },
        moderation: {
          reportedFlaggedContent,
          hiddenPosts,
          hiddenComments,
          suspendedUsers: inactiveUsers,
        },

        recentActivity: {
          auditLogs: recentAuditLogs,
          recentUsers,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed platform activity across all modules
 * @route   GET /api/admin/dashboard/activity
 * @access  Private (Admin only)
 */
export const getDashboardActivity = async (req, res, next) => {
  try {
    const [
      recentUsers,
      pendingAlumniUsers,
      recentJobs,
      recentMentorships,
      recentProjects,
      recentPosts,
      recentAuditLogs,
    ] = await Promise.all([
      // Recent registrations
      User.find()
        .select('fullName email role isVerified isActive createdAt profilePicture')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),

      // Recent pending alumni for verification review
      User.find({ role: 'alumni', isVerified: false })
        .select('fullName email role isVerified isActive createdAt profilePicture')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),

      // Recent jobs posted
      Job.find()
        .populate('postedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Recent mentorship requests
      MentorshipRequest.find()
        .populate('student', 'fullName email profilePicture')
        .populate('mentor', 'fullName email profilePicture')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Recent projects
      Project.find({ isDeleted: { $ne: true } })
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Recent community posts
      Post.find({ status: { $ne: 'deleted' } })
        .populate('author', 'fullName email profilePicture role')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Recent security & audit trail
      AuditLog.find()
        .populate('admin', 'fullName email profilePicture')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    // Attach AlumniProfile details to pending alumni users for quick review
    const pendingUserIds = pendingAlumniUsers.map((u) => u._id);
    const profiles = await AlumniProfile.find({ user: { $in: pendingUserIds } }).lean();
    const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

    const enrichedPendingAlumni = pendingAlumniUsers.map((u) => ({
      ...u,
      profile: profileMap.get(u._id.toString()) || null,
    }));

    return res.status(200).json({
      success: true,
      message: 'Platform activity fetched successfully',
      data: {
        recentUsers,
        recentPendingAlumni: enrichedPendingAlumni,
        recentJobs,
        recentMentorships,
        recentProjects,
        recentPosts,
        recentAuditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregate analytics for platform distribution & modules
 * @route   GET /api/admin/dashboard/analytics
 * @access  Private (Admin only)
 */
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const [
      studentsCount,
      alumniCount,
      adminsCount,
      openJobs,
      closedJobs,
      totalApplications,
      pendingMentorship,
      acceptedMentorship,
      completedMentorship,
      rejectedMentorship,
      recruitingProjects,
      inProgressProjects,
      completedProjects,
      totalPosts,
      hiddenPosts,
      totalComments,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      User.countDocuments({ role: 'admin' }),
      Job.countDocuments({ status: 'Open' }),
      Job.countDocuments({ status: 'Closed' }),
      Application.countDocuments(),
      MentorshipRequest.countDocuments({ status: 'pending' }),
      MentorshipRequest.countDocuments({ status: 'accepted' }),
      MentorshipRequest.countDocuments({ status: 'completed' }),
      MentorshipRequest.countDocuments({ status: 'rejected' }),
      Project.countDocuments({ status: 'recruiting', isDeleted: { $ne: true } }),
      Project.countDocuments({ status: 'in-progress', isDeleted: { $ne: true } }),
      Project.countDocuments({ status: 'completed', isDeleted: { $ne: true } }),
      Post.countDocuments({ status: { $ne: 'deleted' } }),
      Post.countDocuments({ status: 'hidden' }),
      Comment.countDocuments({ status: { $ne: 'deleted' } }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Platform analytics fetched successfully',
      data: {
        users: {
          students: studentsCount,
          alumni: alumniCount,
          admins: adminsCount,
          total: studentsCount + alumniCount + adminsCount,
        },
        jobs: {
          open: openJobs,
          closed: closedJobs,
          total: openJobs + closedJobs,
          applications: totalApplications,
        },
        mentorship: {
          pending: pendingMentorship,
          accepted: acceptedMentorship,
          completed: completedMentorship,
          rejected: rejectedMentorship,
          total: pendingMentorship + acceptedMentorship + completedMentorship + rejectedMentorship,
        },
        projects: {
          recruiting: recruitingProjects,
          inProgress: inProgressProjects,
          completed: completedProjects,
          total: recruitingProjects + inProgressProjects + completedProjects,
        },
        community: {
          posts: totalPosts,
          hiddenPosts,
          comments: totalComments,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

