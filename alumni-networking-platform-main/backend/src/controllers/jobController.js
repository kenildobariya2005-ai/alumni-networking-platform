import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

/**
 * Helper to process required skills parameter into an array of strings
 */
const parseSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills.map((s) => s.trim()).filter(Boolean);
  }
  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Private (Alumni, Admin)
 */
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      company,
      location,
      jobType,
      employmentType,
      salaryRange,
      salary,
      requiredSkills,
      skills,
      deadline,
    } = req.body;

    const finalJobType = jobType || employmentType;
    const finalSalaryRange = salaryRange || salary || '';
    const finalSkills = parseSkills(requiredSkills || skills);

    const job = await Job.create({
      title,
      description,
      company,
      location,
      jobType: finalJobType,
      salaryRange: finalSalaryRange,
      requiredSkills: finalSkills,
      deadline,
      postedBy: req.user._id,
      status: 'Open',
    });

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all jobs with searching, filtering, and pagination
 * @route   GET /api/jobs
 * @access  Private (All authenticated users)
 */
export const getAllJobs = async (req, res, next) => {
  try {
    const {
      title,
      company,
      location,
      skills,
      requiredSkills,
      jobType,
      employmentType,
      status,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    // Build filter query object
    const query = {};

    // Filter by status (default to Open for students unless explicit query provided)
    if (status) {
      if (status !== 'all') {
        query.status = status;
      }
    } else if (req.user && req.user.role === 'student') {
      query.status = 'Open';
    }

    // Filter by title
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    // Filter by company
    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by jobType / employmentType
    const typeFilter = jobType || employmentType;
    if (typeFilter) {
      query.jobType = { $regex: `^${typeFilter}$`, $options: 'i' };
    }

    // Filter by skills
    const skillParam = skills || requiredSkills;
    if (skillParam) {
      const skillList = parseSkills(skillParam);
      if (skillList.length > 0) {
        query.requiredSkills = {
          $in: skillList.map((s) => new RegExp(s, 'i')),
        };
      }
    }

    // Keyword search across multiple fields
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Count total matching documents
    const total = await Job.countDocuments(query);

    // Fetch jobs
    const jobs = await Job.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('postedBy', 'fullName email profilePicture role');

    return res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single job details by ID
 * @route   GET /api/jobs/:id
 * @access  Private (All authenticated users)
 */
export const getSingleJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format',
      });
    }

    const job = await Job.findById(id).populate(
      'postedBy',
      'fullName email profilePicture role'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a job posting
 * @route   PUT /api/jobs/:id
 * @access  Private (Alumni owner, Admin)
 */
export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format',
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    // Check ownership or admin access
    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job posting',
      });
    }

    const {
      title,
      description,
      company,
      location,
      jobType,
      employmentType,
      salaryRange,
      salary,
      requiredSkills,
      skills,
      deadline,
      status,
    } = req.body;

    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (company !== undefined) job.company = company;
    if (location !== undefined) job.location = location;
    if (jobType || employmentType) job.jobType = jobType || employmentType;
    if (salaryRange !== undefined || salary !== undefined)
      job.salaryRange = salaryRange !== undefined ? salaryRange : salary;
    if (requiredSkills !== undefined || skills !== undefined)
      job.requiredSkills = parseSkills(requiredSkills !== undefined ? requiredSkills : skills);
    if (deadline !== undefined) job.deadline = deadline;
    if (status !== undefined) job.status = status;

    const updatedJob = await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job posting updated successfully',
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a job posting
 * @route   DELETE /api/jobs/:id
 * @access  Private (Alumni owner, Admin)
 */
export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format',
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    // Check ownership or admin access
    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job posting',
      });
    }

    await job.deleteOne();

    // Clean up all applications submitted for this job
    await Application.deleteMany({ job: id });

    return res.status(200).json({
      success: true,
      message: 'Job posting and all associated applications deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get jobs posted by the logged-in Alumni or Admin
 * @route   GET /api/jobs/my/posted
 * @access  Private (Alumni, Admin)
 */
export const getMyPostedJobs = async (req, res, next) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const query = { postedBy: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search and filter jobs (Dedicated search handler delegating to query filters)
 * @route   GET /api/jobs (or GET /api/jobs/search)
 * @access  Private (All authenticated users)
 */
export const searchJobs = async (req, res, next) => {
  return getAllJobs(req, res, next);
};

/**
 * @desc    Close or Open a job posting (Status toggle / update)
 * @route   PATCH /api/jobs/:id/status
 * @access  Private (Alumni owner, Admin)
 */
export const closeJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format',
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    // Check ownership or admin access
    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change status of this job posting',
      });
    }

    // If body provides explicit status ('Closed' or 'Open'), use it; otherwise default to 'Closed'
    const newStatus = req.body.status
      ? req.body.status
      : job.status === 'Open'
      ? 'Closed'
      : 'Open';

    job.status = newStatus;
    await job.save();

    return res.status(200).json({
      success: true,
      message: `Job status updated to ${job.status}`,
      job,
    });
  } catch (error) {
    next(error);
  }
};
