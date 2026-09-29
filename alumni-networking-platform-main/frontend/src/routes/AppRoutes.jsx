import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ROUTES from '../constants/routes.js';

// Layouts
import MainLayout from '../layouts/MainLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

// Route Guards
import ProtectedRoute from './ProtectedRoute.jsx';

// Public & Auth Pages
import HomePage from '../pages/HomePage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import Unauthorized from '../pages/Unauthorized.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import StudentLogin from '../pages/auth/StudentLogin.jsx';
import AlumniLogin from '../pages/auth/AlumniLogin.jsx';
import AdminLogin from '../pages/auth/AdminLogin.jsx';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard.jsx';
import StudentProfile from '../pages/student/StudentProfile.jsx';
import MyApplications from '../pages/student/MyApplications.jsx';
import MyMentorships from '../pages/student/MyMentorships.jsx';

// Alumni Pages
import AlumniDashboard from '../pages/alumni/AlumniDashboard.jsx';
import AlumniProfile from '../pages/alumni/AlumniProfile.jsx';
import MyJobs from '../pages/alumni/MyJobs.jsx';
import JobApplications from '../pages/alumni/JobApplications.jsx';
import MentorshipRequests from '../pages/alumni/MentorshipRequests.jsx';
import MyProjects from '../pages/alumni/MyProjects.jsx';
import ProjectApplications from '../pages/alumni/ProjectApplications.jsx';

// Jobs Module
import Jobs from '../pages/jobs/Jobs.jsx';
import JobDetails from '../pages/jobs/JobDetails.jsx';
import CreateJob from '../pages/jobs/CreateJob.jsx';

// Mentorship Module
import Mentors from '../pages/mentorship/Mentors.jsx';
import MentorshipRequest from '../pages/mentorship/MentorshipRequest.jsx';
import ScheduleMentorship from '../pages/mentorship/ScheduleMentorship.jsx';

// Projects Module
import Projects from '../pages/projects/Projects.jsx';
import ProjectDetails from '../pages/projects/ProjectDetails.jsx';
import CreateProject from '../pages/projects/CreateProject.jsx';

// Community Module
import CommunityFeed from '../pages/community/CommunityFeed.jsx';
import CreatePost from '../pages/community/CreatePost.jsx';

// Real-time Chat & Notifications
import Chat from '../pages/chat/Chat.jsx';
import Notifications from '../pages/notifications/Notifications.jsx';
import ProfilePage from '../pages/profile/ProfilePage.jsx';

// Admin Module
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import UserManagement from '../pages/admin/UserManagement.jsx';
import UserDetails from '../pages/admin/UserDetails.jsx';
import AlumniVerification from '../pages/admin/AlumniVerification.jsx';
import JobManagement from '../pages/admin/JobManagement.jsx';
import ProjectManagement from '../pages/admin/ProjectManagement.jsx';
import Moderation from '../pages/admin/Moderation.jsx';
import MentorshipManagement from '../pages/admin/MentorshipManagement.jsx';
import AuditLogs from '../pages/admin/AuditLogs.jsx';
import ReportsAnalytics from '../pages/admin/ReportsAnalytics.jsx';
import AdminSettings from '../pages/admin/AdminSettings.jsx';
import AlumniNetwork from '../pages/alumni/AlumniNetwork.jsx';
import AlumniSettings from '../pages/alumni/AlumniSettings.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Marketing Route */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
      </Route>

      {/* 2. Authentication Pages */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.STUDENT_LOGIN} element={<StudentLogin />} />
      <Route path={ROUTES.ALUMNI_LOGIN} element={<AlumniLogin />} />
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
      <Route path="/student/register" element={<RegisterPage />} />
      <Route path="/alumni/register" element={<RegisterPage />} />

      {/* 3. Access Denied Page */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
      </Route>

      {/* 4. Authenticated Application Workspace (DashboardLayout) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Student Dedicated Routes */}
          <Route
            path={ROUTES.STUDENT_DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT_PROFILE}
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT_APPLICATIONS}
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT_MENTORSHIPS}
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyMentorships />
              </ProtectedRoute>
            }
          />

          {/* Alumni Dedicated Routes */}
          <Route
            path={ROUTES.ALUMNI_DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={['alumni']}>
                <AlumniDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ALUMNI_PROFILE}
            element={
              <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                <AlumniProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ALUMNI_NETWORK}
            element={
              <ProtectedRoute allowedRoles={['alumni']}>
                <AlumniNetwork />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ALUMNI_JOBS}
            element={
              <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                <MyJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ALUMNI_APPLICATIONS}
            element={
              <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                <JobApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alumni/jobs/:jobId/applications"
            element={
              <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                <JobApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ALUMNI_MENTORSHIP}
            element={
              <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                <MentorshipRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ALUMNI_MENTORSHIPS}
            element={
              <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                <MentorshipRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ALUMNI_PROJECTS}
            element={
              <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                <MyProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alumni/projects/:projectId/applications"
            element={
              <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                <ProjectApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ALUMNI_MESSAGES}
            element={
              <ProtectedRoute allowedRoles={['alumni']}>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ALUMNI_NOTIFICATIONS}
            element={
              <ProtectedRoute allowedRoles={['alumni']}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ALUMNI_COMMUNITY}
            element={
              <ProtectedRoute allowedRoles={['alumni']}>
                <CommunityFeed />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ALUMNI_SETTINGS}
            element={
              <ProtectedRoute allowedRoles={['alumni']}>
                <AlumniSettings />
              </ProtectedRoute>
            }
          />

          {/* Jobs Module */}
          <Route path={ROUTES.JOBS} element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route
            path={ROUTES.CREATE_JOB}
            element={
              <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                <CreateJob />
              </ProtectedRoute>
            }
          />

          {/* Mentorship Module */}
          <Route path={ROUTES.MENTORSHIP} element={<Mentors />} />
          <Route
            path="/mentorship/request/:mentorId"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <MentorshipRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentorship/schedule/:id"
            element={
              <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                <ScheduleMentorship />
              </ProtectedRoute>
            }
          />

          {/* Projects Module */}
          <Route path={ROUTES.PROJECTS} element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route
            path={ROUTES.CREATE_PROJECT}
            element={
              <ProtectedRoute allowedRoles={['alumni', 'admin']}>
                <CreateProject />
              </ProtectedRoute>
            }
          />

          {/* Community Feed Module */}
          <Route path={ROUTES.COMMUNITY} element={<CommunityFeed />} />
          <Route path={ROUTES.CREATE_POST} element={<CreatePost />} />

          {/* Real-time Chat Module */}
          <Route path={ROUTES.CHAT} element={<Chat />} />
          <Route path="/chat/:userId" element={<Chat />} />

          {/* Notifications */}
          <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />

          {/* General Profile */}
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />

          {/* Admin Control Center Routes */}
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_USERS}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_ALUMNI_VERIFICATION}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AlumniVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_JOBS}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <JobManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_PROJECTS}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProjectManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_MODERATION}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Moderation />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_MENTORSHIP}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MentorshipManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_AUDIT_LOGS}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_REPORTS}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportsAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_SETTINGS}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>

      {/* 5. 404 Not Found Catch-All */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
