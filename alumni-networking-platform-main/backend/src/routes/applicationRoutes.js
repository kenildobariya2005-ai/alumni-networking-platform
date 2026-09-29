import express from 'express';
import {
  applyJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import {
  applyJobValidator,
  updateApplicationStatusValidator,
} from '../validators/applicationValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All application routes require authentication
router.use(protect);

/**
 * Route mapping supports both direct /api/applications and /api/jobs paths:
 * - POST   /api/jobs/:jobId/apply
 * - GET    /api/applications/me
 * - GET    /api/jobs/:jobId/applications
 * - PATCH  /api/applications/:id/status
 */

// Student applies for a job
router.post(
  ['/jobs/:jobId/apply', '/:jobId/apply', '/job/:jobId/apply'],
  authorizeRoles('student'),
  applyJobValidator,
  applyJob
);

// Student views their own submitted applications
router.get(
  ['/me', '/applications/me'],
  authorizeRoles('student'),
  getMyApplications
);

// Alumni / Admin views applications for a specific job posting
router.get(
  ['/jobs/:jobId/applications', '/:jobId/applications', '/job/:jobId/applications'],
  authorizeRoles('alumni', 'admin'),
  getJobApplications
);

// Alumni / Admin updates application status (Reviewing, Shortlisted, Accepted, Rejected)
router.patch(
  ['/:id/status', '/applications/:id/status'],
  authorizeRoles('alumni', 'admin'),
  updateApplicationStatusValidator,
  updateApplicationStatus
);

export default router;
