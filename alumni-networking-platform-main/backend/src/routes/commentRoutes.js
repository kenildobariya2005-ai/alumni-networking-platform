import express from 'express';
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';
import {
  createCommentValidator,
  updateCommentValidator,
} from '../validators/commentValidator.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router({ mergeParams: true });

/**
 * Comment Endpoints:
 * - POST   /api/posts/:postId/comments -> Create comment
 * - GET    /api/posts/:postId/comments -> Get comments
 * - PUT    /api/comments/:id           -> Update own comment
 * - DELETE /api/comments/:id           -> Delete own comment (or admin moderation)
 */

// Handle nested route from postRoutes: /api/posts/:postId/comments
router
  .route('/')
  .post(
    protect,
    authorizeRoles('student', 'alumni', 'admin'),
    createCommentValidator,
    createComment
  )
  .get(getCommentsByPost);

// Handle direct routes mounted under /api/comments
router.post(
  ['/:postId/comments', '/posts/:postId/comments', '/post/:postId'],
  protect,
  authorizeRoles('student', 'alumni', 'admin'),
  createCommentValidator,
  createComment
);

router.get(
  ['/:postId/comments', '/posts/:postId/comments', '/post/:postId'],
  getCommentsByPost
);

// Individual comment operations: /api/comments/:id
router
  .route('/:id')
  .put(
    protect,
    authorizeRoles('student', 'alumni', 'admin'),
    updateCommentValidator,
    updateComment
  )
  .delete(
    protect,
    authorizeRoles('student', 'alumni', 'admin'),
    deleteComment
  );

export default router;
