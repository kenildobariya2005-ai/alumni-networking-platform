import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import { sanitizeTags } from '../validators/postValidator.js';

// Safe fields for populating author information (never exposes passwords, tokens, or private credentials)
export const SAFE_AUTHOR_FIELDS = '_id fullName profilePicture role';

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private (student, alumni, admin)
 */
export const createPost = async (req, res, next) => {
  try {
    const { content, image, tags, visibility } = req.body;

    const processedTags = sanitizeTags(tags);
    const postContent = content ? String(content).trim() : '';
    const postImage = image ? String(image).trim() : '';
    const postVisibility = visibility ? String(visibility).toLowerCase().trim() : 'public';

    const post = await Post.create({
      author: req.user._id,
      content: postContent,
      image: postImage,
      tags: processedTags,
      visibility: postVisibility,
      likes: [],
      likesCount: 0,
      commentsCount: 0,
      status: 'active',
    });

    await post.populate('author', SAFE_AUTHOR_FIELDS);

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all posts (Feed) with filtering, search, sorting, and pagination
 * @route   GET /api/posts
 * @access  Public / Private
 */
export const getAllPosts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      tag,
      search,
      author,
      visibility,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Base query: only non-deleted posts
    const query = {
      status: { $ne: 'deleted' },
    };

    // Filter by tag (case-insensitive)
    if (tag) {
      query.tags = tag.toLowerCase().trim();
    }

    // Filter by author ID
    if (author && mongoose.Types.ObjectId.isValid(author)) {
      query.author = author;
    }

    // Filter by visibility
    if (visibility) {
      query.visibility = visibility.toLowerCase().trim();
    }

    // Search by keyword across content and tags
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ content: searchRegex }, { tags: searchRegex }];
    }

    // Determine sort ordering
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'popular' || sort === 'likes') {
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
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    return res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      data: {
        posts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPosts,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search posts by content and tags with pagination
 * @route   GET /api/posts/search
 * @access  Public / Private
 */
export const searchPosts = async (req, res, next) => {
  try {
    const {
      search,
      tag,
      author,
      page = 1,
      limit = 10,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Filter out soft-deleted posts
    const query = {
      status: { $ne: 'deleted' },
    };

    // Filter by tag
    if (tag) {
      query.tags = tag.toLowerCase().trim();
    }

    // Filter by author
    if (author && mongoose.Types.ObjectId.isValid(author)) {
      query.author = author;
    }

    // Search query on content and tags
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ content: searchRegex }, { tags: searchRegex }];
    }

    // Sort order
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'popular' || sort === 'likes') {
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
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    return res.status(200).json({
      success: true,
      message: 'Posts matching search criteria fetched successfully',
      data: {
        posts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPosts,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get authenticated user's own posts
 * @route   GET /api/posts/my/posts
 * @access  Private (student, alumni, admin)
 */
export const getMyPosts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      author: req.user._id,
      status: { $ne: 'deleted' },
    };

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'popular' || sort === 'likes') {
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
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    return res.status(200).json({
      success: true,
      message: 'My posts fetched successfully',
      data: {
        posts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalPosts,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single post by ID
 * @route   GET /api/posts/:id
 * @access  Public / Private
 */
export const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const post = await Post.findOne({ _id: id, status: { $ne: 'deleted' } })
      .populate('author', SAFE_AUTHOR_FIELDS)
      .populate('likes', SAFE_AUTHOR_FIELDS);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Post fetched successfully',
      data: {
        post,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update post (Only author can edit, Admin may moderate)
 * @route   PUT /api/posts/:id
 * @access  Private (Author or Admin)
 */
export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const post = await Post.findById(id);
    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found or has been deleted',
      });
    }

    // Role check: Only author can update, Admin may moderate.
    // Users cannot change another user's post.
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to update this post. Users cannot change another user's post.",
      });
    }

    const { content, image, tags, visibility } = req.body;

    // Apply allowed updates only (immutable fields are protected)
    if (content !== undefined) {
      post.content = String(content).trim();
    }

    if (image !== undefined) {
      post.image = String(image).trim();
    }

    if (tags !== undefined) {
      post.tags = sanitizeTags(tags);
    }

    if (visibility !== undefined) {
      post.visibility = String(visibility).toLowerCase().trim();
    }

    // Ensure at least content or image is present
    if (!post.content && !post.image) {
      return res.status(400).json({
        success: false,
        message: 'Post must contain at least content or an image',
      });
    }

    await post.save();
    await post.populate('author', SAFE_AUTHOR_FIELDS);

    return res.status(200).json({
      success: true,
      message: isAdmin && !isAuthor ? 'Post moderated successfully by admin' : 'Post updated successfully',
      data: {
        post,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete post (status = 'deleted')
 * @route   DELETE /api/posts/:id
 * @access  Private (Author or Admin)
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
    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found or already deleted',
      });
    }

    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this post. Users cannot delete another user's post.",
      });
    }

    // Soft deletion: Set status = 'deleted' instead of physical removal
    post.status = 'deleted';
    await post.save();

    return res.status(200).json({
      success: true,
      message: isAdmin && !isAuthor ? 'Post moderated and deleted by admin' : 'Post deleted successfully',
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
 * @desc    Like a post (Prevents duplicates, maintains likesCount, creates Notification)
 * @route   POST /api/posts/:id/like or PUT /api/posts/:id/like
 * @access  Private
 */
export const likePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const post = await Post.findOne({ _id: id, status: { $ne: 'deleted' } });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or has been deleted',
      });
    }

    const userIdStr = req.user._id.toString();
    const isAlreadyLiked = post.likes.some((likeId) => likeId.toString() === userIdStr);

    if (!isAlreadyLiked) {
      post.likes.push(req.user._id);
      post.likesCount = post.likes.length;
      await post.save();

      // Create database notification for post author (if liker != post author)
      if (post.author.toString() !== userIdStr) {
        try {
          await Notification.create({
            recipient: post.author,
            title: 'New Like',
            message: `${req.user.fullName || 'Someone'} liked your post.`,
            type: 'Social',
            isRead: false,
          });
        } catch (notifErr) {
          console.error(`Failed to create like notification: ${notifErr.message}`);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: isAlreadyLiked ? 'Post is already liked' : 'Post liked successfully',
      data: {
        likesCount: post.likesCount,
        isLiked: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unlike a post (Safe if not liked, maintains likesCount)
 * @route   POST /api/posts/:id/unlike or PUT /api/posts/:id/unlike
 * @access  Private
 */
export const unlikePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const post = await Post.findOne({ _id: id, status: { $ne: 'deleted' } });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or has been deleted',
      });
    }

    const userIdStr = req.user._id.toString();
    const isLiked = post.likes.some((likeId) => likeId.toString() === userIdStr);

    if (isLiked) {
      post.likes = post.likes.filter((likeId) => likeId.toString() !== userIdStr);
      post.likesCount = Math.max(0, post.likes.length);
      await post.save();
    }

    return res.status(200).json({
      success: true,
      message: isLiked ? 'Post unliked successfully' : 'Post was not liked',
      data: {
        likesCount: post.likesCount,
        isLiked: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle like / unlike on a post
 * @route   PUT /api/posts/:id/toggle-like
 * @access  Private
 */
export const toggleLikePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format',
      });
    }

    const post = await Post.findOne({ _id: id, status: { $ne: 'deleted' } });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or has been deleted',
      });
    }

    const userIdStr = req.user._id.toString();
    const isLiked = post.likes.some((likeId) => likeId.toString() === userIdStr);

    if (isLiked) {
      post.likes = post.likes.filter((likeId) => likeId.toString() !== userIdStr);
    } else {
      post.likes.push(req.user._id);

      // Create notification on new like
      if (post.author.toString() !== userIdStr) {
        try {
          await Notification.create({
            recipient: post.author,
            title: 'New Like',
            message: `${req.user.fullName || 'Someone'} liked your post.`,
            type: 'Social',
            isRead: false,
          });
        } catch (notifErr) {
          console.error(`Failed to create like notification: ${notifErr.message}`);
        }
      }
    }

    post.likesCount = Math.max(0, post.likes.length);
    await post.save();

    return res.status(200).json({
      success: true,
      message: isLiked ? 'Post unliked successfully' : 'Post liked successfully',
      data: {
        likesCount: post.likesCount,
        isLiked: !isLiked,
      },
    });
  } catch (error) {
    next(error);
  }
};
