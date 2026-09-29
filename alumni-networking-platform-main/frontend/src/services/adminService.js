import api from './api.js';

/**
 * Admin Management API Service
 */
export const adminService = {
  /**
   * Get comprehensive dashboard statistics
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  /**
   * Get real-time platform activity
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  getDashboardActivity: async () => {
    const response = await api.get('/admin/dashboard/activity');
    return response.data;
  },

  /**
   * Get aggregate platform analytics
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  getDashboardAnalytics: async () => {
    const response = await api.get('/admin/dashboard/analytics');
    return response.data;
  },

  /**
   * Get user management list with search, filter, and pagination
   * @param {object} [params] { page, limit, role, search, isActive, isVerified, sort }
   * @returns {Promise<{ success: boolean, message: string, data: { users: Array, pagination: object } }>}
   */
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Get single user details and profile
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { user: object, profile: object } }>}
   */
  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Activate or deactivate user account
   * @param {string} id
   * @param {boolean} isActive
   * @returns {Promise<{ success: boolean, message: string, data: { user: object } }>}
   */
  updateUserStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/users/${id}/status`, { isActive });
    return response.data;
  },

  /**
   * Soft-delete / deactivate user account
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { userId: string, isActive: boolean } }>}
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Verify alumni account
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  verifyAlumni: async (id) => {
    const response = await api.patch(`/admin/alumni/${id}/verify`);
    return response.data;
  },

  /**
   * Remove alumni verification
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  unverifyAlumni: async (id) => {
    const response = await api.patch(`/admin/alumni/${id}/unverify`);
    return response.data;
  },

  /**
   * Get user distribution statistics
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  getUserStatistics: async () => {
    const response = await api.get('/admin/users/stats');
    return response.data;
  },

  /**
   * Get all platform jobs for admin management
   * @param {object} [params] { page, limit, status, jobType, company, search, sort }
   * @returns {Promise<{ success: boolean, message: string, data: { jobs: Array, pagination: object } }>}
   */
  getAllJobs: async (params = {}) => {
    const response = await api.get('/admin/jobs', { params });
    return response.data;
  },

  /**
   * Close a job posting (Admin)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { job: object } }>}
   */
  closeJob: async (id) => {
    const response = await api.patch(`/admin/jobs/${id}/close`);
    return response.data;
  },

  /**
   * Reopen a closed job posting (Admin)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { job: object } }>}
   */
  reopenJob: async (id) => {
    const response = await api.patch(`/admin/jobs/${id}/reopen`);
    return response.data;
  },

  /**
   * Delete a job posting (Admin)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { jobId: string } }>}
   */
  deleteJob: async (id) => {
    const response = await api.delete(`/admin/jobs/${id}`);
    return response.data;
  },

  /**
   * Get all platform projects for admin management
   * @param {object} [params] { page, limit, status, category, search, includeDeleted, sort }
   * @returns {Promise<{ success: boolean, message: string, data: { projects: Array, pagination: object } }>}
   */
  getAllProjects: async (params = {}) => {
    const response = await api.get('/admin/projects', { params });
    return response.data;
  },

  /**
   * Update project collaboration status (Admin)
   * @param {string} id
   * @param {string} status
   * @returns {Promise<{ success: boolean, message: string, data: { project: object } }>}
   */
  updateProjectStatus: async (id, status) => {
    const response = await api.patch(`/admin/projects/${id}/status`, { status });
    return response.data;
  },

  /**
   * Soft delete a project (Admin)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { projectId: string, isDeleted: boolean } }>}
   */
  deleteProject: async (id) => {
    const response = await api.delete(`/admin/projects/${id}`);
    return response.data;
  },

  /**
   * Get all posts for moderation review
   * @param {object} [params] { page, limit, status, author, search, sort }
   * @returns {Promise<{ success: boolean, message: string, data: { posts: Array, pagination: object } }>}
   */
  getModerationPosts: async (params = {}) => {
    const response = await api.get('/admin/moderation/posts', { params });
    return response.data;
  },

  /**
   * Hide a post
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { postId: string, status: string } }>}
   */
  hidePost: async (id) => {
    const response = await api.patch(`/admin/moderation/posts/${id}/hide`);
    return response.data;
  },

  /**
   * Restore a post
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { postId: string, status: string } }>}
   */
  restorePost: async (id) => {
    const response = await api.patch(`/admin/moderation/posts/${id}/restore`);
    return response.data;
  },

  /**
   * Soft-delete a post (Admin moderation)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { postId: string, status: string } }>}
   */
  deletePost: async (id) => {
    const response = await api.delete(`/admin/moderation/posts/${id}`);
    return response.data;
  },

  /**
   * Hide a comment
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { commentId: string, status: string } }>}
   */
  hideComment: async (id) => {
    const response = await api.patch(`/admin/moderation/comments/${id}/hide`);
    return response.data;
  },

  /**
   * Restore a comment
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { commentId: string, status: string } }>}
   */
  restoreComment: async (id) => {
    const response = await api.patch(`/admin/moderation/comments/${id}/restore`);
    return response.data;
  },

  /**
   * Soft-delete a comment (Admin moderation)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { commentId: string, status: string } }>}
   */
  deleteComment: async (id) => {
    const response = await api.delete(`/admin/moderation/comments/${id}`);
    return response.data;
  },

  /**
   * Get all mentorship requests across platform
   * @param {object} [params] { page, limit, status, student, mentor, startDate, endDate, sort }
   * @returns {Promise<{ success: boolean, message: string, data: { requests: Array, pagination: object } }>}
   */
  getAllMentorships: async (params = {}) => {
    const response = await api.get('/admin/mentorship', { params });
    return response.data;
  },

  /**
   * Get aggregate mentorship metrics and top mentors
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  getMentorshipStatistics: async () => {
    const response = await api.get('/admin/mentorship/statistics');
    return response.data;
  },

  /**
   * Get platform audit trail logs
   * @param {object} [params] { page, limit, action, targetType, admin, startDate, endDate, sort }
   * @returns {Promise<{ success: boolean, message: string, data: { logs: Array, pagination: object } }>}
   */
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },
};

export default adminService;
