import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import { logAdminAction } from '../utils/auditLogger.js';

const SAFE_CREATOR_FIELDS = '_id fullName email profilePicture role';

/**
 * @desc    Get all projects across the platform with filtering, search, and pagination
 * @route   GET /api/admin/projects
 * @access  Private (Admin only)
 */
export const getAllProjects = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      search,
      includeDeleted = 'false',
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (includeDeleted !== 'true') {
      query.isDeleted = { $ne: true };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { requiredSkills: searchRegex },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const [projects, totalProjects] = await Promise.all([
      Project.find(query)
        .populate('createdBy', SAFE_CREATOR_FIELDS)
        .populate('teamMembers', SAFE_CREATOR_FIELDS)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Project.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalProjects / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: 'Projects fetched successfully',
      data: {
        projects,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalProjects,
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
 * @desc    Soft delete a project
 * @route   DELETE /api/admin/projects/:id
 * @access  Private (Admin only)
 */
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findById(id);
    if (!project || project.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or already deleted',
      });
    }

    project.isDeleted = true;
    project.status = 'cancelled';
    await project.save();

    // Log admin audit action
    await logAdminAction({
      adminId: req.user._id,
      action: 'PROJECT_DELETED',
      targetType: 'Project',
      targetId: id,
      description: `Project "${project.title}" was soft-deleted by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
      metadata: { title: project.title, category: project.category },
    });

    return res.status(200).json({
      success: true,
      message: 'Project soft-deleted successfully',
      data: {
        projectId: id,
        isDeleted: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project status
 * @route   PATCH /api/admin/projects/:id/status
 * @access  Private (Admin only)
 */
export const updateProjectStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const validStatuses = ['recruiting', 'in-progress', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const project = await Project.findById(id);
    if (!project || project.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or has been deleted',
      });
    }

    const previousStatus = project.status;
    project.status = status;
    await project.save();

    // Log admin audit action
    await logAdminAction({
      adminId: req.user._id,
      action: 'PROJECT_STATUS_UPDATED',
      targetType: 'Project',
      targetId: project._id,
      description: `Project "${project.title}" status was changed from "${previousStatus}" to "${status}" by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
      metadata: { previousStatus, newStatus: status },
    });

    return res.status(200).json({
      success: true,
      message: 'Project status updated successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};
