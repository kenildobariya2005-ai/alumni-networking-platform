import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineChatAlt2,
  HiOutlineBadgeCheck,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineExternalLink,
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineCalendar,
  HiOutlineVideoCamera,
  HiOutlineDocumentReport,
  HiOutlineRefresh,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth.js';
import { alumniService } from '../../services/alumniService.js';
import { jobService } from '../../services/jobService.js';
import { mentorshipService } from '../../services/mentorshipService.js';
import { projectService } from '../../services/projectService.js';
import { messageService } from '../../services/messageService.js';
import { communityService } from '../../services/communityService.js';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ROUTES from '../../constants/routes.js';

export const AlumniDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [profile, setProfile] = useState(null);

  // Core alumni states
  const [stats, setStats] = useState({
    profileCompletion: 0,
    mentorshipRequests: 0,
    activeJobPosts: 0,
    projectCollaborations: 0,
    unreadMessages: 0,
    networkConnections: 0,
  });

  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [networkAlumni, setNetworkAlumni] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);

  // Calculate profile completion percentage
  const computeCompletion = (prof) => {
    if (!prof) return 30;
    let score = 25; // base for user account
    if (prof.company) score += 15;
    if (prof.designation) score += 15;
    if (prof.experienceYears !== undefined && prof.experienceYears !== null) score += 10;
    if (prof.location) score += 10;
    if (Array.isArray(prof.skills) && prof.skills.length > 0) score += 15;
    if (prof.bio) score += 10;
    return Math.min(100, score);
  };

  const fetchAlumniDashboardData = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const [
        profileRes,
        jobsRes,
        mentorshipRes,
        projectsRes,
        messagesRes,
        networkRes,
        communityRes,
      ] = await Promise.allSettled([
        alumniService.getMyProfile(),
        jobService.getMyPostedJobs({ limit: 6 }),
        mentorshipService.getIncomingRequests({ limit: 10 }),
        projectService.getMyProjects({ limit: 6 }),
        messageService.getMyConversations(),
        alumniService.searchAlumni({ limit: 6 }),
        communityService.getPosts({ limit: 4 }),
      ]);

      // 1. Process Profile & Completion
      let currentProfile = null;
      let completionScore = 30;
      if (profileRes.status === 'fulfilled' && profileRes.value?.profile) {
        currentProfile = profileRes.value.profile;
        setProfile(currentProfile);
        completionScore = computeCompletion(currentProfile);
      } else {
        setProfile(null);
      }

      // 2. Process Jobs
      let jobsList = [];
      let activeJobsCount = 0;
      if (jobsRes.status === 'fulfilled' && jobsRes.value?.jobs) {
        jobsList = Array.isArray(jobsRes.value.jobs) ? jobsRes.value.jobs : [];
        setMyJobs(jobsList.slice(0, 4));
        activeJobsCount = jobsList.filter((j) => j?.status === 'Open').length;
      } else {
        setMyJobs([]);
      }

      // 3. Process Mentorship Requests & Upcoming Sessions
      let requestsList = [];
      let pendingRequestsCount = 0;
      if (mentorshipRes.status === 'fulfilled' && mentorshipRes.value?.data) {
        requestsList = Array.isArray(mentorshipRes.value.data) ? mentorshipRes.value.data : [];
        const pending = requestsList.filter((r) => r?.status === 'pending');
        const accepted = requestsList.filter(
          (r) => r?.status === 'accepted' || r?.status === 'scheduled'
        );

        setMentorshipRequests(pending.slice(0, 4));
        setUpcomingSessions(accepted.slice(0, 4));
        pendingRequestsCount = pending.length;
      } else {
        setMentorshipRequests([]);
        setUpcomingSessions([]);
      }

      // 4. Process Projects
      let projectsList = [];
      let activeProjectsCount = 0;
      if (projectsRes.status === 'fulfilled' && projectsRes.value?.data?.projects) {
        projectsList = Array.isArray(projectsRes.value.data.projects)
          ? projectsRes.value.data.projects
          : [];
        setMyProjects(projectsList.slice(0, 4));
        activeProjectsCount = projectsList.length;
      } else {
        setMyProjects([]);
      }

      // 5. Process Conversations & Unread Messages
      let conversationsList = [];
      let unreadMsgCount = 0;
      if (messagesRes.status === 'fulfilled' && messagesRes.value?.data?.conversations) {
        conversationsList = Array.isArray(messagesRes.value.data.conversations)
          ? messagesRes.value.data.conversations
          : [];
        setRecentConversations(conversationsList.slice(0, 4));
        unreadMsgCount = conversationsList.reduce(
          (acc, conv) => acc + (conv?.unreadCount || 0),
          0
        );
      } else {
        setRecentConversations([]);
      }

      // 6. Process Alumni Network Connections
      let connectionsCount = 0;
      if (networkRes.status === 'fulfilled' && networkRes.value?.profiles) {
        const networkProfiles = Array.isArray(networkRes.value.profiles)
          ? networkRes.value.profiles
          : [];
        // Filter out self safely
        const otherAlumni = networkProfiles.filter(
          (p) => p?.user?._id && p.user._id !== user?._id
        );
        setNetworkAlumni(otherAlumni.slice(0, 4));
        connectionsCount = networkRes.value.total ?? otherAlumni.length;
      } else {
        setNetworkAlumni([]);
      }

      // 7. Process Community Posts
      if (communityRes.status === 'fulfilled' && communityRes.value?.data?.posts) {
        const posts = Array.isArray(communityRes.value.data.posts)
          ? communityRes.value.data.posts
          : [];
        setCommunityPosts(posts.slice(0, 3));
      } else {
        setCommunityPosts([]);
      }

      // Update aggregate activity stats
      setStats({
        profileCompletion: completionScore,
        mentorshipRequests: pendingRequestsCount,
        activeJobPosts: activeJobsCount,
        projectCollaborations: activeProjectsCount,
        unreadMessages: unreadMsgCount,
        networkConnections: connectionsCount,
      });
    } catch (err) {
      console.error('[AlumniDashboard] Error loading alumni data:', err);
      setFetchError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchAlumniDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle mentorship action: Accept
  const handleAcceptRequest = async (requestId) => {
    try {
      await mentorshipService.acceptRequest(requestId);
      toast.success('Mentorship request accepted! Scheduled session created.');
      // Refresh list locally
      setMentorshipRequests((prev) => prev.filter((r) => r._id !== requestId));
      setStats((prev) => ({
        ...prev,
        mentorshipRequests: Math.max(0, prev.mentorshipRequests - 1),
      }));
      // Re-fetch to populate upcoming sessions
      fetchAlumniDashboardData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to accept request');
    }
  };

  // Handle mentorship action: Decline
  const handleDeclineRequest = async (requestId) => {
    try {
      await mentorshipService.rejectRequest(requestId);
      toast.success('Mentorship request declined');
      setMentorshipRequests((prev) => prev.filter((r) => r._id !== requestId));
      setStats((prev) => ({
        ...prev,
        mentorshipRequests: Math.max(0, prev.mentorshipRequests - 1),
      }));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to decline request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" message="Loading your alumni workspace..." />
      </div>
    );
  }

  const isVerified = user?.isVerified || profile?.isVerified;

  return (
    <div className="space-y-8 animate-fade-in text-[#CBD5E1]">
      {/* Optional API Error Notification Banner with Retry */}
      {fetchError && (
        <div className="bg-rose-950/70 border border-rose-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-900/80 flex items-center justify-center flex-shrink-0 text-rose-400">
              <HiOutlineX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Unable to load dashboard data.</p>
              <p className="text-xs text-rose-300 mt-0.5">{fetchError}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={HiOutlineRefresh}
            onClick={fetchAlumniDashboardData}
            className="bg-rose-900/40 text-white border-rose-700 hover:bg-rose-900 text-xs px-3 py-1.5 self-start sm:self-auto"
          >
            Retry
          </Button>
        </div>
      )}

      {/* TOP WELCOME SECTION (Strictly per prompt specification) */}
      <div className="bg-[#151E32] rounded-2xl p-6 sm:p-8 text-[#F8FAFC] border border-[#26334D] relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30">
                💼 Alumni Network
              </span>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  <HiOutlineBadgeCheck className="w-4 h-4 text-emerald-400" /> Verified Alumni
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                  Pending Verification
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F8FAFC]">
              Welcome back, {user?.fullName || 'Alumni'}
            </h1>
            <p className="text-[#CBD5E1] text-xs sm:text-sm leading-relaxed">
              Stay connected, mentor students, share opportunities, and grow your alumni network.
            </p>
          </div>

          {/* Profile Completion Box */}
          <div className="bg-[#202B40] rounded-2xl p-5 border border-[#334155] min-w-[260px] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#F8FAFC]">
              <span>Profile Completion</span>
              <span className="text-emerald-400 font-bold">{stats.profileCompletion}%</span>
            </div>
            <div className="w-full bg-[#151E32] rounded-full h-2.5 overflow-hidden border border-[#26334D]">
              <div
                className="bg-gradient-to-r from-[#6366F1] to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.profileCompletion}%` }}
              />
            </div>
            {stats.profileCompletion < 100 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-[#202B40] text-[#F8FAFC] hover:bg-[#151E32] border-[#334155] hover:border-[#6366F1] text-xs font-semibold py-1.5 shadow-sm"
                onClick={() => navigate(ROUTES.ALUMNI_PROFILE)}
              >
                Complete Profile &rarr;
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* PERSONAL / ACTIVITY STATISTICS (6 CARDS STRICTLY PER PROMPT) */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC] uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          My Activity Overview
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* 1. Profile Completion */}
          <div
            onClick={() => navigate(ROUTES.ALUMNI_PROFILE)}
            className="cursor-pointer rounded-2xl p-4 bg-[#151E32] border border-[#26334D] hover:border-emerald-500/50 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8] font-medium">Profile</span>
              <HiOutlineBadgeCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-2">
              {stats.profileCompletion}%
            </p>
            <span className="text-[11px] text-emerald-400 block mt-1">Completion</span>
          </div>

          {/* 2. Mentorship Requests */}
          <div
            onClick={() => navigate(ROUTES.ALUMNI_MENTORSHIPS)}
            className="cursor-pointer rounded-2xl p-4 bg-[#151E32] border border-[#26334D] hover:border-[#6366F1] transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8] font-medium">Mentorship</span>
              <HiOutlineAcademicCap className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-2">
              {stats.mentorshipRequests}
            </p>
            <span className="text-[11px] text-purple-300 block mt-1">Pending Requests</span>
          </div>

          {/* 3. Active Job Posts */}
          <div
            onClick={() => navigate(ROUTES.ALUMNI_JOBS)}
            className="cursor-pointer rounded-2xl p-4 bg-[#151E32] border border-[#26334D] hover:border-blue-500/50 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8] font-medium">Job Posts</span>
              <HiOutlineBriefcase className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-2">
              {stats.activeJobPosts}
            </p>
            <span className="text-[11px] text-blue-300 block mt-1">Active Listings</span>
          </div>

          {/* 4. Project Collaborations */}
          <div
            onClick={() => navigate(ROUTES.ALUMNI_PROJECTS)}
            className="cursor-pointer rounded-2xl p-4 bg-[#151E32] border border-[#26334D] hover:border-cyan-500/50 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8] font-medium">Projects</span>
              <HiOutlineSparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-2">
              {stats.projectCollaborations}
            </p>
            <span className="text-[11px] text-cyan-300 block mt-1">Collaborations</span>
          </div>

          {/* 5. Unread Messages */}
          <div
            onClick={() => navigate(ROUTES.CHAT)}
            className="cursor-pointer rounded-2xl p-4 bg-[#151E32] border border-[#26334D] hover:border-amber-500/50 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8] font-medium">Messages</span>
              <HiOutlineChatAlt2 className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-2">
              {stats.unreadMessages}
            </p>
            <span className="text-[11px] text-amber-300 block mt-1">Unread Alerts</span>
          </div>

          {/* 6. Network Connections */}
          <div
            onClick={() => navigate(ROUTES.ALUMNI_NETWORK)}
            className="cursor-pointer rounded-2xl p-4 bg-[#151E32] border border-[#26334D] hover:border-teal-500/50 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#94A3B8] font-medium">Network</span>
              <HiOutlineUserGroup className="w-5 h-5 text-teal-400" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-2">
              {stats.networkConnections}
            </p>
            <span className="text-[11px] text-teal-300 block mt-1">Alumni Directory</span>
          </div>
        </div>
      </div>

      {/* SECTION A & B: MENTORSHIP REQUESTS & MY JOB POSTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Mentorship Requests */}
        <div className="bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#26334D] mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                  <HiOutlineAcademicCap className="w-5 h-5 text-purple-400" />
                  A. Student Mentorship Requests
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Incoming 1-on-1 guidance inquiries from students
                </p>
              </div>
              <Link
                to={ROUTES.ALUMNI_MENTORSHIPS}
                className="text-xs font-semibold text-[#818CF8] hover:text-white flex items-center gap-1"
              >
                View All <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {mentorshipRequests.length === 0 ? (
              <EmptyState
                icon={HiOutlineAcademicCap}
                title="No pending mentorship requests"
                description="When students request guidance on career roadmaps or interviews, they will appear here."
              />
            ) : (
              <div className="space-y-3">
                {mentorshipRequests.map((req) => (
                  <div
                    key={req._id}
                    className="p-3.5 rounded-xl bg-[#202B40] border border-[#26334D] space-y-2 hover:border-[#334155] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[#F8FAFC] truncate">
                          {req.topic}
                        </p>
                        <p className="text-xs text-[#CBD5E1] mt-0.5 line-clamp-1">
                          {req.message}
                        </p>
                        <p className="text-[11px] text-[#94A3B8] mt-1">
                          From: <strong>{req.student?.fullName || 'Student'}</strong> &bull;{' '}
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60 flex-shrink-0">
                        Pending
                      </span>
                    </div>

                    {/* Actions: View Request, Accept, Decline */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#151E32]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(ROUTES.ALUMNI_MENTORSHIPS)}
                        className="text-xs text-[#94A3B8] hover:text-white px-2 py-1 h-auto"
                      >
                        View Request
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={HiOutlineX}
                        onClick={() => handleDeclineRequest(req._id)}
                        className="bg-transparent text-rose-400 border-rose-800/50 hover:bg-rose-950/40 text-xs px-2.5 py-1 h-auto"
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={HiOutlineCheck}
                        onClick={() => handleAcceptRequest(req._id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1 h-auto shadow-sm"
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#26334D] flex items-center justify-between text-xs text-[#94A3B8]">
            <span>
              Available for Mentorship:{' '}
              <strong className={profile?.mentorAvailable ? 'text-emerald-400' : 'text-amber-400'}>
                {profile?.mentorAvailable ? 'Active' : 'Paused'}
              </strong>
            </span>
            <Link to={ROUTES.ALUMNI_PROFILE} className="text-[#818CF8] hover:underline font-medium">
              Update Availability &rarr;
            </Link>
          </div>
        </div>

        {/* B. My Job Posts */}
        <div className="bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#26334D] mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                  <HiOutlineBriefcase className="w-5 h-5 text-blue-400" />
                  B. My Job Posts & Opportunities
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Positions and internship openings you published
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={HiOutlinePlus}
                onClick={() => navigate(ROUTES.CREATE_JOB)}
                className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-soft-sm"
              >
                Post Job
              </Button>
            </div>

            {myJobs.length === 0 ? (
              <EmptyState
                icon={HiOutlineBriefcase}
                title="No jobs published yet"
                description="Share internship or job openings with verified students across the university network."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(ROUTES.CREATE_JOB)}
                    className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:text-[#F8FAFC]"
                  >
                    Post First Opening
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {myJobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-3.5 rounded-xl bg-[#202B40] border border-[#26334D] flex items-center justify-between gap-3 hover:border-[#334155] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC] truncate">
                        {job.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#94A3B8] mt-0.5">
                        <span>{job.company || profile?.company || 'Company'}</span>
                        <span>&bull;</span>
                        <span>{job.location || 'Remote'}</span>
                        <span>&bull;</span>
                        <span className="text-indigo-300 font-medium">
                          {job.applicationsCount || 0} applications
                        </span>
                      </div>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">
                        Posted: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          job.status === 'Open'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {job.status}
                      </span>
                      <Link
                        to={ROUTES.ALUMNI_JOBS}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E32] transition-colors"
                        title="Manage Job"
                      >
                        <HiOutlineExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#26334D] flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Active openings: {stats.activeJobPosts}</span>
            <Link to={ROUTES.ALUMNI_JOBS} className="text-[#818CF8] hover:underline font-semibold">
              Manage Jobs & Applicants &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION G & C: UPCOMING SESSIONS & PROJECT COLLABORATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* G. Upcoming Mentorship Sessions */}
        <div className="bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#26334D] mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                  <HiOutlineCalendar className="w-5 h-5 text-emerald-400" />
                  G. Upcoming Mentorship Sessions
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Confirmed 1-on-1 scheduled sessions with students
                </p>
              </div>
              <Link
                to={ROUTES.ALUMNI_MENTORSHIPS}
                className="text-xs font-semibold text-[#818CF8] hover:text-white flex items-center gap-1"
              >
                Schedule &rarr;
              </Link>
            </div>

            {upcomingSessions.length === 0 ? (
              <EmptyState
                icon={HiOutlineCalendar}
                title="No scheduled sessions"
                description="Accepted mentorship sessions with preferred meeting dates will appear here."
              />
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session._id}
                    className="p-3.5 rounded-xl bg-[#202B40] border border-[#26334D] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC] truncate">
                        {session.topic}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                        With: <strong className="text-[#CBD5E1]">{session.student?.fullName || 'Student'}</strong>
                      </p>
                      <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                        <HiOutlineCalendar className="w-3.5 h-3.5" />
                        {session.scheduledAt
                          ? new Date(session.scheduledAt).toLocaleString()
                          : session.preferredDate
                          ? `Preferred: ${new Date(session.preferredDate).toLocaleDateString()}`
                          : 'Date TBD'}
                      </p>
                    </div>

                    {session.meetingLink ? (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-soft-sm flex-shrink-0"
                      >
                        <HiOutlineVideoCamera className="w-4 h-4" /> Join
                      </a>
                    ) : (
                      <Link
                        to={`/mentorship/schedule/${session._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#151E32] text-indigo-300 border border-indigo-700/50 hover:bg-indigo-950/40 text-xs font-medium flex-shrink-0"
                      >
                        Set Link
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#26334D] text-xs text-[#94A3B8] flex items-center justify-between">
            <span>Synchronized with Google Meet & Zoom integrations</span>
            <Link to={ROUTES.ALUMNI_MENTORSHIPS} className="text-[#818CF8] hover:underline font-medium">
              View Calendar &rarr;
            </Link>
          </div>
        </div>

        {/* C. Project Collaborations */}
        <div className="bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#26334D] mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                  <HiOutlineSparkles className="w-5 h-5 text-cyan-400" />
                  C. Project Collaborations
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Industry & student collaborative initiatives
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={HiOutlinePlus}
                onClick={() => navigate(ROUTES.CREATE_PROJECT)}
                className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:text-[#F8FAFC] text-xs font-semibold"
              >
                New Project
              </Button>
            </div>

            {myProjects.length === 0 ? (
              <EmptyState
                icon={HiOutlineSparkles}
                title="No collaborative projects"
                description="Lead an engineering project or invite talented student contributors to join."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(ROUTES.CREATE_PROJECT)}
                    className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:text-[#F8FAFC]"
                  >
                    Start Project
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {myProjects.map((p) => (
                  <div
                    key={p._id}
                    className="p-3.5 rounded-xl bg-[#202B40] border border-[#26334D] flex items-center justify-between gap-3 hover:border-[#334155] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-[#F8FAFC] truncate">
                        {p.title}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                        Category: {p.category || 'Engineering'} &bull;{' '}
                        {p.teamMembers?.length || 0}/{p.maxTeamSize || 5} members
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30">
                        {p.status}
                      </span>
                      <Link
                        to={`/projects/${p._id}`}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E32] transition-colors"
                      >
                        <HiOutlineExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#26334D] text-xs text-[#94A3B8] flex items-center justify-between">
            <span>Collaborative teams</span>
            <Link to={ROUTES.ALUMNI_PROJECTS} className="text-[#818CF8] hover:underline font-semibold">
              Manage All Projects &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION D, E, F: RECENT MESSAGES, ALUMNI NETWORK & COMMUNITY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* D. Recent Messages */}
        <div className="bg-[#151E32] rounded-2xl p-5 border border-[#26334D] shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#26334D] mb-3">
              <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                <HiOutlineChatAlt2 className="w-5 h-5 text-amber-400" />
                D. Recent Messages
              </h3>
              <Link to={ROUTES.CHAT} className="text-xs text-[#818CF8] hover:underline">
                Open Chat &rarr;
              </Link>
            </div>

            {recentConversations.length === 0 ? (
              <p className="text-xs text-[#94A3B8] py-4 text-center">
                No conversations started yet. Connect with students or alumni.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentConversations.map((conv) => {
                  const partner = conv.partner || conv.participant || {};
                  return (
                    <div
                      key={partner._id || conv._id}
                      onClick={() => navigate(`/chat/${partner._id}`)}
                      className="cursor-pointer p-2.5 rounded-xl bg-[#202B40] border border-[#26334D] hover:border-[#334155] transition-colors flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#151E32] text-[#818CF8] font-bold flex items-center justify-center text-xs flex-shrink-0 border border-[#6366F1]/30">
                        {partner.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                            {partner.fullName || 'User'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-[#6366F1] text-white text-[10px] font-bold flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                          {conv.lastMessage?.message || 'Started a conversation'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#26334D] text-xs text-[#94A3B8]">
            <Link to={ROUTES.CHAT} className="text-[#818CF8] hover:underline font-medium">
              View Direct Messages &rarr;
            </Link>
          </div>
        </div>

        {/* E. Alumni Network */}
        <div className="bg-[#151E32] rounded-2xl p-5 border border-[#26334D] shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#26334D] mb-3">
              <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                <HiOutlineUserGroup className="w-5 h-5 text-teal-400" />
                E. Alumni Network
              </h3>
              <Link to={ROUTES.ALUMNI_NETWORK} className="text-xs text-[#818CF8] hover:underline">
                Directory &rarr;
              </Link>
            </div>

            {networkAlumni.length === 0 ? (
              <p className="text-xs text-[#94A3B8] py-4 text-center">
                Explore the alumni directory to discover fellow graduates.
              </p>
            ) : (
              <div className="space-y-2.5">
                {networkAlumni.map((a) => (
                  <div
                    key={a._id}
                    className="p-2.5 rounded-xl bg-[#202B40] border border-[#26334D] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                        {a.user?.fullName || 'Alumni'}
                      </p>
                      <p className="text-[10px] text-emerald-400 truncate">
                        {a.designation} at {a.company}
                      </p>
                    </div>
                    <Link
                      to={`/chat/${a.user?._id}`}
                      className="px-2 py-1 rounded-lg bg-[#151E32] text-[#818CF8] hover:text-white border border-[#26334D] text-[11px] font-medium flex-shrink-0"
                    >
                      Connect
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#26334D] text-xs text-[#94A3B8]">
            <Link to={ROUTES.ALUMNI_NETWORK} className="text-[#818CF8] hover:underline font-medium">
              Explore Network Directory &rarr;
            </Link>
          </div>
        </div>

        {/* F. Community Activity */}
        <div className="bg-[#151E32] rounded-2xl p-5 border border-[#26334D] shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#26334D] mb-3">
              <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                <HiOutlineDocumentReport className="w-5 h-5 text-indigo-400" />
                F. Community Activity
              </h3>
              <Link to={ROUTES.COMMUNITY} className="text-xs text-[#818CF8] hover:underline">
                Feed &rarr;
              </Link>
            </div>

            {communityPosts.length === 0 ? (
              <p className="text-xs text-[#94A3B8] py-4 text-center">
                No recent community interactions.
              </p>
            ) : (
              <div className="space-y-2.5">
                {communityPosts.map((post) => (
                  <div
                    key={post._id}
                    onClick={() => navigate(ROUTES.COMMUNITY)}
                    className="cursor-pointer p-2.5 rounded-xl bg-[#202B40] border border-[#26334D] hover:border-[#334155] transition-colors space-y-1"
                  >
                    <p className="text-xs font-medium text-[#F8FAFC] line-clamp-1">
                      {post.content || 'Shared an update'}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
                      <span>By: {post.author?.fullName || 'Community Member'}</span>
                      <span>{post.likesCount || 0} likes &bull; {post.commentsCount || 0} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#26334D] text-xs text-[#94A3B8]">
            <Link to={ROUTES.CREATE_POST} className="text-[#818CF8] hover:underline font-medium">
              Share Community Post &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
