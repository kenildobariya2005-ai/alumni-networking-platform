import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { logAdminAction } from '../utils/auditLogger.js';

const SAFE_POSTER_FIELDS = '_id fullName email profilePicture role';

/**
 * @desc    Get all jobs across the platform with filtering, search, and pagination
 * @route   GET /api/admin/jobs
 * @access  Private (Admin only)
 */
export const getAllJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      jobType,
      company,
      search,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (company) {
      query.company = new RegExp(company.trim(), 'i');
    }

    if (search && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { company: searchRegex },
        { location: searchRegex },
        { requiredSkills: searchRegex },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'deadline') {
      sortOption = { deadline: 1 };
    }

    const [jobs, totalJobs] = await Promise.all([
      Job.find(query)
        .populate('postedBy', SAFE_POSTER_FIELDS)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(query),
    ]);

    // Attach application counts to each job for admin overview
    const jobIds = jobs.map((j) => j._id);
    const applicationCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(applicationCounts.map((a) => [a._id.toString(), a.count]));

    const jobsWithCounts = jobs.map((job) => ({
      ...job,
      applicationsCount: countMap.get(job._id.toString()) || 0,
    }));

    const totalPages = Math.ceil(totalJobs / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: 'Jobs fetched successfully',
      data: {
        jobs: jobsWithCounts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalJobs,
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
 * @desc    Delete a job and its associated applications
 * @route   DELETE /api/admin/jobs/:id
 * @access  Private (Admin only)
 */
export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
      });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Delete job and any related applications
    await Promise.all([
      Job.findByIdAndDelete(id),
      Application.deleteMany({ job: id }),
    ]);

    // Log admin audit action
    await logAdminAction({
      adminId: req.user._id,
      action: 'JOB_DELETED',
      targetType: 'Job',
      targetId: id,
      description: `Job "${job.title}" at "${job.company}" was deleted by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
      metadata: { title: job.title, company: job.company },
    });

    return res.status(200).json({
      success: true,
      message: 'Job and associated applications deleted successfully',
      data: {
        jobId: id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Close a job posting
 * @route   PATCH /api/admin/jobs/:id/close
 * @access  Private (Admin only)
 */
export const closeJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
      });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    job.status = 'Closed';
    await job.save();

    // Log admin audit action
    await logAdminAction({
      adminId: req.user._id,
      action: 'JOB_CLOSED',
      targetType: 'Job',
      targetId: job._id,
      description: `Job "${job.title}" at "${job.company}" was closed by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    return res.status(200).json({
      success: true,
      message: 'Job closed successfully',
      data: {
        job,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reopen a closed job posting
 * @route   PATCH /api/admin/jobs/:id/reopen
 * @access  Private (Admin only)
 */
export const reopenJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
      });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    job.status = 'Open';
    await job.save();

    // Log admin audit action
    await logAdminAction({
      adminId: req.user._id,
      action: 'JOB_REOPENED',
      targetType: 'Job',
      targetId: job._id,
      description: `Job "${job.title}" at "${job.company}" was reopened by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    return res.status(200).json({
      success: true,
      message: 'Job reopened successfully',
      data: {
        job,
      },
    });
  } catch (error) {
    next(error);
  }
};
