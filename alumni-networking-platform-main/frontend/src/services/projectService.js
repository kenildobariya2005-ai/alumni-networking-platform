import api from './api.js';

/**
 * Projects and Project Collaboration API Service
 */
export const projectService = {
  /**
   * Get all active projects with search and filters
   * @param {object} [params] { page, limit, sort, category, status, skill, search, createdBy }
   * @returns {Promise<{ success: boolean, message: string, data: { projects: Array, pagination: object } }>}
   */
  getProjects: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  /**
   * Get single project details by ID
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { project: object } }>}
   */
  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  /**
   * Create a new project (Alumni only)
   * @param {object} projectData { title, description, category, requiredSkills, maxTeamSize, deadline, repositoryUrl, demoUrl }
   * @returns {Promise<{ success: boolean, message: string, data: { project: object } }>}
   */
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  /**
   * Update project details (Creator only)
   * @param {string} id
   * @param {object} projectData
   * @returns {Promise<{ success: boolean, message: string, data: { project: object } }>}
   */
  updateProject: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  /**
   * Soft delete project (Creator or Admin)
   * @param {string} id
   * @returns {Promise<{ success: boolean, message: string, data: { projectId: string, isDeleted: boolean } }>}
   */
  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  /**
   * Get my projects (created by me or collaborated on)
   * @param {object} [params] { page, limit, sort, filter: 'created'|'member'|'all' }
   * @returns {Promise<{ success: boolean, message: string, data: { projects: Array, pagination: object } }>}
   */
  getMyProjects: async (params = {}) => {
    const response = await api.get('/projects/my', { params });
    return response.data;
  },

  /**
   * Update project status (Creator only)
   * @param {string} id
   * @param {string} status 'recruiting' | 'in-progress' | 'completed' | 'cancelled'
   * @returns {Promise<{ success: boolean, message: string, data: { project: object } }>}
   */
  updateProjectStatus: async (id, status) => {
    const response = await api.patch(`/projects/${id}/status`, { status });
    return response.data;
  },

  /**
   * Apply to join a project (Student only)
   * @param {string} projectId
   * @param {object} data { message, skills }
   * @returns {Promise<{ success: boolean, message: string, data: { application: object } }>}
   */
  applyToProject: async (projectId, data = {}) => {
    const response = await api.post(`/projects/${projectId}/apply`, data);
    return response.data;
  },

  /**
   * Get student's own project applications (Student only)
   * @param {object} [params] { page, limit, status, sort }
   * @returns {Promise<{ success: boolean, message: string, data: { applications: Array, pagination: object } }>}
   */
  getMyProjectApplications: async (params = {}) => {
    const response = await api.get('/project-applications/me', { params });
    return response.data;
  },

  /**
   * Get all applications for a specific project (Project Creator or Admin)
   * @param {string} projectId
   * @param {object} [params] { page, limit, status }
   * @returns {Promise<{ success: boolean, message: string, data: { applications: Array, pagination: object } }>}
   */
  getProjectApplications: async (projectId, params = {}) => {
    const response = await api.get(`/projects/${projectId}/applications`, { params });
    return response.data;
  },

  /**
   * Accept project application and add student to team (Project Creator only)
   * @param {string} applicationId
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  acceptProjectApplication: async (applicationId) => {
    const response = await api.patch(`/project-applications/${applicationId}/accept`);
    return response.data;
  },

  /**
   * Reject project application (Project Creator only)
   * @param {string} applicationId
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  rejectProjectApplication: async (applicationId) => {
    const response = await api.patch(`/project-applications/${applicationId}/reject`);
    return response.data;
  },

  /**
   * Withdraw own pending project application (Student owner)
   * @param {string} applicationId
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  withdrawProjectApplication: async (applicationId) => {
    const response = await api.patch(`/project-applications/${applicationId}/withdraw`);
    return response.data;
  },
};

export default projectService;
