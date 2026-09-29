import api from './api.js';

/**
 * Community Feed & Posts API Service
 */
export const communityService = {
  /**
   * Get all feed posts
   * @param {object} [params] { page, limit, tag, search, author, visibility, sort }
   * @returns {Promise<{ success: boolean, message: string, data: { posts: Array, pagination: object } }>}
   */
  getPosts: async (params = {}) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  /**
   * Get single post by ID
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { post: object } }>}
   */
  getPostById: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  /**
   * Create a new post
   * @param {object} data { content, image, tags, visibility }
   * @returns {Promise<{ success: boolean, message: string, data: { post: object } }>}
   */
  createPost: async (data) => {
    const response = await api.post('/posts', data);
    return response.data;
  },

  /**
   * Update post (Author or Admin)
   * @param {string} id
   * @param {object} data { content, image, tags, visibility }
   * @returns {Promise<{ success: boolean, message: string, data: { post: object } }>}
   */
  updatePost: async (id, data) => {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  },

  /**
   * Soft delete post (Author or Admin)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { postId: string, status: string } }>}
   */
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  /**
   * Get user's own posts
   * @param {object} [params] { page, limit, sort }
   * @returns {Promise<{ success: boolean, message: string, data: { posts: Array, pagination: object } }>}
   */
  getMyPosts: async (params = {}) => {
    const response = await api.get('/posts/my/posts', { params });
    return response.data;
  },

  /**
   * Like a post
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { likesCount: number, isLiked: boolean } }>}
   */
  likePost: async (id) => {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  },

  /**
   * Unlike a post
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { likesCount: number, isLiked: boolean } }>}
   */
  unlikePost: async (id) => {
    const response = await api.post(`/posts/${id}/unlike`);
    return response.data;
  },

  /**
   * Toggle like / unlike on a post
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { likesCount: number, isLiked: boolean } }>}
   */
  toggleLikePost: async (id) => {
    const response = await api.put(`/posts/${id}/toggle-like`);
    return response.data;
  },

  /**
   * Get comments for a post
   * @param {string} postId
   * @param {object} [params] { page, limit, sort }
   * @returns {Promise<{ success: boolean, message: string, data: { comments: Array, pagination: object } }>}
   */
  getComments: async (postId, params = {}) => {
    const response = await api.get(`/posts/${postId}/comments`, { params });
    return response.data;
  },

  /**
   * Add a comment to a post
   * @param {string} postId
   * @param {object} data { content }
   * @returns {Promise<{ success: boolean, message: string, data: { comment: object } }>}
   */
  createComment: async (postId, data) => {
    const response = await api.post(`/posts/${postId}/comments`, data);
    return response.data;
  },

  /**
   * Update own comment
   * @param {string} commentId
   * @param {object} data { content }
   * @returns {Promise<{ success: boolean, message: string, data: { comment: object } }>}
   */
  updateComment: async (commentId, data) => {
    const response = await api.put(`/comments/${commentId}`, data);
    return response.data;
  },

  /**
   * Delete comment (Author or Admin)
   * @param {string} commentId
   * @returns {Promise<{ success: boolean, message: string, data: { commentId: string } }>}
   */
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};

export default communityService;
