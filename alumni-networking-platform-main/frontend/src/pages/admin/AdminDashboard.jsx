import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineDocumentReport,
  HiOutlineClipboardList,
  HiOutlineExclamationCircle,
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineEye,
  HiOutlineRefresh,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService.js';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import ROUTES from '../../constants/routes.js';

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activityTab, setActivityTab] = useState('all');

  const fetchAdminData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [statsRes, activityRes, analyticsRes] = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getDashboardActivity(),
        adminService.getDashboardAnalytics(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }

      if (activityRes.status === 'fulfilled' && activityRes.value?.data) {
        setActivity(activityRes.value.data);
      }

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data) {
        setAnalytics(analyticsRes.value.data);
      }

      if (isManualRefresh) {
        toast.success('Platform metrics refreshed');
      }
    } catch (err) {
      console.error('[AdminDashboard] Error loading admin intelligence:', err);
      toast.error('Failed to load latest platform metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchAdminData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickVerify = async (userId, userName) => {
    try {
      await adminService.verifyAlumni(userId);
      toast.success(`Alumni ${userName || ''} verified successfully!`);
      // Update local state without full reload
      setActivity((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          recentPendingAlumni: prev.recentPendingAlumni?.filter(
            (u) => u._id !== userId
          ),
        };
      });
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          pendingAlumniVerifications: Math.max(0, (prev.pendingAlumniVerifications || 1) - 1),
        };
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to verify alumni profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" message="Loading platform administration intelligence..." />
      </div>
    );
  }

  // Safe data accessors
  const s = stats || {};
  const uStats = s.users || {};
  const jStats = s.jobs || {};
  const mStats = s.mentorship || {};
  const pStats = s.projects || {};
  const cStats = s.community || {};
  const modStats = s.moderation || {};

  const recentUsers = activity?.recentUsers || [];
  const pendingAlumni = activity?.recentPendingAlumni || [];
  const recentJobs = activity?.recentJobs || [];
  const recentMentorships = activity?.recentMentorships || [];
  const recentProjects = activity?.recentProjects || [];
  const recentPosts = activity?.recentPosts || [];
  const recentLogs = activity?.recentAuditLogs || [];

  // Top 8 statistics cards configuration
  const topStatsCards = [
    {
      title: 'Total Students',
      value: s.totalStudents ?? uStats.students ?? 0,
      subtext: 'Registered & Active',
      icon: HiOutlineAcademicCap,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      route: `${ROUTES.ADMIN_USERS}?role=student`,
    },
    {
      title: 'Total Alumni',
      value: s.totalAlumni ?? uStats.alumni ?? 0,
      subtext: `${uStats.verifiedAlumni || 0} Verified Mentors`,
      icon: HiOutlineBriefcase,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      route: `${ROUTES.ADMIN_USERS}?role=alumni`,
    },
    {
      title: 'Pending Verifications',
      value: s.pendingAlumniVerifications ?? uStats.pendingAlumni ?? 0,
      subtext: 'Requires Admin Review',
      icon: HiOutlineShieldCheck,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      route: ROUTES.ADMIN_ALUMNI_VERIFICATION,
      highlight: true,
    },
    {
      title: 'Active Job Posts',
      value: s.activeJobPosts ?? jStats.open ?? 0,
      subtext: `${jStats.applications || 0} applications received`,
      icon: HiOutlineBriefcase,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      route: ROUTES.ADMIN_JOBS,
    },
    {
      title: 'Active Mentorships',
      value: s.activeMentorshipRequests ?? mStats.active ?? 0,
      subtext: `${mStats.completed || 0} completed sessions`,
      icon: HiOutlineAcademicCap,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      route: ROUTES.ADMIN_MENTORSHIP,
    },
    {
      title: 'Active Projects',
      value: s.activeProjects ?? pStats.active ?? 0,
      subtext: `${pStats.total || 0} collaborative teams`,
      icon: HiOutlineSparkles,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      route: ROUTES.ADMIN_PROJECTS,
    },
    {
      title: 'Community Posts',
      value: s.communityPosts ?? cStats.posts ?? 0,
      subtext: `${cStats.comments || 0} user discussions`,
      icon: HiOutlineDocumentReport,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      route: ROUTES.ADMIN_MODERATION,
    },
    {
      title: 'Reported / Flagged',
      value: s.reportedFlaggedContent ?? modStats.reportedFlaggedContent ?? 0,
      subtext: 'Flagged posts & suspended accounts',
      icon: HiOutlineExclamationCircle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      route: ROUTES.ADMIN_MODERATION,
      highlight: (s.reportedFlaggedContent ?? modStats.reportedFlaggedContent ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in text-[#CBD5E1]">
      {/* Platform Administration Header Banner */}
      <div className="bg-[#151E32] rounded-2xl p-6 sm:p-8 text-[#F8FAFC] border border-[#334155] relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#6366F1]/20 text-[#818CF8] border border-[#6366F1]/40 uppercase tracking-wider">
                <HiOutlineShieldCheck className="w-4 h-4 text-emerald-400" /> Platform Administration
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> System Operational
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F8FAFC]">
              Platform Management & Oversight
            </h1>
            <p className="text-[#94A3B8] text-xs sm:text-sm leading-relaxed">
              Global control center for AlumniConnect. Monitor live university metrics, verify alumni industry credentials, moderate community feeds, and review security audit trails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={HiOutlineRefresh}
              onClick={() => fetchAdminData(true)}
              disabled={refreshing}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:text-[#F8FAFC] text-xs font-semibold"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={HiOutlineShieldCheck}
              onClick={() => navigate(ROUTES.ADMIN_ALUMNI_VERIFICATION)}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-soft-sm"
            >
              Review Verifications
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={HiOutlineClipboardList}
              onClick={() => navigate(ROUTES.ADMIN_AUDIT_LOGS)}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:text-[#F8FAFC] text-xs font-semibold"
            >
              Audit Trail
            </Button>
          </div>
        </div>
      </div>

      {/* TOP STATISTICS CARDS (8 PLATFORM METRICS) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
            Platform-Level Core Metrics
          </h2>
          <span className="text-xs text-[#94A3B8]">Auto-synchronized from MongoDB</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topStatsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                onClick={() => navigate(card.route)}
                className={`group cursor-pointer rounded-2xl p-4 sm:p-5 bg-[#151E32] border transition-all duration-200 hover:border-[#6366F1] hover:shadow-lg hover:-translate-y-0.5 ${
                  card.highlight ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-[#334155]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#94A3B8] group-hover:text-[#CBD5E1] transition-colors">
                      {card.title}
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color} border ${card.borderColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-[#26334D] flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span>{card.subtext}</span>
                  <span className="text-[#818CF8] group-hover:translate-x-0.5 transition-transform">
                    &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION A & B: USER OVERVIEW & ALUMNI VERIFICATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. User Overview Section */}
        <div className="bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#334155] shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#26334D] mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                  <HiOutlineUserGroup className="w-5 h-5 text-[#818CF8]" />
                  A. User Account Overview
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Platform account distribution & recent sign-ups
                </p>
              </div>
              <Link
                to={ROUTES.ADMIN_USERS}
                className="text-xs font-semibold text-[#818CF8] hover:text-white flex items-center gap-1"
              >
                Manage All <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Counts breakdown row */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D] text-center">
                <span className="text-[11px] text-[#94A3B8] block font-medium">Students</span>
                <span className="text-lg font-bold text-indigo-400">
                  {uStats.students ?? s.totalStudents ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D] text-center">
                <span className="text-[11px] text-[#94A3B8] block font-medium">Alumni</span>
                <span className="text-lg font-bold text-emerald-400">
                  {uStats.alumni ?? s.totalAlumni ?? 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D] text-center">
                <span className="text-[11px] text-[#94A3B8] block font-medium">Admins</span>
                <span className="text-lg font-bold text-indigo-300">
                  {uStats.admins ?? s.totalAdmins ?? 1}
                </span>
              </div>
            </div>

            {/* Recently registered users compact table */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                Recently Registered Users
              </p>
              {recentUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#94A3B8] bg-[#202B40] rounded-xl border border-[#26334D]">
                  No recent registrations
                </div>
              ) : (
                <div className="space-y-2">
                  {recentUsers.slice(0, 4).map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#202B40] border border-[#26334D] hover:border-[#334155] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#151E32] text-[#818CF8] font-bold flex items-center justify-center text-xs flex-shrink-0 border border-[#6366F1]/30">
                          {u.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                            {u.fullName}
                          </p>
                          <p className="text-[11px] text-[#94A3B8] truncate">{u.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            u.role === 'alumni'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                              : u.role === 'admin'
                              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                              : 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                          }`}
                        >
                          {u.role}
                        </span>
                        <Link
                          to={`/admin/users/${u._id}`}
                          className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E32]"
                          title="View user details"
                        >
                          <HiOutlineEye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#26334D] flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Active: {uStats.active || 0} &bull; Inactive: {uStats.inactive || 0}</span>
            <Link to={ROUTES.ADMIN_USERS} className="text-[#818CF8] hover:underline font-medium">
              Filter by Role &rarr;
            </Link>
          </div>
        </div>

        {/* B. Alumni Verification Section */}
        <div className="bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#334155] shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#26334D] mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                  <HiOutlineShieldCheck className="w-5 h-5 text-amber-400" />
                  B. Alumni Verification Queue
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Pending profile credential verification
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {s.pendingAlumniVerifications ?? uStats.pendingAlumni ?? 0} Pending
              </span>
            </div>

            {/* Pending alumni list with quick action */}
            <div className="space-y-2.5">
              {pendingAlumni.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-[#202B40] border border-[#26334D] space-y-2">
                  <HiOutlineCheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold text-[#F8FAFC]">Queue is all caught up!</p>
                  <p className="text-[11px] text-[#94A3B8]">
                    No unverified alumni accounts are currently pending review.
                  </p>
                </div>
              ) : (
                pendingAlumni.slice(0, 4).map((alumni) => (
                  <div
                    key={alumni._id}
                    className="p-3 rounded-xl bg-[#202B40] border border-[#26334D] flex items-center justify-between gap-3 hover:border-[#334155] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#F8FAFC] truncate">
                          {alumni.fullName}
                        </p>
                        <span className="text-[10px] text-[#94A3B8] truncate">&bull; {alumni.email}</span>
                      </div>
                      <p className="text-[11px] text-emerald-400 mt-0.5 truncate">
                        {alumni.profile?.designation || 'Alumni'} at {alumni.profile?.company || 'Industry Partner'}
                        {alumni.profile?.experienceYears ? ` (${alumni.profile.experienceYears}y exp)` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={HiOutlineCheck}
                        onClick={() => handleQuickVerify(alumni._id, alumni.fullName)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1 h-auto"
                      >
                        Verify
                      </Button>
                      <Link
                        to={ROUTES.ADMIN_ALUMNI_VERIFICATION}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151E32] transition-colors text-xs font-medium border border-[#334155]"
                        title="Open Review Portal"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#26334D] flex items-center justify-between text-xs text-[#94A3B8]">
            <span>
              Verified Alumni:{' '}
              <strong className="text-emerald-400">{uStats.verifiedAlumni || 0}</strong>
            </span>
            <Link
              to={ROUTES.ADMIN_ALUMNI_VERIFICATION}
              className="text-[#818CF8] hover:underline font-semibold"
            >
              Open Full Verification Portal &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION C: PLATFORM ACTIVITY (REAL-TIME ACROSS MODULES) */}
      <div className="bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#334155] shadow-soft-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#26334D]">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
              <HiOutlineSparkles className="w-5 h-5 text-[#818CF8]" />
              C. Real-Time Platform Activity Stream
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Live updates across job postings, mentorship requests, projects, and community interactions
            </p>
          </div>

          {/* Activity Category Filter Tabs */}
          <div className="flex flex-wrap gap-1 bg-[#202B40] p-1 rounded-xl border border-[#26334D]">
            {[
              { id: 'all', label: 'All Activity' },
              { id: 'jobs', label: 'Jobs' },
              { id: 'mentorship', label: 'Mentorship' },
              { id: 'projects', label: 'Projects' },
              { id: 'community', label: 'Community' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivityTab(tab.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activityTab === tab.id
                    ? 'bg-[#6366F1] text-white shadow-soft-sm'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Activity Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Recent Job Posts */}
          {(activityTab === 'all' || activityTab === 'jobs') && (
            <div className="p-3.5 rounded-xl bg-[#202B40] border border-[#26334D] space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#26334D]/60">
                <span className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <HiOutlineBriefcase className="w-4 h-4 text-blue-400" /> New Job Posts
                </span>
                <Link to={ROUTES.ADMIN_JOBS} className="text-[11px] text-[#818CF8] hover:underline">
                  Manage &rarr;
                </Link>
              </div>
              {recentJobs.length === 0 ? (
                <p className="text-[#94A3B8] py-2 text-center text-[11px]">No recent job posts</p>
              ) : (
                <div className="space-y-2">
                  {recentJobs.slice(0, 3).map((job) => (
                    <div key={job._id} className="p-2 rounded-lg bg-[#151E32] border border-[#26334D]/60">
                      <p className="font-semibold text-[#F8FAFC] truncate">{job.title}</p>
                      <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">
                        {job.company} &bull; {job.location || 'Remote'}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-medium">{job.status}</span>
                        <span className="text-[#94A3B8]">{job.applicationsCount || 0} applicants</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Mentorship Requests */}
          {(activityTab === 'all' || activityTab === 'mentorship') && (
            <div className="p-3.5 rounded-xl bg-[#202B40] border border-[#26334D] space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#26334D]/60">
                <span className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <HiOutlineAcademicCap className="w-4 h-4 text-purple-400" /> Mentorship Requests
                </span>
                <Link to={ROUTES.ADMIN_MENTORSHIP} className="text-[11px] text-[#818CF8] hover:underline">
                  Manage &rarr;
                </Link>
              </div>
              {recentMentorships.length === 0 ? (
                <p className="text-[#94A3B8] py-2 text-center text-[11px]">No mentorship requests</p>
              ) : (
                <div className="space-y-2">
                  {recentMentorships.slice(0, 3).map((m) => (
                    <div key={m._id} className="p-2 rounded-lg bg-[#151E32] border border-[#26334D]/60">
                      <p className="font-semibold text-[#F8FAFC] truncate">{m.topic}</p>
                      <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">
                        Student: {m.student?.fullName || 'Student'} &bull; Mentor: {m.mentor?.fullName || 'Alumni'}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="capitalize font-medium text-amber-300">{m.status}</span>
                        <span className="text-[#94A3B8]">{new Date(m.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Collaborative Projects */}
          {(activityTab === 'all' || activityTab === 'projects') && (
            <div className="p-3.5 rounded-xl bg-[#202B40] border border-[#26334D] space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#26334D]/60">
                <span className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <HiOutlineSparkles className="w-4 h-4 text-cyan-400" /> Collaborative Projects
                </span>
                <Link to={ROUTES.ADMIN_PROJECTS} className="text-[11px] text-[#818CF8] hover:underline">
                  Manage &rarr;
                </Link>
              </div>
              {recentProjects.length === 0 ? (
                <p className="text-[#94A3B8] py-2 text-center text-[11px]">No projects created</p>
              ) : (
                <div className="space-y-2">
                  {recentProjects.slice(0, 3).map((p) => (
                    <div key={p._id} className="p-2 rounded-lg bg-[#151E32] border border-[#26334D]/60">
                      <p className="font-semibold text-[#F8FAFC] truncate">{p.title}</p>
                      <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">
                        By: {p.createdBy?.fullName || p.creator?.fullName || 'User'} &bull; Cat: {p.category || 'General'}
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="capitalize font-medium text-cyan-300">{p.status}</span>
                        <span className="text-[#94A3B8]">{p.teamMembers?.length || 0} members</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Community Posts */}
          {(activityTab === 'all' || activityTab === 'community') && (
            <div className="p-3.5 rounded-xl bg-[#202B40] border border-[#26334D] space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-[#26334D]/60">
                <span className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
                  <HiOutlineDocumentReport className="w-4 h-4 text-teal-400" /> Community Posts
                </span>
                <Link to={ROUTES.ADMIN_MODERATION} className="text-[11px] text-[#818CF8] hover:underline">
                  Moderate &rarr;
                </Link>
              </div>
              {recentPosts.length === 0 ? (
                <p className="text-[#94A3B8] py-2 text-center text-[11px]">No community posts</p>
              ) : (
                <div className="space-y-2">
                  {recentPosts.slice(0, 3).map((post) => (
                    <div key={post._id} className="p-2 rounded-lg bg-[#151E32] border border-[#26334D]/60">
                      <p className="font-medium text-[#F8FAFC] line-clamp-1">{post.content || 'Image post'}</p>
                      <p className="text-[10px] text-[#94A3B8] truncate mt-0.5">
                        By: {post.author?.fullName || 'Author'} &bull; {post.likesCount || 0} likes
                      </p>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span
                          className={`font-medium ${
                            post.status === 'hidden' ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {post.status}
                        </span>
                        <span className="text-[#94A3B8]">{post.commentsCount || 0} comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION D & E: MODERATION/REPORTS & PLATFORM ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* D. Content Moderation & Reports */}
        <div className="bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#334155] shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#26334D] mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                  <HiOutlineDocumentReport className="w-5 h-5 text-rose-400" />
                  D. Content Moderation & Security
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Platform safety, hidden posts, and flagged items
                </p>
              </div>
              <Link
                to={ROUTES.ADMIN_MODERATION}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                Moderate Center <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center text-xs">
              <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] text-[#94A3B8] block">Hidden Posts</span>
                <span className="text-lg font-bold text-rose-400">
                  {modStats.hiddenPosts || s.hiddenPosts || 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] text-[#94A3B8] block">Hidden Comments</span>
                <span className="text-lg font-bold text-amber-400">
                  {modStats.hiddenComments || s.hiddenComments || 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D]">
                <span className="text-[11px] text-[#94A3B8] block">Suspended Users</span>
                <span className="text-lg font-bold text-rose-300">
                  {uStats.inactive || modStats.suspendedUsers || 0}
                </span>
              </div>
            </div>

            {/* Security Audit Trail summary */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                Recent Security Audit Logs
              </p>
              {recentLogs.length === 0 ? (
                <p className="text-xs text-[#94A3B8] p-3 text-center bg-[#202B40] rounded-xl border border-[#26334D]">
                  No audit logs recorded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentLogs.slice(0, 3).map((log) => (
                    <div
                      key={log._id}
                      className="p-2.5 rounded-xl bg-[#202B40] border border-[#26334D] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F8FAFC] uppercase text-[10px] tracking-wider bg-[#151E32] px-2 py-0.5 rounded border border-[#334155]">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[#CBD5E1] text-[11px] line-clamp-1">{log.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#26334D] flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Audit status: Logged with IP tracing</span>
            <Link to={ROUTES.ADMIN_AUDIT_LOGS} className="text-[#818CF8] hover:underline font-medium">
              View Full Audit Log &rarr;
            </Link>
          </div>
        </div>

        {/* E. Platform Analytics Distribution */}
        <div className="bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#334155] shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#26334D] mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                  <HiOutlineChartBar className="w-5 h-5 text-indigo-400" />
                  E. Platform Analytics & Ratios
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Student vs Alumni proportion & engagement statistics
                </p>
              </div>
              <Link
                to={ROUTES.ADMIN_REPORTS}
                className="text-xs font-semibold text-[#818CF8] hover:text-white flex items-center gap-1"
              >
                Full Analytics <HiOutlineArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Student vs Alumni Distribution Bar */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[#F8FAFC] font-semibold text-[11px]">
                  <span className="text-indigo-400">
                    Students: {uStats.students || 0} ({Math.round(((uStats.students || 0) / Math.max(1, (uStats.total || 1))) * 100)}%)
                  </span>
                  <span className="text-emerald-400">
                    Alumni: {uStats.alumni || 0} ({Math.round(((uStats.alumni || 0) / Math.max(1, (uStats.total || 1))) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-[#202B40] rounded-full h-3 overflow-hidden flex border border-[#334155]">
                  <div
                    className="bg-[#6366F1] h-full transition-all duration-500"
                    style={{
                      width: `${Math.round(((uStats.students || 0) / Math.max(1, (uStats.total || 1))) * 100)}%`,
                    }}
                    title="Students"
                  />
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{
                      width: `${Math.round(((uStats.alumni || 0) / Math.max(1, (uStats.total || 1))) * 100)}%`,
                    }}
                    title="Alumni"
                  />
                </div>
              </div>

              {/* Module Activity Breakdown Cards */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D] space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                    <span>Jobs Fill Ratio</span>
                    <span className="font-bold text-[#F8FAFC]">{jStats.open || 0}/{jStats.total || 0} Open</span>
                  </div>
                  <div className="w-full bg-[#151E32] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{
                        width: `${Math.round(((jStats.open || 0) / Math.max(1, jStats.total || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D] space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                    <span>Mentorship Rate</span>
                    <span className="font-bold text-emerald-400">{mStats.completed || 0} Done</span>
                  </div>
                  <div className="w-full bg-[#151E32] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full"
                      style={{
                        width: `${Math.round(((mStats.completed || 0) / Math.max(1, mStats.total || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D] space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                    <span>Project Teams</span>
                    <span className="font-bold text-cyan-400">{pStats.recruiting || 0} Recruiting</span>
                  </div>
                  <div className="w-full bg-[#151E32] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full"
                      style={{
                        width: `${Math.round(((pStats.recruiting || 0) / Math.max(1, pStats.total || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D] space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                    <span>Community Ratio</span>
                    <span className="font-bold text-teal-400">{cStats.comments || 0} Comments</span>
                  </div>
                  <div className="w-full bg-[#151E32] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-500 h-full"
                      style={{
                        width: `${Math.min(100, (cStats.comments || 0) * 10)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#26334D] flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Platform metrics live sync</span>
            <Link to={ROUTES.ADMIN_REPORTS} className="text-[#818CF8] hover:underline font-semibold">
              Generate Detailed Report &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
