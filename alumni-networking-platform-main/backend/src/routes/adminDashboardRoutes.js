import express from 'express';
import {
  getDashboardStatistics,
  getDashboardActivity,
  getDashboardAnalytics,
} from '../controllers/adminDashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Strict Admin-only authorization
router.use(protect, authorizeRoles('admin'));

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get comprehensive platform counts and core metrics
 * @access  Private (Admin only)
 */
router.get('/stats', getDashboardStatistics);

/**
 * @route   GET /api/admin/dashboard/activity
 * @desc    Get recent platform registrations, pending alumni, jobs, mentorship, and logs
 * @access  Private (Admin only)
 */
router.get('/activity', getDashboardActivity);

/**
 * @route   GET /api/admin/dashboard/analytics
 * @desc    Get platform distribution, status breakdowns, and module analytics
 * @access  Private (Admin only)
 */
router.get('/analytics', getDashboardAnalytics);

export default router;

