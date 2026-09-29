import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineChatAlt2,
  HiOutlineBell,
  HiOutlineClock,
  HiOutlineArrowRight,
  HiOutlineUser,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth.js';
import { studentService } from '../../services/studentService.js';
import { applicationService } from '../../services/applicationService.js';
import { mentorshipService } from '../../services/mentorshipService.js';
import { projectService } from '../../services/projectService.js';
import { notificationService } from '../../services/notificationService.js';
import StatCard from '../../components/cards/StatCard.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import AIChatbot from '../../components/ai/AIChatbot.jsx';
import ROUTES from '../../constants/routes.js';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    appliedJobs: 0,
    pendingApplications: 0,
    mentorshipRequests: 0,
    activeProjects: 0,
    unreadNotifications: 0,
  });

  const [recentApplications, setRecentApplications] = useState([]);
  const [recentMentorships, setRecentMentorships] = useState([]);
  const [recentProjectApps, setRecentProjectApps] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [
          profileRes,
          applicationsRes,
          mentorshipsRes,
          projectsRes,
          notificationsRes,
        ] = await Promise.allSettled([
          studentService.getMyProfile(),
          applicationService.getMyApplications({ limit: 5 }),
          mentorshipService.getMyRequests({ limit: 5 }),
          projectService.getMyProjectApplications({ limit: 5 }),
          notificationService.getNotifications({ limit: 5 }),
        ]);

        if (!isMounted) return;

        // Process Profile
        let studentProfile = null;
        if (profileRes.status === 'fulfilled' && profileRes.value?.profile) {
          studentProfile = profileRes.value.profile;
          setProfile(studentProfile);
        }

        // Process Applications
        let apps = [];
        let totalApps = 0;
        let pendingApps = 0;
        if (applicationsRes.status === 'fulfilled' && applicationsRes.value) {
          apps = applicationsRes.value.applications || [];
          totalApps = applicationsRes.value.total || apps.length;
          pendingApps = apps.filter(
            (a) => a.status === 'Applied' || a.status === 'Reviewing'
          ).length;
          setRecentApplications(apps.slice(0, 4));
        }

        // Process Mentorship Requests
        let mentorships = [];
        let totalMentorships = 0;
        if (mentorshipsRes.status === 'fulfilled' && mentorshipsRes.value) {
          mentorships = mentorshipsRes.value.data || [];
          totalMentorships = mentorshipsRes.value.total || mentorships.length;
          setRecentMentorships(mentorships.slice(0, 4));
        }

        // Process Project Applications
        let projApps = [];
        let activeProjCount = 0;
        if (projectsRes.status === 'fulfilled' && projectsRes.value?.data) {
          projApps = projectsRes.value.data.applications || [];
          activeProjCount = projApps.filter((p) => p.status === 'accepted').length;
          setRecentProjectApps(projApps.slice(0, 4));
        }

        // Process Notifications
        let notifs = [];
        let unreadNotifCount = 0;
        if (notificationsRes.status === 'fulfilled' && notificationsRes.value?.data) {
          notifs = notificationsRes.value.data.notifications || [];
          unreadNotifCount = notificationsRes.value.data.unreadCount || 0;
          setRecentNotifications(notifs.slice(0, 4));
        }

        setStats({
          appliedJobs: totalApps,
          pendingApplications: pendingApps,
          mentorshipRequests: totalMentorships,
          activeProjects: activeProjCount,
          unreadNotifications: unreadNotifCount,
        });
      } catch (err) {
        console.error('[StudentDashboard] Error loading data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profile) return 30;
    let score = 30;
    if (profile.enrollmentNumber) score += 10;
    if (profile.branch) score += 10;
    if (profile.semester) score += 10;
    if (profile.graduationYear) score += 10;
    if (profile.skills && profile.skills.length > 0) score += 10;
    if (profile.bio) score += 10;
    if (profile.resumeUrl) score += 10;
    return Math.min(100, score);
  };

  const completionPercent = calculateProfileCompletion();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" message="Loading student workspace..." />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in text-[#CBD5E1]">
      {/* Welcome Banner & Profile Completion */}
      <div className="bg-[#151E32] rounded-2xl p-6 sm:p-8 text-[#F8FAFC] border border-[#26334D] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30">
              🎓 Student Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F8FAFC]">
              Welcome back, {user?.fullName || 'Student'}!
            </h1>
            <p className="text-[#CBD5E1] text-xs sm:text-sm leading-relaxed">
              Explore internship opportunities, connect with alumni mentors, and collaborate on real-world engineering projects.
            </p>
          </div>

          {/* Profile Completion Box */}
          <div className="bg-[#202B40] rounded-2xl p-5 border border-[#334155] min-w-[260px] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#F8FAFC]">
              <span>Profile Completion</span>
              <span>{completionPercent}%</span>
            </div>
            <div className="w-full bg-[#26334D] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#6366F1] h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            {completionPercent < 100 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-[#202B40] text-[#F8FAFC] hover:bg-[#151E32] border-[#334155] hover:border-[#6366F1] text-xs font-semibold py-1.5 shadow-sm"
                onClick={() => navigate(ROUTES.STUDENT_PROFILE)}
              >
                Complete Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Statistics Cards */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-white mb-4">
          Quick Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            title="Applied Jobs"
            value={stats.appliedJobs}
            icon={HiOutlineBriefcase}
            variant="primary"
            onClick={() => navigate(ROUTES.STUDENT_APPLICATIONS)}
          />
          <StatCard
            title="Pending Apps"
            value={stats.pendingApplications}
            icon={HiOutlineClock}
            variant="warning"
            onClick={() => navigate(ROUTES.STUDENT_APPLICATIONS)}
          />
          <StatCard
            title="Mentorships"
            value={stats.mentorshipRequests}
            icon={HiOutlineAcademicCap}
            variant="purple"
            onClick={() => navigate(ROUTES.STUDENT_MENTORSHIPS)}
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            icon={HiOutlineSparkles}
            variant="success"
            onClick={() => navigate(ROUTES.PROJECTS)}
          />
          <StatCard
            title="Notifications"
            value={stats.unreadNotifications}
            icon={HiOutlineBell}
            variant="rose"
            onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          />
        </div>
      </div>

      {/* AI Assistant Spotlight Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-primary-950 rounded-3xl p-6 text-white border border-indigo-500/30 shadow-soft-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-start gap-4 z-10 max-w-2xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 p-0.5 flex-shrink-0 shadow-soft-md">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-300">
              <HiOutlineSparkles className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                AlumniConnect AI Career Assistant
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-300/30">
                Google Gemini
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ask questions about career roadmaps, technical interview preparation, project architecture, or how to reach out to verified alumni mentors.
            </p>
          </div>
        </div>

        <div className="z-10 flex-shrink-0 w-full md:w-auto">
          <Button
            variant="primary"
            icon={HiOutlineSparkles}
            onClick={() => setIsAIChatOpen(true)}
            className="w-full md:w-auto bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-semibold py-2.5 px-5 shadow-soft-md"
          >
            Launch AI Assistant
          </Button>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-[#F8FAFC] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <Button
            variant="outline"
            icon={HiOutlineSparkles}
            onClick={() => setIsAIChatOpen(true)}
            className="flex-col py-3.5 px-2 text-xs font-semibold h-auto gap-2 bg-[#6366F1]/15 text-[#818CF8] border-[#6366F1]/30 hover:border-[#6366F1] hover:bg-[#6366F1]/25"
          >
            AI Assistant
          </Button>
          <Button
            variant="outline"
            icon={HiOutlineBriefcase}
            onClick={() => navigate(ROUTES.JOBS)}
            className="flex-col py-3.5 px-2 text-xs font-semibold h-auto gap-2 bg-[#151E32] text-[#CBD5E1] border-[#26334D] hover:border-[#6366F1] hover:text-[#F8FAFC] hover:bg-[#202B40]"
          >
            Find Jobs
          </Button>
          <Button
            variant="outline"
            icon={HiOutlineAcademicCap}
            onClick={() => navigate(ROUTES.MENTORSHIP)}
            className="flex-col py-3.5 px-2 text-xs font-semibold h-auto gap-2 bg-[#151E32] text-[#CBD5E1] border-[#26334D] hover:border-[#6366F1] hover:text-[#F8FAFC] hover:bg-[#202B40]"
          >
            Find Mentors
          </Button>
          <Button
            variant="outline"
            icon={HiOutlineSparkles}
            onClick={() => navigate(ROUTES.PROJECTS)}
            className="flex-col py-3.5 px-2 text-xs font-semibold h-auto gap-2 bg-[#151E32] text-[#CBD5E1] border-[#26334D] hover:border-[#6366F1] hover:text-[#F8FAFC] hover:bg-[#202B40]"
          >
            Explore Projects
          </Button>
          <Button
            variant="outline"
            icon={HiOutlineUserGroup}
            onClick={() => navigate(ROUTES.CREATE_POST)}
            className="flex-col py-3.5 px-2 text-xs font-semibold h-auto gap-2 bg-[#151E32] text-[#CBD5E1] border-[#26334D] hover:border-[#6366F1] hover:text-[#F8FAFC] hover:bg-[#202B40]"
          >
            Create Post
          </Button>
          <Button
            variant="outline"
            icon={HiOutlineUser}
            onClick={() => navigate(ROUTES.STUDENT_PROFILE)}
            className="flex-col py-3.5 px-2 text-xs font-semibold h-auto gap-2 bg-[#151E32] text-[#CBD5E1] border-[#26334D] hover:border-[#6366F1] hover:text-[#F8FAFC] hover:bg-[#202B40]"
          >
            My Profile
          </Button>
          <Button
            variant="outline"
            icon={HiOutlineChatAlt2}
            onClick={() => navigate(ROUTES.CHAT)}
            className="flex-col py-3.5 px-2 text-xs font-semibold h-auto gap-2 bg-[#151E32] text-[#CBD5E1] border-[#26334D] hover:border-[#6366F1] hover:text-[#F8FAFC] hover:bg-[#202B40]"
          >
            Messages
          </Button>
        </div>
      </div>

      {/* Recent Activity Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Job Applications */}
        <div className="bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#26334D] mb-4">
            <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
              <HiOutlineBriefcase className="w-5 h-5 text-[#818CF8]" />
              Recent Job Applications
            </h3>
            <Link
              to={ROUTES.STUDENT_APPLICATIONS}
              className="text-xs font-semibold text-[#818CF8] hover:text-[#CBD5E1] flex items-center gap-1"
            >
              View All <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <EmptyState
              icon={HiOutlineBriefcase}
              title="No applications yet"
              description="You have not applied for any jobs yet."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(ROUTES.JOBS)}
                  className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
                >
                  Browse Jobs
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#202B40] border border-[#26334D] hover:border-[#6366F1]/40 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC] truncate">
                      {app.job?.title || 'Job Posting'}
                    </p>
                    <p className="text-xs text-[#94A3B8] truncate">
                      {app.job?.company || 'Company'} &bull;{' '}
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      app.status === 'Accepted'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : app.status === 'Rejected'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Mentorship Requests */}
        <div className="bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#26334D] mb-4">
            <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
              <HiOutlineAcademicCap className="w-5 h-5 text-[#818CF8]" />
              Recent Mentorships
            </h3>
            <Link
              to={ROUTES.STUDENT_MENTORSHIPS}
              className="text-xs font-semibold text-[#818CF8] hover:text-[#CBD5E1] flex items-center gap-1"
            >
              View All <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentMentorships.length === 0 ? (
            <EmptyState
              icon={HiOutlineAcademicCap}
              title="No mentorship requests"
              description="Connect with alumni mentors to boost your skills."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(ROUTES.MENTORSHIP)}
                  className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
                >
                  Find Mentors
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentMentorships.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#202B40] border border-[#26334D] hover:border-[#6366F1]/40 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC] truncate">
                      {req.topic}
                    </p>
                    <p className="text-xs text-[#94A3B8] truncate">
                      Mentor: {req.mentor?.fullName || 'Alumni'} &bull;{' '}
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      req.status === 'accepted' || req.status === 'completed'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : req.status === 'rejected' || req.status === 'cancelled'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Project Applications */}
        <div className="bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#26334D] mb-4">
            <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
              <HiOutlineSparkles className="w-5 h-5 text-emerald-400" />
              Recent Project Applications
            </h3>
            <Link
              to={ROUTES.PROJECTS}
              className="text-xs font-semibold text-[#818CF8] hover:text-[#CBD5E1] flex items-center gap-1"
            >
              Explore <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentProjectApps.length === 0 ? (
            <EmptyState
              icon={HiOutlineSparkles}
              title="No project applications"
              description="Join collaborative projects built by alumni and student peers."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(ROUTES.PROJECTS)}
                  className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
                >
                  View Projects
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentProjectApps.map((pApp) => (
                <div
                  key={pApp._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#202B40] border border-[#26334D] hover:border-[#6366F1]/40 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC] truncate">
                      {pApp.project?.title || 'Project'}
                    </p>
                    <p className="text-xs text-[#94A3B8] truncate">
                      Category: {pApp.project?.category || 'General'}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      pApp.status === 'accepted'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : pApp.status === 'rejected'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    }`}
                  >
                    {pApp.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#26334D] mb-4">
            <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
              <HiOutlineBell className="w-5 h-5 text-rose-400" />
              Recent Notifications
            </h3>
            <Link
              to={ROUTES.NOTIFICATIONS}
              className="text-xs font-semibold text-[#818CF8] hover:text-[#CBD5E1] flex items-center gap-1"
            >
              View All <HiOutlineArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentNotifications.length === 0 ? (
            <EmptyState
              icon={HiOutlineBell}
              title="All caught up"
              description="You have no recent notifications."
            />
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-3 rounded-xl border transition-colors ${
                    notif.isRead
                      ? 'bg-[#202B40] border-[#26334D]'
                      : 'bg-[#6366F1]/15 border-[#6366F1]/30'
                  }`}
                >
                  <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC] truncate">
                    {notif.title}
                  </p>
                  <p className="text-xs text-[#CBD5E1] line-clamp-1 mt-0.5">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-[#94A3B8] mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Floating AI Assistant Trigger Button (Bottom Right) */}
    {!isAIChatOpen && (
      <div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]"
        style={{
          position: 'fixed',
          zIndex: 9999,
        }}
      >
        <button
          type="button"
          onClick={() => setIsAIChatOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 text-white font-semibold text-xs sm:text-sm shadow-2xl hover:scale-105 transition-all duration-300 group border border-white/20"
          title="Open AlumniConnect AI Career Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-amber-300 group-hover:rotate-12 transition-transform">
            <HiOutlineSparkles className="w-4 h-4" />
          </div>
          <span>Ask AI Assistant</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          </span>
        </button>
      </div>
    )}

    {/* Real-time Google Gemini AI Chatbot Modal/Drawer */}
    <AIChatbot isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
  </>
  );
};

export default StudentDashboard;
