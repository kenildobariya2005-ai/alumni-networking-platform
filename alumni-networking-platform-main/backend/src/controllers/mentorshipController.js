import mongoose from 'mongoose';
import MentorshipRequest from '../models/MentorshipRequest.js';
import User from '../models/User.js';
import AlumniProfile from '../models/AlumniProfile.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Create a mentorship request
 * @route   POST /api/mentorship/request
 * @access  Private (Student only)
 */
export const createMentorshipRequest = async (req, res, next) => {
  try {
    const { topic, message, preferredDate } = req.body;
    const mentorId = req.body.mentorId || req.body.mentor;

    // 1. Role verification: Only students can create requests
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students are permitted to create mentorship requests',
      });
    }

    // 2. Validate Mentor ID
    if (!mentorId || !mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid Mentor ID is required',
      });
    }

    // 3. Prevent sending request to self
    if (mentorId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a mentorship request to yourself',
      });
    }

    // 4. Check if Mentor user exists and has alumni role
    const mentorUser = await User.findById(mentorId).select('role fullName email isActive');
    if (!mentorUser || !mentorUser.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Mentor user not found or is inactive',
      });
    }

    if (mentorUser.role !== 'alumni') {
      return res.status(400).json({
        success: false,
        message: 'Mentorship requests can only be sent to alumni mentors',
      });
    }

    // 5. Check if Alumni has mentorAvailable = true
    const alumniProfile = await AlumniProfile.findOne({ user: mentorId });
    if (!alumniProfile) {
      return res.status(404).json({
        success: false,
        message: 'Alumni profile not found for this mentor',
      });
    }

    if (!alumniProfile.mentorAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This mentor is currently not available for mentorship sessions',
      });
    }

    // 6. Check for duplicate pending requests to the same mentor
    const existingPendingRequest = await MentorshipRequest.findOne({
      student: req.user._id,
      mentor: mentorId,
      status: 'pending',
    });

    if (existingPendingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending mentorship request with this mentor',
      });
    }

    // 7. Validate preferred date if provided
    let parsedPreferredDate = null;
    if (preferredDate) {
      parsedPreferredDate = new Date(preferredDate);
      if (isNaN(parsedPreferredDate.getTime()) || parsedPreferredDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Preferred date must be a valid future date',
        });
      }
    }

    // 8. Create mentorship request
    const mentorship = await MentorshipRequest.create({
      student: req.user._id,
      mentor: mentorId,
      topic,
      message,
      preferredDate: parsedPreferredDate,
      status: 'pending',
    });

    // 9. Create database notification for the Alumni
    await Notification.create({
      recipient: mentorId,
      title: 'New Mentorship Request',
      message: `${req.user.fullName} sent you a mentorship request on "${topic}".`,
      type: 'Mentorship',
    });

    // 10. Fetch populated record for response
    const populated = await MentorshipRequest.findById(mentorship._id)
      .populate('student', 'fullName email profilePicture role')
      .populate('mentor', 'fullName email profilePicture role');

    return res.status(201).json({
      success: true,
      message: 'Mentorship request created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all mentorship requests created by the logged-in student
 * @route   GET /api/mentorship/my-requests
 * @access  Private (Student, Admin)
 */
export const getMyMentorshipRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = { student: req.user._id };

    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await MentorshipRequest.countDocuments(query);
    const requests = await MentorshipRequest.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('mentor', 'fullName email profilePicture role')
      .lean();

    return res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get incoming mentorship requests received by the logged-in alumni
 * @route   GET /api/mentorship/incoming
 * @access  Private (Alumni, Admin)
 */
export const getIncomingMentorshipRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = { mentor: req.user._id };

    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await MentorshipRequest.countDocuments(query);
    const requests = await MentorshipRequest.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('student', 'fullName email profilePicture role')
      .lean();

    return res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a specific mentorship request by ID
 * @route   GET /api/mentorship/:id
 * @access  Private (Student, Mentor, Admin)
 */
export const getMentorshipById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Mentorship Request ID format',
      });
    }

    const request = await MentorshipRequest.findById(id)
      .populate('student', 'fullName email profilePicture role')
      .populate('mentor', 'fullName email profilePicture role');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found',
      });
    }

    const studentId = request.student?._id?.toString() || request.student?.toString();
    const mentorId = request.mentor?._id?.toString() || request.mentor?.toString();
    const currentUserId = req.user._id.toString();

    // Prevent unauthorized users from accessing private mentorship details
    if (
      studentId !== currentUserId &&
      mentorId !== currentUserId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this mentorship request',
      });
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept a pending mentorship request
 * @route   PATCH /api/mentorship/:id/accept
 * @access  Private (Alumni mentor, Admin)
 */
export const acceptMentorshipRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { meetingLink, scheduledAt } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Mentorship Request ID format',
      });
    }

    const request = await MentorshipRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found',
      });
    }

    // Only the requested alumni mentor or Admin can accept
    if (
      request.mentor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this mentorship request',
      });
    }

    // Only pending requests can be accepted
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept mentorship request with status '${request.status}'`,
      });
    }

    // Optional direct scheduling during acceptance
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Scheduled date must be a valid future date',
        });
      }
      request.scheduledAt = scheduledDate;
    }

    if (meetingLink) {
      request.meetingLink = meetingLink.trim();
    }

    request.status = 'accepted';
    await request.save();

    // Notify Student
    await Notification.create({
      recipient: request.student,
      title: 'Mentorship Request Accepted',
      message: `${req.user.fullName} accepted your mentorship request on "${request.topic}".`,
      type: 'Mentorship',
    });

    const populated = await MentorshipRequest.findById(request._id)
      .populate('student', 'fullName email profilePicture role')
      .populate('mentor', 'fullName email profilePicture role');

    return res.status(200).json({
      success: true,
      message: 'Mentorship request accepted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a pending mentorship request
 * @route   PATCH /api/mentorship/:id/reject
 * @access  Private (Alumni mentor, Admin)
 */
export const rejectMentorshipRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Mentorship Request ID format',
      });
    }

    const request = await MentorshipRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found',
      });
    }

    // Only the requested alumni mentor or Admin can reject
    if (
      request.mentor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this mentorship request',
      });
    }

    // Only pending requests can be rejected
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject mentorship request with status '${request.status}'`,
      });
    }

    request.status = 'rejected';
    await request.save();

    // Notify Student
    await Notification.create({
      recipient: request.student,
      title: 'Mentorship Request Rejected',
      message: `${req.user.fullName} has declined your mentorship request on "${request.topic}".`,
      type: 'Mentorship',
    });

    const populated = await MentorshipRequest.findById(request._id)
      .populate('student', 'fullName email profilePicture role')
      .populate('mentor', 'fullName email profilePicture role');

    return res.status(200).json({
      success: true,
      message: 'Mentorship request rejected successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a pending mentorship request
 * @route   PATCH /api/mentorship/:id/cancel
 * @access  Private (Student owner, Admin)
 */
export const cancelMentorshipRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Mentorship Request ID format',
      });
    }

    const request = await MentorshipRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found',
      });
    }

    // Only the requesting student or Admin can cancel
    if (
      request.student.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this mentorship request',
      });
    }

    // Cancel operation is allowed only while request is pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel mentorship request with status '${request.status}'. Only pending requests can be cancelled.`,
      });
    }

    request.status = 'cancelled';
    await request.save();

    // Notify Alumni Mentor
    await Notification.create({
      recipient: request.mentor,
      title: 'Mentorship Request Cancelled',
      message: `${req.user.fullName} cancelled their mentorship request on "${request.topic}".`,
      type: 'Mentorship',
    });

    const populated = await MentorshipRequest.findById(request._id)
      .populate('student', 'fullName email profilePicture role')
      .populate('mentor', 'fullName email profilePicture role');

    return res.status(200).json({
      success: true,
      message: 'Mentorship request cancelled successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Schedule an accepted mentorship session
 * @route   PATCH /api/mentorship/:id/schedule
 * @access  Private (Alumni mentor, Admin)
 */
export const scheduleMentorship = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scheduledAt, meetingLink } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Mentorship Request ID format',
      });
    }

    const request = await MentorshipRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found',
      });
    }

    // Only mentor or Admin can schedule
    if (
      request.mentor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to schedule this mentorship session',
      });
    }

    // Only accepted requests can be scheduled
    if (request.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Only accepted mentorship requests can be scheduled. Current status: '${request.status}'`,
      });
    }

    // Validate scheduled date
    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'scheduledAt date and time is required',
      });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date must be a valid future date and time',
      });
    }

    request.scheduledAt = scheduledDate;
    if (meetingLink !== undefined) {
      request.meetingLink = meetingLink.trim();
    }

    await request.save();

    // Notify Student
    await Notification.create({
      recipient: request.student,
      title: 'Mentorship Session Scheduled',
      message: `${req.user.fullName} scheduled your mentorship session on "${request.topic}" for ${scheduledDate.toLocaleString()}.`,
      type: 'Mentorship',
    });

    const populated = await MentorshipRequest.findById(request._id)
      .populate('student', 'fullName email profilePicture role')
      .populate('mentor', 'fullName email profilePicture role');

    return res.status(200).json({
      success: true,
      message: 'Mentorship session scheduled successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark an accepted mentorship session as completed
 * @route   PATCH /api/mentorship/:id/complete
 * @access  Private (Alumni mentor, Admin)
 */
export const completeMentorship = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Mentorship Request ID format',
      });
    }

    const request = await MentorshipRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found',
      });
    }

    // Only mentor or Admin can complete
    if (
      request.mentor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this mentorship session',
      });
    }

    // Only accepted mentorships can be marked as completed
    if (request.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: `Only accepted mentorship requests can be marked as completed. Current status: '${request.status}'`,
      });
    }

    request.status = 'completed';
    request.completedAt = new Date();
    await request.save();

    // Notify Student to submit feedback
    await Notification.create({
      recipient: request.student,
      title: 'Mentorship Session Completed',
      message: `Your mentorship session on "${request.topic}" with ${req.user.fullName} has been completed. Please submit your feedback and rating!`,
      type: 'Mentorship',
    });

    const populated = await MentorshipRequest.findById(request._id)
      .populate('student', 'fullName email profilePicture role')
      .populate('mentor', 'fullName email profilePicture role');

    return res.status(200).json({
      success: true,
      message: 'Mentorship session marked as completed successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit feedback and rating for a completed mentorship session
 * @route   POST /api/mentorship/:id/feedback
 * @access  Private (Student only)
 */
export const submitMentorshipFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Mentorship Request ID format',
      });
    }

    const request = await MentorshipRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found',
      });
    }

    // Only the student mentee can submit feedback
    if (request.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the mentee student can submit feedback for this mentorship session',
      });
    }

    // Feedback can only be submitted after completion
    if (request.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Feedback can only be submitted for completed mentorship sessions. Current status: '${request.status}'`,
      });
    }

    // Student can submit feedback only once
    if (request.rating) {
      return res.status(400).json({
        success: false,
        message: 'Feedback has already been submitted for this mentorship session',
      });
    }

    // Validate rating
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5',
      });
    }

    request.rating = numRating;
    if (feedback !== undefined) {
      request.feedback = feedback.trim();
    }

    await request.save();

    // Notify Mentor of feedback
    await Notification.create({
      recipient: request.mentor,
      title: 'Mentorship Feedback Received',
      message: `${req.user.fullName} gave a rating of ${numRating}/5 for the mentorship session on "${request.topic}".`,
      type: 'Mentorship',
    });

    const populated = await MentorshipRequest.findById(request._id)
      .populate('student', 'fullName email profilePicture role')
      .populate('mentor', 'fullName email profilePicture role');

    return res.status(200).json({
      success: true,
      message: 'Mentorship feedback submitted successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get completed mentorship history for the logged-in user or Admin
 * @route   GET /api/mentorship/history
 * @access  Private (Student, Alumni, Admin)
 */
export const getMentorshipHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-completedAt -updatedAt' } = req.query;

    const query = { status: 'completed' };

    // Filter by role
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'alumni') {
      query.mentor = req.user._id;
    }
    // Admin can view all completed mentorship history

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await MentorshipRequest.countDocuments(query);
    const history = await MentorshipRequest.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('student', 'fullName email profilePicture role')
      .populate('mentor', 'fullName email profilePicture role')
      .lean();

    return res.status(200).json({
      success: true,
      count: history.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
