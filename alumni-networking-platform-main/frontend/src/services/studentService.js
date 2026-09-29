import api from './api.js';

/**
 * Student Profile API Service
 */
export const studentService = {
  /**
   * Get current student's profile
   * @returns {Promise<{ success: boolean, profile: object }>}
   */
  getMyProfile: async () => {
    const response = await api.get('/student/profile');
    return response.data;
  },

  /**
   * Create student profile (supports FormData or plain object)
   * @param {FormData|object} profileData
   * @returns {Promise<{ success: boolean, message: string, profile: object }>}
   */
  createProfile: async (profileData) => {
    const response = await api.post('/student/profile', profileData);
    return response.data;
  },

  /**
   * Update student profile (supports FormData or plain object)
   * @param {FormData|object} profileData
   * @returns {Promise<{ success: boolean, message: string, profile: object }>}
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/student/profile', profileData);
    return response.data;
  },

  /**
   * Upload / update student resume PDF
   * @param {FormData} formData
   * @returns {Promise<{ success: boolean, message: string, resumeUrl: string, profile: object }>}
   */
  uploadResume: async (formData) => {
    const response = await api.post('/student/profile/resume', formData);
    return response.data;
  },

  /**
   * Delete student resume PDF from GridFS
   * @returns {Promise<{ success: boolean, message: string, profile: object }>}
   */
  deleteResume: async () => {
    const response = await api.delete('/student/profile/resume');
    return response.data;
  },

  /**
   * Get direct URL to view / stream resume PDF from MongoDB GridFS
   * @param {string} [fileId] - Optional specific resumeFileId
   * @returns {string} URL to stream resume
   */
  getResumeViewUrl: (fileId) => {
    const token = localStorage.getItem('alumniconnect_token') || localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const path = fileId ? `/student/profile/resume/${fileId}` : '/student/profile/resume';
    return `${baseUrl}${path}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  /**
   * Get student profile by user ID or profile ID
   * @param {string} id
   * @returns {Promise<{ success: boolean, profile: object }>}
   */
  getStudentById: async (id) => {
    const response = await api.get(`/student/${id}`);
    return response.data;
  },
};

export default studentService;
