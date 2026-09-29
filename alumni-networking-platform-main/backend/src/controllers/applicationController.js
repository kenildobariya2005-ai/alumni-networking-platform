import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import StudentProfile from '../models/StudentProfile.js';

/**
 * @desc    Apply for a job position
 * @route   POST /api/jobs/:jobId/apply
 * @access  Private (Student only)
 */
export const applyJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    // Verify valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format',
      });
    }

    // Verify student role
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students are permitted to apply for job postings',
      });
    }

    // Fetch student's profile to retrieve saved resumeUrl
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });

    const hasResume = Boolean(
      studentProfile &&
      (studentProfile.resumeFileId || (studentProfile.resumeUrl && studentProfile.resumeUrl.trim()))
    );

    if (!hasResume) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume before applying for a job',
      });
    }

    // Find job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    // Check if job status is Closed
    if (job.status === 'Closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply to a job posting that is closed',
      });
    }

    // Check if job deadline has passed
    if (new Date() > new Date(job.deadline)) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline for this job posting has passed',
      });
    }

    // Check if student has already applied for this job
    const existingApplication = await Application.findOne({
      student: req.user._id,
      job: jobId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this job posting',
      });
    }

    // Create new application using snapshot of student's resumeUrl
    const application = await Application.create({
      student: req.user._id,
      job: jobId,
      resumeUrl: studentProfile.resumeUrl || (studentProfile.resumeFileId ? `/api/student/profile/resume/${studentProfile.resumeFileId}` : ''),
      coverLetter: coverLetter || '',
      status: 'Applied',
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    // Handle MongoDB duplicate key error if concurrent requests bypass pre-check
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this job posting',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all applications submitted by the logged-in student
 * @route   GET /api/applications/me
 * @access  Private (Student only)
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = { student: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Application.countDocuments(query);

    const applications = await Application.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate({
        path: 'job',
        select: 'title company location jobType salaryRange status deadline postedBy',
        populate: {
          path: 'postedBy',
          select: 'fullName email profilePicture',
        },
      });

    return res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications submitted for a specific job posting
 * @route   GET /api/jobs/:jobId/applications
 * @access  Private (Alumni job owner, Admin)
 */
export const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format',
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
      });
    }

    // Authorization check: must be job creator or Admin
    if (
      job.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job posting',
      });
    }

    const query = { job: jobId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Application.countDocuments(query);

    const applications = await Application.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('student', 'fullName email profilePicture role');

    return res.status(200).json({
      success: true,
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      count: applications.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status (Reviewing, Shortlisted, Accepted, Rejected)
 * @route   PATCH /api/applications/:id/status
 * @access  Private (Alumni job owner, Admin)
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Application ID format',
      });
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify job owner or Admin
    const jobOwnerId = application.job?.postedBy
      ? application.job.postedBy.toString()
      : null;

    if (
      jobOwnerId !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update status for this application',
      });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      application,
    });
  } catch (error) {
    next(error);
  }
};
