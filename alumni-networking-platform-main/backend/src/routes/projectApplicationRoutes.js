import express from 'express';
import {
  applyToProject,
  getMyProjectApplications,
  getProjectApplications,
  acceptProjectApplication,
  rejectProjectApplication,
  withdrawProjectApplication,
} from '../controllers/projectApplicationController.js';
import { applyProjectValidator } from '../validators/projectApplicationValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router({ mergeParams: true });

// All project application routes require authentication
router.use(protect);

/**
 * Project Application Routes:
 * - POST   /api/projects/:projectId/apply
 * - GET    /api/projects/:projectId/applications
 * - GET    /api/project-applications/me
 * - PATCH  /api/project-applications/:id/accept
 * - PATCH  /api/project-applications/:id/reject
 * - PATCH  /api/project-applications/:id/withdraw
 */

// Student views their own submitted project applications
router.get(
  ['/me', '/applications/me'],
  authorizeRoles('student'),
  getMyProjectApplications
);

// Student applies to a project (supports nested /:projectId/apply or direct routes)
router.post(
  ['/:projectId/apply', '/projects/:projectId/apply', '/apply'],
  authorizeRoles('student'),
  applyProjectValidator,
  applyToProject
);

// Alumni creator or Admin views applications for a project
router.get(
  ['/:projectId/applications', '/projects/:projectId/applications', '/applications'],
  authorizeRoles('alumni', 'admin'),
  getProjectApplications
);

// Alumni accepts a pending project application
router.patch(
  ['/:id/accept', '/applications/:id/accept'],
  authorizeRoles('alumni'),
  acceptProjectApplication
);

// Alumni rejects a pending project application
router.patch(
  ['/:id/reject', '/applications/:id/reject'],
  authorizeRoles('alumni'),
  rejectProjectApplication
);

// Student withdraws their own pending application
router.patch(
  ['/:id/withdraw', '/applications/:id/withdraw'],
  authorizeRoles('student'),
  withdrawProjectApplication
);

export default router;
