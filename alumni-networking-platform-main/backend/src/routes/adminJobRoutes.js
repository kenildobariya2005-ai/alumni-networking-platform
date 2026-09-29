import express from 'express';
import {
  getAllJobs,
  deleteJob,
  closeJob,
  reopenJob,
} from '../controllers/adminJobController.js';
import {
  objectIdParamValidator,
  adminJobsQueryValidator,
} from '../validators/adminValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Strict Admin-only authorization
router.use(protect, authorizeRoles('admin'));

/**
 * @route   GET /api/admin/jobs
 * @desc    Get all jobs with filtering and application metrics
 * @access  Private (Admin only)
 */
router.get('/', adminJobsQueryValidator, getAllJobs);

/**
 * @route   PATCH /api/admin/jobs/:id/close
 * @desc    Close a job posting
 * @access  Private (Admin only)
 */
router.patch('/:id/close', objectIdParamValidator, closeJob);

/**
 * @route   PATCH /api/admin/jobs/:id/reopen
 * @desc    Reopen a closed job posting
 * @access  Private (Admin only)
 */
router.patch('/:id/reopen', objectIdParamValidator, reopenJob);

/**
 * @route   DELETE /api/admin/jobs/:id
 * @desc    Delete a job posting and its applications
 * @access  Private (Admin only)
 */
router.delete('/:id', objectIdParamValidator, deleteJob);

export default router;
