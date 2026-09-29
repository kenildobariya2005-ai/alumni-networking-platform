/**
 * Application Route Paths Constants
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  STUDENT_LOGIN: '/student/login',
  ALUMNI_LOGIN: '/alumni/login',
  ADMIN_LOGIN: '/admin/login',
  STUDENT_REGISTER: '/student/register',
  ALUMNI_REGISTER: '/alumni/register',
  UNAUTHORIZED: '/unauthorized',

  // Role Dashboards
  STUDENT_DASHBOARD: '/student',
  ALUMNI_DASHBOARD: '/alumni',
  ADMIN_DASHBOARD: '/admin',

  // Student specific routes
  STUDENT_PROFILE: '/student/profile',
  STUDENT_APPLICATIONS: '/student/applications',
  STUDENT_MENTORSHIPS: '/student/mentorships',

  // Alumni specific routes
  ALUMNI_PROFILE: '/alumni/profile',
  ALUMNI_NETWORK: '/alumni/network',
  ALUMNI_JOBS: '/alumni/jobs',
  ALUMNI_APPLICATIONS: '/alumni/applications',
  ALUMNI_MENTORSHIP: '/alumni/mentorship',
  ALUMNI_MENTORSHIPS: '/alumni/mentorships',
  ALUMNI_PROJECTS: '/alumni/projects',
  ALUMNI_PROJECT_APPLICATIONS: (projectId = ':projectId') => `/alumni/projects/${projectId}/applications`,
  ALUMNI_MESSAGES: '/alumni/messages',
  ALUMNI_NOTIFICATIONS: '/alumni/notifications',
  ALUMNI_COMMUNITY: '/alumni/community',
  ALUMNI_SETTINGS: '/alumni/settings',

  // Core Jobs & Internships
  JOBS: '/jobs',
  JOB_DETAILS: (id = ':id') => `/jobs/${id}`,
  CREATE_JOB: '/jobs/create',

  // Mentorship
  MENTORSHIP: '/mentorship',
  MENTORSHIP_REQUEST: (mentorId = ':mentorId') => `/mentorship/request/${mentorId}`,
  MENTORSHIP_SCHEDULE: (id = ':id') => `/mentorship/schedule/${id}`,

  // Projects & Collaboration
  PROJECTS: '/projects',
  PROJECT_DETAILS: (id = ':id') => `/projects/${id}`,
  CREATE_PROJECT: '/projects/create',

  // Community Feed
  COMMUNITY: '/community',
  CREATE_POST: '/community/create',

  // Direct Real-Time Chat
  CHAT: '/chat',
  CHAT_ROOM: (userId = ':userId') => `/chat/${userId}`,

  // Notifications
  NOTIFICATIONS: '/notifications',

  // Universal profile fallback
  PROFILE: '/profile',

  // Admin Module Routes
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAILS: (id = ':id') => `/admin/users/${id}`,
  ADMIN_ALUMNI_VERIFICATION: '/admin/alumni-verification',
  ADMIN_JOBS: '/admin/jobs',
  ADMIN_PROJECTS: '/admin/projects',
  ADMIN_MODERATION: '/admin/moderation',
  ADMIN_MENTORSHIP: '/admin/mentorship',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings',

  NOT_FOUND: '*',
};

/**
 * Helper to determine dashboard path based on user role
 * @param {string} role
 * @returns {string}
 */
export const getRoleRedirectPath = (role = '') => {
  const normalizedRole = String(role).toLowerCase().trim();
  switch (normalizedRole) {
    case 'admin':
      return ROUTES.ADMIN_DASHBOARD;
    case 'alumni':
      return ROUTES.ALUMNI_DASHBOARD;
    case 'student':
      return ROUTES.STUDENT_DASHBOARD;
    default:
      return ROUTES.HOME;
  }
};

export default ROUTES;
