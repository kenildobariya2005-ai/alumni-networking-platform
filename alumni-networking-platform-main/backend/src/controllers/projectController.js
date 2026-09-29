import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Notification from '../models/Notification.js';
import { parseSkills } from '../validators/projectValidator.js';

export const SAFE_USER_FIELDS = '_id fullName profilePicture role';

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private (Alumni only)
 */
export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      requiredSkills,
      maxTeamSize = 5,
      deadline,
      repositoryUrl = '',
      demoUrl = '',
    } = req.body;

    const parsedSkills = parseSkills(requiredSkills);

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      requiredSkills: parsedSkills,
      maxTeamSize: Number(maxTeamSize) || 5,
      deadline: deadline ? new Date(deadline) : null,
      repositoryUrl: repositoryUrl ? repositoryUrl.trim() : '',
      demoUrl: demoUrl ? demoUrl.trim() : '',
      createdBy: req.user._id,
      teamMembers: [],
      status: 'recruiting',
      isDeleted: false,
    });

    await project.populate('createdBy', SAFE_USER_FIELDS);

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all projects with filtering, sorting, and pagination
 * @route   GET /api/projects
 * @access  Public / Private
 */
export const getProjects = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'newest',
      category,
      status,
      skill,
      search,
      createdBy,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Base query: exclude soft-deleted projects
    const query = {
      isDeleted: false,
    };

    if (category) {
      query.category = category.trim();
    }

    if (status) {
      query.status = status.trim().toLowerCase();
    }

    if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
      query.createdBy = createdBy;
    }

    if (skill) {
      const cleanSkill = skill.trim();
      query.requiredSkills = { $in: [new RegExp(`^${cleanSkill}$`, 'i')] };
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { requiredSkills: searchRegex },
        { category: searchRegex },
      ];
    }

    // Sort order
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'deadline') {
      sortOption = { deadline: 1, createdAt: -1 };
    }

    const [projects, totalProjects] = await Promise.all([
      Project.find(query)
        .populate('createdBy', SAFE_USER_FIELDS)
        .populate('teamMembers', SAFE_USER_FIELDS)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Project.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalProjects / limitNum) || 1;
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

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
          hasNextPage,
          hasPreviousPage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project by ID
 * @route   GET /api/projects/:id
 * @access  Public / Private
 */
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findOne({ _id: id, isDeleted: false })
      .populate('createdBy', SAFE_USER_FIELDS)
      .populate('teamMembers', SAFE_USER_FIELDS);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or has been deleted',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Project fetched successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project (Creator only)
 * @route   PUT /api/projects/:id
 * @access  Private (Alumni Creator)
 */
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findOne({ _id: id, isDeleted: false });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or has been deleted',
      });
    }

    // Ownership check: Only the project creator can update the project
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update projects that you created',
      });
    }

    const {
      title,
      description,
      category,
      requiredSkills,
      maxTeamSize,
      status,
      deadline,
      repositoryUrl,
      demoUrl,
    } = req.body;

    if (maxTeamSize !== undefined) {
      const parsedSize = Number(maxTeamSize);
      if (parsedSize < project.teamMembers.length) {
        return res.status(400).json({
          success: false,
          message: `Maximum team size cannot be smaller than current team member count (${project.teamMembers.length})`,
        });
      }
      project.maxTeamSize = parsedSize;
    }

    if (title !== undefined) project.title = title.trim();
    if (description !== undefined) project.description = description.trim();
    if (category !== undefined) project.category = category.trim();
    if (requiredSkills !== undefined) project.requiredSkills = parseSkills(requiredSkills);
    if (status !== undefined) project.status = status.trim().toLowerCase();
    if (deadline !== undefined) project.deadline = deadline ? new Date(deadline) : null;
    if (repositoryUrl !== undefined) project.repositoryUrl = repositoryUrl.trim();
    if (demoUrl !== undefined) project.demoUrl = demoUrl.trim();

    await project.save();
    await project.populate('createdBy', SAFE_USER_FIELDS);
    await project.populate('teamMembers', SAFE_USER_FIELDS);

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete project
 * @route   DELETE /api/projects/:id
 * @access  Private (Creator or Admin)
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

    const project = await Project.findOne({ _id: id, isDeleted: false });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or already deleted',
      });
    }

    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this project',
      });
    }

    // Soft deletion: mark isDeleted = true and status = 'cancelled'
    project.isDeleted = true;
    project.status = 'cancelled';
    await project.save();

    return res.status(200).json({
      success: true,
      message: isAdmin && !isCreator ? 'Project removed by admin' : 'Project deleted successfully',
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
 * @desc    Get projects created by or collaborated on by logged in user
 * @route   GET /api/projects/my
 * @access  Private (Alumni, Student, Admin)
 */
export const getMyProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'newest', filter = 'created' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      isDeleted: false,
    };

    if (filter === 'member') {
      query.teamMembers = req.user._id;
    } else if (filter === 'all') {
      query.$or = [{ createdBy: req.user._id }, { teamMembers: req.user._id }];
    } else {
      // Default: created by user
      query.createdBy = req.user._id;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const [projects, totalProjects] = await Promise.all([
      Project.find(query)
        .populate('createdBy', SAFE_USER_FIELDS)
        .populate('teamMembers', SAFE_USER_FIELDS)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Project.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalProjects / limitNum) || 1;
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    return res.status(200).json({
      success: true,
      message: 'My projects fetched successfully',
      data: {
        projects,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalProjects,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project status
 * @route   PATCH /api/projects/:id/status
 * @access  Private (Creator only)
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

    const project = await Project.findOne({ _id: id, isDeleted: false });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or has been deleted',
      });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project creator can update the project status',
      });
    }

    project.status = status.trim().toLowerCase();
    await project.save();
    await project.populate('createdBy', SAFE_USER_FIELDS);
    await project.populate('teamMembers', SAFE_USER_FIELDS);

    return res.status(200).json({
      success: true,
      message: `Project status updated to '${project.status}'`,
      data: {
        project,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search projects by keywords, category, skill, status, or author
 * @route   GET /api/projects/search
 * @access  Public / Private
 */
export const searchProjects = async (req, res, next) => {
  try {
    const {
      search,
      category,
      skill,
      status,
      createdBy,
      page = 1,
      limit = 10,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      isDeleted: false,
    };

    if (category) {
      query.category = category.trim();
    }

    if (status) {
      query.status = status.trim().toLowerCase();
    }

    if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
      query.createdBy = createdBy;
    }

    if (skill) {
      const cleanSkill = skill.trim();
      query.requiredSkills = { $in: [new RegExp(`^${cleanSkill}$`, 'i')] };
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { requiredSkills: searchRegex },
        { category: searchRegex },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'deadline') {
      sortOption = { deadline: 1, createdAt: -1 };
    }

    const [projects, totalProjects] = await Promise.all([
      Project.find(query)
        .populate('createdBy', SAFE_USER_FIELDS)
        .populate('teamMembers', SAFE_USER_FIELDS)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Project.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalProjects / limitNum) || 1;
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    return res.status(200).json({
      success: true,
      message: 'Projects matching search criteria fetched successfully',
      data: {
        projects,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalProjects,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
