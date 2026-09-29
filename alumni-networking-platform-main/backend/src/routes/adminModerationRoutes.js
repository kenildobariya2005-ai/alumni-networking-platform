import express from 'express';
import {
  getReportedOrFlaggedContent,
  hidePost,
  restorePost,
  deletePost,
  hideComment,
  restoreComment,
  deleteComment,
} from '../controllers/adminModerationController.js';
import {
  objectIdParamValidator,
  adminListQueryValidator,
} from '../validators/adminValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Strict Admin-only authorization
router.use(protect, authorizeRoles('admin'));

/**
 * @route   GET /api/admin/moderation/posts
 * @desc    Get all posts (including hidden/flagged/deleted) for moderation
 * @access  Private (Admin only)
 */
router.get('/posts', adminListQueryValidator, getReportedOrFlaggedContent);

/**
 * @route   PATCH /api/admin/moderation/posts/:id/hide
 * @desc    Hide a post from feeds
 * @access  Private (Admin only)
 */
router.patch('/posts/:id/hide', objectIdParamValidator, hidePost);

/**
 * @route   PATCH /api/admin/moderation/posts/:id/restore
 * @desc    Restore a hidden or deleted post to active
 * @access  Private (Admin only)
 */
router.patch('/posts/:id/restore', objectIdParamValidator, restorePost);

/**
 * @route   DELETE /api/admin/moderation/posts/:id
 * @desc    Soft-delete a post
 * @access  Private (Admin only)
 */
router.delete('/posts/:id', objectIdParamValidator, deletePost);

/**
 * @route   PATCH /api/admin/moderation/comments/:id/hide
 * @desc    Hide a comment from feeds
 * @access  Private (Admin only)
 */
router.patch('/comments/:id/hide', objectIdParamValidator, hideComment);

/**
 * @route   PATCH /api/admin/moderation/comments/:id/restore
 * @desc    Restore a comment to active
 * @access  Private (Admin only)
 */
router.patch('/comments/:id/restore', objectIdParamValidator, restoreComment);

/**
 * @route   DELETE /api/admin/moderation/comments/:id
 * @desc    Soft-delete a comment
 * @access  Private (Admin only)
 */
router.delete('/comments/:id', objectIdParamValidator, deleteComment);

export default router;
