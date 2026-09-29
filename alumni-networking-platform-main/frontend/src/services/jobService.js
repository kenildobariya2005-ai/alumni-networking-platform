import api from './api.js';

/**
 * Jobs and Internships API Service
 */
export const jobService = {
  /**
   * Get all jobs with filters and pagination
   * @param {object} [params] { title, company, location, skills, jobType, status, search, page, limit, sort }
   * @returns {Promise<{ success: boolean, count: number, total: number, page: number, pages: number, jobs: Array }>}
   */
  getAllJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  /**
   * Get single job details by ID
   * @param {string} id
   * @returns {Promise<{ success: boolean, job: object }>}
   */
  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  /**
   * Create a new job posting (Alumni, Admin)
   * @param {object} jobData { title, description, company, location, jobType, salaryRange, requiredSkills, deadline }
   * @returns {Promise<{ success: boolean, message: string, job: object }>}
   */
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  /**
   * Update a job posting (Alumni owner, Admin)
   * @param {string} id
   * @param {object} jobData
   * @returns {Promise<{ success: boolean, message: string, job: object }>}
   */
  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  /**
   * Delete a job posting (Alumni owner, Admin)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  /**
   * Get jobs posted by current user (Alumni, Admin)
   * @param {object} [params] { status, page, limit, sort }
   * @returns {Promise<{ success: boolean, count: number, total: number, page: number, pages: number, jobs: Array }>}
   */
  getMyPostedJobs: async (params = {}) => {
    const response = await api.get('/jobs/my/posted', { params });
    return response.data;
  },

  /**
   * Toggle or update job status ('Open' / 'Closed')
   * @param {string} id
   * @param {string} [status]
   * @returns {Promise<{ success: boolean, message: string, job: object }>}
   */
  updateJobStatus: async (id, status) => {
    const response = await api.patch(`/jobs/${id}/status`, { status });
    return response.data;
  },
};

export default jobService;
