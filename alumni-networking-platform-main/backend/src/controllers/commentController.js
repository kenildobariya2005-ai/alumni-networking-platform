import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { SAFE_AUTHOR_FIELDS } from './postController.js';

/**
 * @desc    Create a new comment on a post
 * @route   POST /api/posts/:postId/comments
 * @access  Private (student, alumni, admin)
 */
export const createComment = async (req, res, next) => {
  try {
    const postId = req.params.postId || req.body.postId;
    const { content } = req.body;

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing post ID format',
      });
    }

    // Check if the target post exists and is not deleted
    const post = await Post.findById(postId);
    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Cannot comment on a non-existent or deleted post',
      });
    }

    // Create comment
    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: String(content).trim(),
      status: 'active',
    });

    // Increment commentsCount on Post atomically
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    // Populate author with safe fields
    await comment.populate('author', SAFE_AUTHOR_FIELDS);

    // Create database notification for post author (if commenter != post author)
    if (post.author.toString() !== req.user._id.toString()) {
      try {
        const preview = comment.content.length > 50 
          ? `${comment.content.substring(0, 50)}...` 
          : comment.content;
        await Notification.create({
          recipient: post.author,
          title: 'New Comment',
          message: `${req.user.fullName || 'Someone'} commented on your post: "${preview}"`,
          type: 'Social',
          isRead: false,
        });
      } catch (notifErr) {
        console.error(`Failed to create comment notification: ${notifErr.message}`);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all comments for a specific post
 * @route   GET /api/posts/:postId/comments
 * @access  Public / Private
 */
export const getCommentsByPost = async (req, res, next) => {
  try {
    const postId = req.params.postId || req.query.postId;

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing post ID format',
      });
    }

    // Check if post exists and is not deleted
    const post = await Post.findById(postId);
    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found or has been deleted',
      });
    }

    const { page = 1, limit = 50, sort = 'oldest' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const sortOption = sort === 'newest' ? { createdAt: -1 } : { createdAt: 1 };

    const query = {
      post: postId,
      status: { $ne: 'deleted' },
    };

    const [comments, totalComments] = await Promise.all([
      Comment.find(query)
        .populate('author', SAFE_AUTHOR_FIELDS)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Comment.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalComments / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: 'Comments fetched successfully',
      data: {
        comments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalComments,
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
 * @desc    Update own comment
 * @route   PUT /api/comments/:id
 * @access  Private (Comment Author only)
 */
export const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment ID format',
      });
    }

    const comment = await Comment.findById(id);
    if (!comment || comment.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or has been deleted',
      });
    }

    // Only the comment author can update their comment
    const isAuthor = comment.author.toString() === req.user._id.toString();
    if (!isAuthor) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own comment',
      });
    }

    comment.content = String(content).trim();
    await comment.save();

    await comment.populate('author', SAFE_AUTHOR_FIELDS);

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: {
        comment,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete comment (Author can delete own comment, Admin can moderate)
 * @route   DELETE /api/comments/:id
 * @access  Private (Comment Author or Admin)
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
    if (!comment || comment.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or has been deleted',
      });
    }

    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    // Only the comment author or Admin can delete
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own comment',
      });
    }

    const postId = comment.post;

    // Delete comment document
    await comment.deleteOne();

    // Decrement commentsCount on Post atomically (ensuring >= 0)
    await Post.findOneAndUpdate(
      { _id: postId, commentsCount: { $gt: 0 } },
      { $inc: { commentsCount: -1 } }
    );

    return res.status(200).json({
      success: true,
      message: isAdmin && !isAuthor ? 'Comment moderated and deleted by admin' : 'Comment deleted successfully',
      data: {
        commentId: id,
      },
    });
  } catch (error) {
    next(error);
  }
};
