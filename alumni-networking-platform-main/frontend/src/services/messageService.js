import api from './api.js';

/**
 * Real-time Chat & Messages REST Fallback Service
 */
export const messageService = {
  /**
   * Send message via REST
   * @param {object} data { receiverId, message }
   * @returns {Promise<{ success: boolean, message: string, data: { message: object } }>}
   */
  sendMessage: async (data) => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  /**
   * Get all active conversations with latest message & unread count
   * @returns {Promise<{ success: boolean, message: string, data: { conversations: Array } }>}
   */
  getMyConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  /**
   * Get conversation messages with a specific user
   * @param {string} userId
   * @param {object} [params] { page, limit, sort }
   * @returns {Promise<{ success: boolean, message: string, data: { messages: Array, pagination: object, participant: object } }>}
   */
  getConversation: async (userId, params = {}) => {
    const response = await api.get(`/messages/conversation/${userId}`, { params });
    return response.data;
  },

  /**
   * Mark a single message as read
   * @param {string} messageId
   * @returns {Promise<{ success: boolean, message: string, data: { message: object } }>}
   */
  markMessageAsRead: async (messageId) => {
    const response = await api.patch(`/messages/${messageId}/read`);
    return response.data;
  },

  /**
   * Mark all unread messages from a partner as read
   * @param {string} userId
   * @returns {Promise<{ success: boolean, message: string, data: { modifiedCount: number } }>}
   */
  markConversationAsRead: async (userId) => {
    const response = await api.patch(`/messages/conversation/${userId}/read`);
    return response.data;
  },

  /**
   * Delete own message (soft delete)
   * @param {string} messageId
   * @returns {Promise<{ success: boolean, message: string, data: { messageId: string } }>}
   */
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },
};

export default messageService;
