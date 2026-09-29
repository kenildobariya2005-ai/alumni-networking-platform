import api from './api.js';

/**
 * AI Assistant Service for Student Career & Technical Guidance
 * Connects to the secure backend Gemini integration at POST /api/ai/chat
 */
export const aiService = {
  /**
   * Send question and conversation history to AlumniConnect AI Assistant
   * @param {object} payload
   * @param {string} payload.message - User prompt
   * @param {Array<{ role: string, content: string }>} [payload.history=[]] - Previous conversation messages
   * @returns {Promise<{ success: boolean, message: string, model?: string }>}
   */
  chat: async ({ message, history = [] }) => {
    // Dedicated timeout of 45,000ms for AI generation; preserves 15000ms global timeout in api.js
    const response = await api.post(
      '/ai/chat',
      {
        message,
        history,
      },
      {
        timeout: 45000,
      }
    );
    return response.data;
  },
};

export default aiService;
