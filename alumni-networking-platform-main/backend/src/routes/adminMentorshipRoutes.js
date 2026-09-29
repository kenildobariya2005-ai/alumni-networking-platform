import express from 'express';
import {
  getAllMentorshipRequests,
  getMentorshipStatistics,
} from '../controllers/adminMentorshipController.js';
import { adminListQueryValidator } from '../validators/adminValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Strict Admin-only authorization
router.use(protect, authorizeRoles('admin'));

/**
 * @route   GET /api/admin/mentorship/statistics
 * @desc    Get aggregate mentorship metrics and top mentors
 * @access  Private (Admin only)
 */
router.get('/statistics', getMentorshipStatistics);

/**
 * @route   GET /api/admin/mentorship
 * @desc    Get all mentorship requests with status and user filtering
 * @access  Private (Admin only)
 */
router.get('/', adminListQueryValidator, getAllMentorshipRequests);

export default router;
