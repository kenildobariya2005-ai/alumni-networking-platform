import mongoose from 'mongoose';
import ProjectApplication from '../models/ProjectApplication.js';
import Project from '../models/Project.js';
import Notification from '../models/Notification.js';
import { parseSkills } from '../validators/projectValidator.js';
import { SAFE_USER_FIELDS } from './projectController.js';

/**
 * @desc    Apply to join a project
 * @route   POST /api/projects/:projectId/apply
 * @access  Private (Student only)
 */
export const applyToProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { message, skills } = req.body;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findOne({ _id: projectId, isDeleted: false });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or has been deleted',
      });
    }

    // Business Rule 4: Student cannot apply to their own project
    if (project.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own project',
      });
    }

    // Business Rule 6: Cannot apply when project status is completed or cancelled
    if (['completed', 'cancelled'].includes(project.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot apply to a project that is ${project.status}`,
      });
    }

    // Business Rule 7: Cannot apply when project deadline has passed
    if (project.deadline && new Date(project.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Project application deadline has expired',
      });
    }

    // Check if student is already in the team
    const isAlreadyMember = project.teamMembers.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );
    if (isAlreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already an accepted member of this project team',
      });
    }

    // Business Rule 8 & 13: Check if maxTeamSize has been reached
    if (project.teamMembers.length >= project.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: 'Project team is already full',
      });
    }

    // Business Rule 5: Prevent duplicate active applications
    const existingActiveApplication = await ProjectApplication.findOne({
      project: projectId,
      student: req.user._id,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existingActiveApplication) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active application for this project',
      });
    }

    const parsedSkills = parseSkills(skills);

    const application = await ProjectApplication.create({
      project: projectId,
      student: req.user._id,
      message: message ? message.trim() : '',
      skills: parsedSkills,
      status: 'pending',
    });

    await application.populate('student', SAFE_USER_FIELDS);
    await application.populate('project', 'title category status deadline');

    // Notify project creator
    if (project.createdBy.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: project.createdBy,
          title: 'New Project Application',
          message: `${req.user.fullName || 'A student'} applied to join your project "${project.title}".`,
          type: 'Project',
          isRead: false,
        });
      } catch (notifErr) {
        console.error(`Failed to create application notification: ${notifErr.message}`);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Project application submitted successfully',
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student's own project applications
 * @route   GET /api/project-applications/me
 * @access  Private (Student only)
 */
export const getMyProjectApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, sort = 'newest' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      student: req.user._id,
    };

    if (status) {
      query.status = status.trim().toLowerCase();
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const [applications, totalApplications] = await Promise.all([
      ProjectApplication.find(query)
        .populate({
          path: 'project',
          select: 'title description category status deadline maxTeamSize repositoryUrl demoUrl createdBy isDeleted',
          populate: { path: 'createdBy', select: SAFE_USER_FIELDS },
        })
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ProjectApplication.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalApplications / limitNum) || 1;
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    return res.status(200).json({
      success: true,
      message: 'My project applications fetched successfully',
      data: {
        applications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalApplications,
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
 * @desc    Get all applications for a specific project
 * @route   GET /api/projects/:projectId/applications
 * @access  Private (Project Creator or Admin)
 */
export const getProjectApplications = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format',
      });
    }

    const project = await Project.findOne({ _id: projectId, isDeleted: false });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or has been deleted',
      });
    }

    // Role check: Only the project creator or admin can view applications
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view applications for this project',
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      project: projectId,
    };

    if (status) {
      query.status = status.trim().toLowerCase();
    }

    const [applications, totalApplications] = await Promise.all([
      ProjectApplication.find(query)
        .populate('student', `${SAFE_USER_FIELDS} email`)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ProjectApplication.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalApplications / limitNum) || 1;
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    return res.status(200).json({
      success: true,
      message: 'Project applications fetched successfully',
      data: {
        applications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalApplications,
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
 * @desc    Accept a project application
 * @route   PATCH /api/project-applications/:id/accept
 * @access  Private (Project Creator only)
 */
export const acceptProjectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format',
      });
    }

    const application = await ProjectApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Project application not found',
      });
    }

    const project = await Project.findOne({ _id: application.project, isDeleted: false });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Associated project not found or has been deleted',
      });
    }

    // Business Rule 9: Only the project creator can accept applications
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project creator can accept applications',
      });
    }

    // Business Rule 10: Only pending applications can be accepted
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept application with status '${application.status}'. Only pending applications can be accepted`,
      });
    }

    // Business Rule 8 & 13: Check if maxTeamSize is reached
    if (project.teamMembers.length >= project.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: 'Project team is already full',
      });
    }

    // Business Rule 12: Add student to teamMembers (prevent duplicate IDs)
    const studentIdStr = application.student.toString();
    const isAlreadyMember = project.teamMembers.some(
      (memberId) => memberId.toString() === studentIdStr
    );

    if (!isAlreadyMember) {
      project.teamMembers.push(application.student);
      await project.save();
    }

    // Update application status
    application.status = 'accepted';
    await application.save();

    await application.populate('student', SAFE_USER_FIELDS);
    await application.populate('project', 'title category status maxTeamSize');

    // Notify student
    try {
      await Notification.create({
        recipient: application.student._id || application.student,
        title: 'Project Application Accepted',
        message: `Congratulations! Your application to join "${project.title}" has been accepted.`,
        type: 'Project',
        isRead: false,
      });
    } catch (notifErr) {
      console.error(`Failed to create accept notification: ${notifErr.message}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Project application accepted and student added to team',
      data: {
        application,
        teamMembersCount: project.teamMembers.length,
        maxTeamSize: project.maxTeamSize,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a project application
 * @route   PATCH /api/project-applications/:id/reject
 * @access  Private (Project Creator only)
 */
export const rejectProjectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format',
      });
    }

    const application = await ProjectApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Project application not found',
      });
    }

    const project = await Project.findOne({ _id: application.project, isDeleted: false });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Associated project not found or has been deleted',
      });
    }

    // Business Rule 9: Only the project creator can reject applications
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the project creator can reject applications',
      });
    }

    // Business Rule 10: Only pending applications can be rejected
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject application with status '${application.status}'. Only pending applications can be rejected`,
      });
    }

    // Update application status
    application.status = 'rejected';
    await application.save();

    await application.populate('student', SAFE_USER_FIELDS);
    await application.populate('project', 'title category status');

    // Notify student
    try {
      await Notification.create({
        recipient: application.student._id || application.student,
        title: 'Project Application Update',
        message: `Your application to join "${project.title}" was not accepted at this time.`,
        type: 'Project',
        isRead: false,
      });
    } catch (notifErr) {
      console.error(`Failed to create reject notification: ${notifErr.message}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Project application rejected',
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Withdraw a pending project application
 * @route   PATCH /api/project-applications/:id/withdraw
 * @access  Private (Application Owner / Student only)
 */
export const withdrawProjectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format',
      });
    }

    const application = await ProjectApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Project application not found',
      });
    }

    // Business Rule 11: A student can withdraw only their own application
    if (application.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only withdraw your own application',
      });
    }

    // Can only withdraw pending application
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw application with status '${application.status}'. Only pending applications can be withdrawn`,
      });
    }

    application.status = 'withdrawn';
    await application.save();

    await application.populate('student', SAFE_USER_FIELDS);
    await application.populate('project', 'title category createdBy');

    // Notify project creator
    const project = await Project.findById(application.project);
    if (project && project.createdBy.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          recipient: project.createdBy,
          title: 'Project Application Withdrawn',
          message: `${req.user.fullName || 'A student'} withdrew their application for "${project.title}".`,
          type: 'Project',
          isRead: false,
        });
      } catch (notifErr) {
        console.error(`Failed to create withdraw notification: ${notifErr.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Project application withdrawn successfully',
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};
