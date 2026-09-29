import express from 'express';
import {
  createMentorshipRequest,
  getMyMentorshipRequests,
  getIncomingMentorshipRequests,
  getMentorshipHistory,
  getMentorshipById,
  acceptMentorshipRequest,
  rejectMentorshipRequest,
  cancelMentorshipRequest,
  scheduleMentorship,
  completeMentorship,
  submitMentorshipFeedback,
} from '../controllers/mentorshipController.js';
import {
  createMentorshipRequestValidator,
  scheduleMentorshipValidator,
  submitFeedbackValidator,
  mentorshipIdParamValidator,
} from '../validators/mentorshipValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All mentorship routes require authentication
router.use(protect);

// 1. Static sub-paths (Must be defined BEFORE /:id to avoid matching conflicts)
// Student: Create mentorship request
router.post(
  '/request',
  authorizeRoles('student'),
  createMentorshipRequestValidator,
  createMentorshipRequest
);

// Student: View own mentorship requests
router.get(
  '/my-requests',
  authorizeRoles('student'),
  getMyMentorshipRequests
);

// Alumni: View incoming mentorship requests
router.get(
  '/incoming',
  authorizeRoles('alumni'),
  getIncomingMentorshipRequests
);

// Student & Alumni (and Admin): View completed mentorship history
router.get(
  '/history',
  authorizeRoles('student', 'alumni', 'admin'),
  getMentorshipHistory
);

// 2. Parametric routes (/:id)
// Authenticated student/alumni who belongs to the mentorship, or admin
router.get(
  '/:id',
  mentorshipIdParamValidator,
  getMentorshipById
);

// Alumni: Accept mentorship request
router.patch(
  '/:id/accept',
  authorizeRoles('alumni'),
  mentorshipIdParamValidator,
  acceptMentorshipRequest
);

// Alumni: Reject mentorship request
router.patch(
  '/:id/reject',
  authorizeRoles('alumni'),
  mentorshipIdParamValidator,
  rejectMentorshipRequest
);

// Student: Cancel pending request
router.patch(
  '/:id/cancel',
  authorizeRoles('student'),
  mentorshipIdParamValidator,
  cancelMentorshipRequest
);

// Alumni: Schedule mentorship session
router.patch(
  '/:id/schedule',
  authorizeRoles('alumni'),
  mentorshipIdParamValidator,
  scheduleMentorshipValidator,
  scheduleMentorship
);

// Alumni: Mark mentorship session as completed
router.patch(
  '/:id/complete',
  authorizeRoles('alumni'),
  mentorshipIdParamValidator,
  completeMentorship
);

// Student: Submit feedback after completion
router.post(
  '/:id/feedback',
  authorizeRoles('student'),
  mentorshipIdParamValidator,
  submitFeedbackValidator,
  submitMentorshipFeedback
);

export default router;
