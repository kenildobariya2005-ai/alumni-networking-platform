import api from './api.js';

/**
 * Alumni Profile API Service
 */
export const alumniService = {
  /**
   * Get current alumni's own profile
   * @returns {Promise<{ success: boolean, profile: object }>}
   */
  getMyProfile: async () => {
    const response = await api.get('/alumni/profile');
    return response.data;
  },

  /**
   * Create alumni profile
   * @param {FormData|object} profileData
   * @returns {Promise<{ success: boolean, message: string, profile: object }>}
   */
  createProfile: async (profileData) => {
    const isFormData = profileData instanceof FormData;
    const response = await api.post('/alumni/profile', profileData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  /**
   * Update alumni profile
   * @param {FormData|object} profileData
   * @returns {Promise<{ success: boolean, message: string, profile: object }>}
   */
  updateProfile: async (profileData) => {
    const isFormData = profileData instanceof FormData;
    const response = await api.put('/alumni/profile', profileData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  /**
   * Get alumni profile by user ID or profile ID
   * @param {string} id
   * @returns {Promise<{ success: boolean, profile: object }>}
   */
  getAlumniById: async (id) => {
    const response = await api.get(`/alumni/${id}`);
    return response.data;
  },

  /**
   * Search and filter alumni profiles (Mentors, Directory)
   * @param {object} [params] { company, skills, location, mentorAvailable, page, limit }
   * @returns {Promise<{ success: boolean, count: number, total: number, pages: number, currentPage: number, profiles: Array }>}
   */
  searchAlumni: async (params = {}) => {
    const response = await api.get('/alumni', { params });
    return response.data;
  },
};

export default alumniService;
