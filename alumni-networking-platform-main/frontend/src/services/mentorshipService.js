import api from './api.js';

/**
 * Mentorship API Service
 */
export const mentorshipService = {
  /**
   * Create a mentorship request (Student only)
   * @param {object} data { mentorId, topic, message, preferredDate }
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  createRequest: async (data) => {
    const response = await api.post('/mentorship/request', data);
    return response.data;
  },

  /**
   * Get all mentorship requests created by student (Student only)
   * @param {object} [params] { status, page, limit, sort }
   * @returns {Promise<{ success: boolean, count: number, total: number, page: number, pages: number, data: Array }>}
   */
  getMyRequests: async (params = {}) => {
    const response = await api.get('/mentorship/my-requests', { params });
    return response.data;
  },

  /**
   * Get incoming mentorship requests (Alumni mentor only)
   * @param {object} [params] { status, page, limit, sort }
   * @returns {Promise<{ success: boolean, count: number, total: number, page: number, pages: number, data: Array }>}
   */
  getIncomingRequests: async (params = {}) => {
    const response = await api.get('/mentorship/incoming', { params });
    return response.data;
  },

  /**
   * Get specific mentorship session by ID
   * @param {string} id
   * @returns {Promise<{ success: boolean, data: object }>}
   */
  getMentorshipById: async (id) => {
    const response = await api.get(`/mentorship/${id}`);
    return response.data;
  },

  /**
   * Accept mentorship request (Alumni mentor, Admin)
   * @param {string} id
   * @param {object} [data] { meetingLink, scheduledAt }
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  acceptRequest: async (id, data = {}) => {
    const response = await api.patch(`/mentorship/${id}/accept`, data);
    return response.data;
  },

  /**
   * Reject mentorship request (Alumni mentor, Admin)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  rejectRequest: async (id) => {
    const response = await api.patch(`/mentorship/${id}/reject`);
    return response.data;
  },

  /**
   * Cancel pending mentorship request (Student owner, Admin)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  cancelRequest: async (id) => {
    const response = await api.patch(`/mentorship/${id}/cancel`);
    return response.data;
  },

  /**
   * Schedule mentorship session (Alumni mentor, Admin)
   * @param {string} id
   * @param {object} data { scheduledAt, meetingLink }
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  scheduleMentorship: async (id, data) => {
    const response = await api.patch(`/mentorship/${id}/schedule`, data);
    return response.data;
  },

  /**
   * Mark mentorship session as completed (Alumni mentor, Admin)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  completeMentorship: async (id) => {
    const response = await api.patch(`/mentorship/${id}/complete`);
    return response.data;
  },

  /**
   * Submit feedback and rating after completion (Student only)
   * @param {string} id
   * @param {object} data { rating, feedback }
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  submitFeedback: async (id, data) => {
    const response = await api.post(`/mentorship/${id}/feedback`, data);
    return response.data;
  },

  /**
   * Get completed mentorship history
   * @param {object} [params] { page, limit, sort }
   * @returns {Promise<{ success: boolean, count: number, total: number, page: number, pages: number, data: Array }>}
   */
  getMentorshipHistory: async (params = {}) => {
    const response = await api.get('/mentorship/history', { params });
    return response.data;
  },
};

export default mentorshipService;
