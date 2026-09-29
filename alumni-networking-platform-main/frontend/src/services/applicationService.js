import api from './api.js';

/**
 * Job Applications API Service
 */
export const applicationService = {
  /**
   * Apply for a job posting (Student only)
   * @param {string} jobId
   * @param {object} [data] { coverLetter }
   * @returns {Promise<{ success: boolean, message: string, application: object }>}
   */
  applyJob: async (jobId, data = {}) => {
    const response = await api.post(`/applications/jobs/${jobId}/apply`, data);
    return response.data;
  },

  /**
   * Get student's submitted applications (Student only)
   * @param {object} [params] { status, page, limit, sort }
   * @returns {Promise<{ success: boolean, count: number, total: number, page: number, pages: number, applications: Array }>}
   */
  getMyApplications: async (params = {}) => {
    const response = await api.get('/applications/me', { params });
    return response.data;
  },

  /**
   * Get applications for a specific job posting (Alumni owner, Admin)
   * @param {string} jobId
   * @param {object} [params] { status, page, limit, sort }
   * @returns {Promise<{ success: boolean, jobId: string, jobTitle: string, company: string, count: number, total: number, page: number, pages: number, applications: Array }>}
   */
  getJobApplications: async (jobId, params = {}) => {
    const response = await api.get(`/applications/jobs/${jobId}/applications`, { params });
    return response.data;
  },

  /**
   * Update application status (Alumni owner, Admin)
   * @param {string} applicationId
   * @param {string} status 'Applied' | 'Reviewing' | 'Shortlisted' | 'Accepted' | 'Rejected'
   * @returns {Promise<{ success: boolean, message: string, application: object }>}
   */
  updateApplicationStatus: async (applicationId, status) => {
    const response = await api.patch(`/applications/${applicationId}/status`, { status });
    return response.data;
  },
};

export default applicationService;
