import mongoose from 'mongoose';
import User from '../models/User.js';
import MentorshipRequest from '../models/MentorshipRequest.js';

const SAFE_USER_FIELDS = '_id fullName email profilePicture role';

/**
 * @desc    Get all mentorship requests across the platform with filters and pagination
 * @route   GET /api/admin/mentorship
 * @access  Private (Admin only)
 */
export const getAllMentorshipRequests = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      student,
      mentor,
      startDate,
      endDate,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }

    if (student && mongoose.Types.ObjectId.isValid(student)) {
      query.student = student;
    }

    if (mentor && mongoose.Types.ObjectId.isValid(mentor)) {
      query.mentor = mentor;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const [requests, totalRequests] = await Promise.all([
      MentorshipRequest.find(query)
        .populate('student', SAFE_USER_FIELDS)
        .populate('mentor', SAFE_USER_FIELDS)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      MentorshipRequest.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalRequests / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: 'Mentorship requests fetched successfully',
      data: {
        requests,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRequests,
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
 * @desc    Get aggregate mentorship program statistics
 * @route   GET /api/admin/mentorship/statistics
 * @access  Private (Admin only)
 */
export const getMentorshipStatistics = async (req, res, next) => {
  try {
    const [
      statusCounts,
      totalRequests,
      ratingsData,
      topMentors,
    ] = await Promise.all([
      // Count grouped by status
      MentorshipRequest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Total requests count
      MentorshipRequest.countDocuments(),

      // Average rating calculation on completed mentorships
      MentorshipRequest.aggregate([
        { $match: { rating: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            ratedCount: { $sum: 1 },
          },
        },
      ]),

      // Top 5 active mentors
      MentorshipRequest.aggregate([
        { $match: { status: { $in: ['accepted', 'completed'] } } },
        {
          $group: {
            _id: '$mentor',
            completedSessions: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            totalEngagements: { $sum: 1 },
          },
        },
        { $sort: { completedSessions: -1, totalEngagements: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'mentorDetails',
          },
        },
        { $unwind: '$mentorDetails' },
        {
          $project: {
            _id: 1,
            completedSessions: 1,
            totalEngagements: 1,
            mentor: {
              _id: '$mentorDetails._id',
              fullName: '$mentorDetails.fullName',
              email: '$mentorDetails.email',
              profilePicture: '$mentorDetails.profilePicture',
            },
          },
        },
      ]),
    ]);

    const statusMap = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0,
    };

    statusCounts.forEach((item) => {
      if (item._id && statusMap.hasOwnProperty(item._id)) {
        statusMap[item._id] = item.count;
      }
    });

    const averageRating = ratingsData.length > 0 ? parseFloat(ratingsData[0].averageRating.toFixed(2)) : 0;
    const completionRate = totalRequests > 0 ? parseFloat(((statusMap.completed / totalRequests) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      message: 'Mentorship statistics fetched successfully',
      data: {
        totalRequests,
        statusBreakdown: statusMap,
        averageRating,
        completionRate: `${completionRate}%`,
        topMentors,
      },
    });
  } catch (error) {
    next(error);
  }
};
