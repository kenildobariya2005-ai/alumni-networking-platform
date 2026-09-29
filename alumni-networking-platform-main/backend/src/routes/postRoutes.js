import express from 'express';
import {
  createPost,
  getAllPosts,
  searchPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  toggleLikePost,
} from '../controllers/postController.js';
import {
  createPostValidator,
  updatePostValidator,
} from '../validators/postValidator.js';
import commentRoutes from './commentRoutes.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Forward nested comment routes: /api/posts/:postId/comments -> commentRoutes
router.use('/:postId/comments', commentRoutes);

// 1. Static sub-paths (MUST be defined before /:id parameter to avoid matching conflicts)
router.get('/search', searchPosts);
router.get('/my/posts', protect, authorizeRoles('student', 'alumni', 'admin'), getMyPosts);
router.get('/my', protect, authorizeRoles('student', 'alumni', 'admin'), getMyPosts);

// 2. Feed & Post Creation
router
  .route('/')
  .post(
    protect,
    authorizeRoles('student', 'alumni', 'admin'),
    createPostValidator,
    createPost
  )
  .get(getAllPosts);

// 3. Like / Unlike actions on specific post (Defined before /:id or on /:id routes)
router.post('/:id/like', protect, authorizeRoles('student', 'alumni', 'admin'), likePost);
router.put('/:id/like', protect, authorizeRoles('student', 'alumni', 'admin'), toggleLikePost);
router.post('/:id/unlike', protect, authorizeRoles('student', 'alumni', 'admin'), unlikePost);
router.put('/:id/unlike', protect, authorizeRoles('student', 'alumni', 'admin'), unlikePost);
router.put('/:id/toggle-like', protect, authorizeRoles('student', 'alumni', 'admin'), toggleLikePost);

// 4. Single Post Operations
router
  .route('/:id')
  .get(getPostById)
  .put(
    protect,
    authorizeRoles('student', 'alumni', 'admin'),
    updatePostValidator,
    updatePost
  )
  .delete(
    protect,
    authorizeRoles('student', 'alumni', 'admin'),
    deletePost
  );

export default router;
