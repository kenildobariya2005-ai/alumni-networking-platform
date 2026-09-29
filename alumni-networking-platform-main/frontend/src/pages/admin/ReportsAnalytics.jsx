import React, { useState, useEffect } from 'react';
import {
  HiOutlineChartBar,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineSparkles,
  HiOutlineDocumentReport,
  HiOutlineDownload,
  HiOutlineRefresh,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService.js';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';

export const ReportsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, statsRes] = await Promise.allSettled([
        adminService.getDashboardAnalytics(),
        adminService.getDashboardStats(),
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data) {
        setAnalytics(analyticsRes.value.data);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      toast.error('Failed to load platform analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" message="Compiling platform analytics report..." />
      </div>
    );
  }

  const u = analytics?.users || {};
  const j = analytics?.jobs || {};
  const m = analytics?.mentorship || {};
  const p = analytics?.projects || {};
  const c = analytics?.community || {};

  const totalUsers = u.total || 1;
  const studentPct = Math.round(((u.students || 0) / totalUsers) * 100);
  const alumniPct = Math.round(((u.alumni || 0) / totalUsers) * 100);
  const adminPct = Math.round(((u.admins || 0) / totalUsers) * 100);

  return (
    <div className="space-y-8 animate-fade-in text-[#CBD5E1]">
      {/* Header */}
      <div className="bg-[#151E32] rounded-2xl p-6 sm:p-8 border border-[#334155] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#6366F1]/20 text-[#818CF8] border border-[#6366F1]/40 uppercase tracking-wider mb-2">
            <HiOutlineChartBar className="w-4 h-4 text-emerald-400" /> Platform Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">
            Reports & Analytics
          </h1>
          <p className="text-[#94A3B8] text-xs sm:text-sm mt-1">
            Aggregate university network metrics, conversion ratios, and engagement breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={HiOutlineRefresh}
            onClick={fetchAnalytics}
            className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:text-[#F8FAFC] text-xs font-semibold"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={HiOutlineDownload}
            onClick={handleExportReport}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-soft-sm"
          >
            Print / Export Report
          </Button>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#151E32] border border-[#334155]">
          <span className="text-xs text-[#94A3B8] font-medium block">Total Platform Users</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] block mt-1">
            {u.total || 0}
          </span>
          <span className="text-[11px] text-indigo-400 mt-1 block">
            {u.students || 0} students &bull; {u.alumni || 0} alumni
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#151E32] border border-[#334155]">
          <span className="text-xs text-[#94A3B8] font-medium block">Total Job Postings</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 block mt-1">
            {j.total || 0}
          </span>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">
            {j.applications || 0} student applications
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#151E32] border border-[#334155]">
          <span className="text-xs text-[#94A3B8] font-medium block">Mentorship Sessions</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 block mt-1">
            {m.total || 0}
          </span>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            {m.completed || 0} sessions completed
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#151E32] border border-[#334155]">
          <span className="text-xs text-[#94A3B8] font-medium block">Active Projects</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 block mt-1">
            {p.total || 0}
          </span>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">
            {p.recruiting || 0} currently recruiting
          </span>
        </div>
      </div>

      {/* Module Analytics Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Analysis */}
        <div className="bg-[#151E32] rounded-2xl p-6 border border-[#334155] shadow-soft-sm space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <HiOutlineUserGroup className="w-5 h-5 text-indigo-400" />
            User Demographics & Role Distribution
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-indigo-400">Students</span>
                <span className="text-[#F8FAFC]">{u.students || 0} ({studentPct}%)</span>
              </div>
              <div className="w-full bg-[#202B40] rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#6366F1] h-full" style={{ width: `${studentPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-emerald-400">Alumni</span>
                <span className="text-[#F8FAFC]">{u.alumni || 0} ({alumniPct}%)</span>
              </div>
              <div className="w-full bg-[#202B40] rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${alumniPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-amber-400">Administrators</span>
                <span className="text-[#F8FAFC]">{u.admins || 0} ({adminPct}%)</span>
              </div>
              <div className="w-full bg-[#202B40] rounded-full h-2.5 overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${adminPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Mentorship Program Health */}
        <div className="bg-[#151E32] rounded-2xl p-6 border border-[#334155] shadow-soft-sm space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <HiOutlineAcademicCap className="w-5 h-5 text-purple-400" />
            Mentorship Pipeline Breakdown
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D]">
              <span className="text-[#94A3B8] block text-[11px]">Pending</span>
              <span className="text-lg font-bold text-amber-400">{m.pending || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D]">
              <span className="text-[#94A3B8] block text-[11px]">Accepted</span>
              <span className="text-lg font-bold text-blue-400">{m.accepted || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D]">
              <span className="text-[#94A3B8] block text-[11px]">Completed</span>
              <span className="text-lg font-bold text-emerald-400">{m.completed || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D]">
              <span className="text-[#94A3B8] block text-[11px]">Declined</span>
              <span className="text-lg font-bold text-slate-400">{m.rejected || 0}</span>
            </div>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Completion Rate:{' '}
            <strong className="text-emerald-400">
              {Math.round(((m.completed || 0) / Math.max(1, m.total || 1)) * 100)}%
            </strong>
          </p>
        </div>

        {/* Jobs & Internship Opportunities */}
        <div className="bg-[#151E32] rounded-2xl p-6 border border-[#334155] shadow-soft-sm space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <HiOutlineBriefcase className="w-5 h-5 text-blue-400" />
            Jobs & Placement Pipeline
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D]">
              <span className="text-[#94A3B8] block text-[11px]">Open Listings</span>
              <span className="text-lg font-bold text-emerald-400">{j.open || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D]">
              <span className="text-[#94A3B8] block text-[11px]">Closed Listings</span>
              <span className="text-lg font-bold text-slate-400">{j.closed || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D]">
              <span className="text-[#94A3B8] block text-[11px]">Applications</span>
              <span className="text-lg font-bold text-indigo-400">{j.applications || 0}</span>
            </div>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Average Applications per Job:{' '}
            <strong className="text-[#F8FAFC]">
              {((j.applications || 0) / Math.max(1, j.total || 1)).toFixed(1)}
            </strong>
          </p>
        </div>

        {/* Community & Safety Metrics */}
        <div className="bg-[#151E32] rounded-2xl p-6 border border-[#334155] shadow-soft-sm space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <HiOutlineDocumentReport className="w-5 h-5 text-teal-400" />
            Community Moderation & Engagement
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D]">
              <span className="text-[#94A3B8] block text-[11px]">Published Posts</span>
              <span className="text-lg font-bold text-teal-400">{c.posts || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D]">
              <span className="text-[#94A3B8] block text-[11px]">User Comments</span>
              <span className="text-lg font-bold text-blue-400">{c.comments || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#202B40] border border-[#26334D]">
              <span className="text-[#94A3B8] block text-[11px]">Flagged/Hidden</span>
              <span className="text-lg font-bold text-rose-400">{c.hiddenPosts || 0}</span>
            </div>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Safety ratio:{' '}
            <strong className="text-emerald-400">
              {Math.max(0, 100 - Math.round(((c.hiddenPosts || 0) / Math.max(1, c.posts || 1)) * 100))}% compliant
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
