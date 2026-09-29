import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
  updateProjectStatus,
  searchProjects,
} from '../controllers/projectController.js';
import {
  applyToProject,
  getProjectApplications,
} from '../controllers/projectApplicationController.js';
import {
  createProjectValidator,
  updateProjectValidator,
  updateProjectStatusValidator,
} from '../validators/projectValidator.js';
import { applyProjectValidator } from '../validators/projectApplicationValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// 1. Static Sub-paths (MUST be declared before dynamic /:id parameter)
router.get('/search', searchProjects);
router.get(
  '/my',
  protect,
  authorizeRoles('alumni', 'student', 'admin'),
  getMyProjects
);

// 2. Project List & Creation
router
  .route('/')
  .post(
    protect,
    authorizeRoles('alumni'),
    createProjectValidator,
    createProject
  )
  .get(getProjects);

// 3. Nested Project Application Routes on /:projectId
router.post(
  '/:projectId/apply',
  protect,
  authorizeRoles('student'),
  applyProjectValidator,
  applyToProject
);

router.get(
  '/:projectId/applications',
  protect,
  authorizeRoles('alumni', 'admin'),
  getProjectApplications
);

// 4. Single Project Operations
router
  .route('/:id')
  .get(getProjectById)
  .put(
    protect,
    authorizeRoles('alumni'),
    updateProjectValidator,
    updateProject
  )
  .delete(
    protect,
    authorizeRoles('alumni', 'admin'),
    deleteProject
  );

// 5. Update Status
router.patch(
  '/:id/status',
  protect,
  authorizeRoles('alumni'),
  updateProjectStatusValidator,
  updateProjectStatus
);

export default router;
