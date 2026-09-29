import express from 'express';
import {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getUserStatistics,
} from '../controllers/adminUserController.js';
import {
  objectIdParamValidator,
  updateUserStatusValidator,
  adminListQueryValidator,
} from '../validators/adminValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Strict Admin-only authorization
router.use(protect, authorizeRoles('admin'));

/**
 * @route   GET /api/admin/users/stats
 * @desc    Get user distribution stats
 * @access  Private (Admin only)
 */
router.get('/stats', getUserStatistics);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with search, filtering, and pagination
 * @access  Private (Admin only)
 */
router.get('/', adminListQueryValidator, getUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user details with full profile
 * @access  Private (Admin only)
 */
router.get('/:id', objectIdParamValidator, getUserById);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Activate or deactivate user account
 * @access  Private (Admin only)
 */
router.patch('/:id/status', updateUserStatusValidator, updateUserStatus);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Soft-delete / deactivate user account
 * @access  Private (Admin only)
 */
router.delete('/:id', objectIdParamValidator, deleteUser);

export default router;
