import express from 'express';
import {
  getAllProjects,
  deleteProject,
  updateProjectStatus,
} from '../controllers/adminProjectController.js';
import {
  objectIdParamValidator,
  updateProjectStatusValidator,
  adminProjectsQueryValidator,
} from '../validators/adminValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Strict Admin-only authorization
router.use(protect, authorizeRoles('admin'));

/**
 * @route   GET /api/admin/projects
 * @desc    Get all projects with team and status filtering
 * @access  Private (Admin only)
 */
router.get('/', adminProjectsQueryValidator, getAllProjects);

/**
 * @route   PATCH /api/admin/projects/:id/status
 * @desc    Update project collaboration status
 * @access  Private (Admin only)
 */
router.patch('/:id/status', updateProjectStatusValidator, updateProjectStatus);

/**
 * @route   DELETE /api/admin/projects/:id
 * @desc    Soft delete a project
 * @access  Private (Admin only)
 */
router.delete('/:id', objectIdParamValidator, deleteProject);

export default router;
