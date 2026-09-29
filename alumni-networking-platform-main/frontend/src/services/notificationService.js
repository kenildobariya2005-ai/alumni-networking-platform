import api from './api.js';

/**
 * Notifications API Service
 */
export const notificationService = {
  /**
   * Get all notifications with pagination and optional filter
   * @param {object} [params] { page, limit, isRead, type }
   * @returns {Promise<{ success: boolean, message: string, data: { notifications: Array, unreadCount: number, pagination: object } }>}
   */
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Get unread notifications
   * @returns {Promise<{ success: boolean, message: string, data: { notifications: Array, unreadCount: number } }>}
   */
  getUnreadNotifications: async () => {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  /**
   * Mark single notification as read
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { notification: object } }>}
   */
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<{ success: boolean, message: string, data: { modifiedCount: number } }>}
   */
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a notification
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { notificationId: string } }>}
   */
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;
