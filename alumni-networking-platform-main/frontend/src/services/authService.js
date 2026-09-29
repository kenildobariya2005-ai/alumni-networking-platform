import api from './api.js';

/**
 * Authentication API Service
 */
export const authService = {
  /**
   * Login user with email and password
   * @param {object} credentials { email, password }
   * @returns {Promise<{ success: boolean, message: string, token: string, user: object }>}
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new user (Student or Alumni)
   * @param {object} userData { fullName, email, password, role }
   * @returns {Promise<{ success: boolean, message: string, token?: string, user: object }>}
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Logout user and revoke session cookie
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Get current authenticated user profile
   * @returns {Promise<{ success: boolean, user: object }>}
   */
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  /**
   * Alias for getProfile
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export default authService;
