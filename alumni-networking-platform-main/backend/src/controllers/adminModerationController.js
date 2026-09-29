import mongoose from 'mongoose';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { logAdminAction } from '../utils/auditLogger.js';

const SAFE_AUTHOR_FIELDS = '_id fullName email profilePicture role';

/**
 * @desc    Get all posts for moderation review (including hidden and deleted)
 * @route   GET /api/admin/moderation/posts
 * @access  Private (Admin only)
 */
export const getReportedOrFlaggedContent = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      author,
      search,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (author && mongoose.Types.ObjectId.isValid(author)) {
      query.author = author;
    }

    if (search && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ content: searchRegex }, { tags: searchRegex }];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'reports' || sort === 'likes') {
      sortOption = { likesCount: -1, createdAt: -1 };
    }

    const [posts, totalPosts] = await Promise.all([
      Post.find(query)
        .populate('author', SAFE_AUTHOR_FIELDS)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Post.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalPosts / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: 'Moderation posts fetched successfully',
      data: {
        posts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPosts,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Hide a post from public view (Moderation)
 * @route   PATCH /api/admin/moderation/posts/:id/hide
 * @access  Private (Admin only)
 */
export const hidePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.status = 'hidden';
    await post.save();

    // Log admin audit action
    await logAdminAction({
      adminId: req.user._id,
      action: 'POST_HIDDEN',
      targetType: 'Post',
      targetId: post._id,
      description: `Post by author ${post.author} was hidden by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    return res.status(200).json({
      success: true,
      message: 'Post hidden successfully',
      data: {
        postId: id,
        status: 'hidden',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restore a hidden or deleted post
 * @route   PATCH /api/admin/moderation/posts/:id/restore
 * @access  Private (Admin only)
 */
export const restorePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.status = 'active';
    await post.save();

    // Log admin audit action
    await logAdminAction({
      adminId: req.user._id,
      action: 'POST_RESTORED',
      targetType: 'Post',
      targetId: post._id,
      description: `Post by author ${post.author} was restored to active status by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    return res.status(200).json({
      success: true,
      message: 'Post restored successfully',
      data: {
        postId: id,
        status: 'active',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft-delete a post (Moderation)
 * @route   DELETE /api/admin/moderation/posts/:id
 * @access  Private (Admin only)
 */
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.status = 'deleted';
    await post.save();

    // Log admin audit action
    await logAdminAction({
      adminId: req.user._id,
      action: 'POST_DELETED',
      targetType: 'Post',
      targetId: post._id,
      description: `Post was soft-deleted by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    return res.status(200).json({
      success: true,
      message: 'Post soft-deleted successfully by admin',
      data: {
        postId: id,
        status: 'deleted',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Hide a comment (Moderation)
 * @route   PATCH /api/admin/moderation/comments/:id/hide
 * @access  Private (Admin only)
 */
export const hideComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID format',
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    comment.status = 'hidden';
    await comment.save();

    // Log admin audit action
    await logAdminAction({
      adminId: req.user._id,
      action: 'COMMENT_HIDDEN',
      targetType: 'Comment',
      targetId: comment._id,
      description: `Comment on post ${comment.post} was hidden by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    return res.status(200).json({
      success: true,
      message: 'Comment hidden successfully',
      data: {
        commentId: id,
        status: 'hidden',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restore a comment
 * @route   PATCH /api/admin/moderation/comments/:id/restore
 * @access  Private (Admin only)
 */
export const restoreComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID format',
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    comment.status = 'active';
    await comment.save();

    // Log admin audit action
    await logAdminAction({
      adminId: req.user._id,
      action: 'COMMENT_RESTORED',
      targetType: 'Comment',
      targetId: comment._id,
      description: `Comment on post ${comment.post} was restored by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    return res.status(200).json({
      success: true,
      message: 'Comment restored successfully',
      data: {
        commentId: id,
        status: 'active',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft-delete a comment (Moderation)
 * @route   DELETE /api/admin/moderation/comments/:id
 * @access  Private (Admin only)
 */
export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID format',
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    comment.status = 'deleted';
    await comment.save();

    // Decrement post commentsCount
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

    // Log admin audit action
    await logAdminAction({
      adminId: req.user._id,
      action: 'COMMENT_DELETED',
      targetType: 'Comment',
      targetId: comment._id,
      description: `Comment on post ${comment.post} was soft-deleted by admin.`,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully by admin',
      data: {
        commentId: id,
        status: 'deleted',
      },
    });
  } catch (error) {
    next(error);
  }
};
