import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';

const SAFE_ADMIN_FIELDS = '_id fullName email profilePicture role';

/**
 * @desc    Get audit logs with filtering and pagination
 * @route   GET /api/admin/audit-logs
 * @access  Private (Admin only)
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      targetType,
      admin,
      startDate,
      endDate,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (action) {
      query.action = action.trim();
    }

    if (targetType) {
      query.targetType = targetType.trim();
    }

    if (admin && mongoose.Types.ObjectId.isValid(admin)) {
      query.admin = admin;
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

    const [logs, totalLogs] = await Promise.all([
      AuditLog.find(query)
        .populate('admin', SAFE_ADMIN_FIELDS)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalLogs / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: 'Audit logs fetched successfully',
      data: {
        logs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalLogs,
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
