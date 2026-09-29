import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineVideoCamera,
  HiOutlineStar,
  HiOutlineSearch,
} from 'react-icons/hi';
import { adminService } from '../../services/adminService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export const MentorshipManagement = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  const fetchMentorshipData = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const [mentorshipRes, statsRes] = await Promise.allSettled([
          adminService.getAllMentorships({
            page,
            limit: pagination.limit,
            status: statusFilter || undefined,
          }),
          adminService.getMentorshipStatistics(),
        ]);

        if (mentorshipRes.status === 'fulfilled' && mentorshipRes.value?.data) {
          setRequests(mentorshipRes.value.data.requests || []);
          setPagination((prev) => ({
            ...prev,
            page: mentorshipRes.value.data.pagination?.page || page,
            pages: mentorshipRes.value.data.pagination?.totalPages || 1,
            total: mentorshipRes.value.data.pagination?.totalRequests || 0,
          }));
        }

        if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
          setStats(statsRes.value.data);
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to fetch mentorship records');
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, pagination.limit]
  );

  useEffect(() => {
    fetchMentorshipData(1);
  }, [statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Mentorship Intelligence
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Mentorship Oversight & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Track student-alumni guidance interactions, session completion rates, and feedback quality.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40] capitalize"
        >
          <option value="">All Session Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted / Scheduled</option>
          <option value="completed">Completed</option>
          <option value="rejected">Declined</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Summary Metrics */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#151E32] p-4 rounded-2xl border border-[#26334D] shadow-soft-sm">
            <span className="text-xs font-semibold text-[#94A3B8] block">Total Requests</span>
            <span className="text-xl font-extrabold text-[#F8FAFC]">{stats.totalRequests || pagination.total}</span>
          </div>
          <div className="bg-[#151E32] p-4 rounded-2xl border border-[#26334D] shadow-soft-sm">
            <span className="text-xs font-semibold text-[#94A3B8] block">Completed Sessions</span>
            <span className="text-xl font-extrabold text-emerald-400">{stats.statusBreakdown?.completed || 0}</span>
          </div>
          <div className="bg-[#151E32] p-4 rounded-2xl border border-[#26334D] shadow-soft-sm">
            <span className="text-xs font-semibold text-[#94A3B8] block">Active / Scheduled</span>
            <span className="text-xl font-extrabold text-[#818CF8]">{stats.statusBreakdown?.accepted || 0}</span>
          </div>
          <div className="bg-[#151E32] p-4 rounded-2xl border border-[#26334D] shadow-soft-sm">
            <span className="text-xs font-semibold text-[#94A3B8] block">Pending Review</span>
            <span className="text-xl font-extrabold text-amber-400">{stats.statusBreakdown?.pending || 0}</span>
          </div>
        </div>
      )}

      {/* Sessions Table */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading mentorship sessions..." />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={HiOutlineAcademicCap}
          title="No mentorship sessions found"
          description="No sessions match the selected filter."
        />
      ) : (
        <div className="bg-[#151E32] rounded-3xl border border-[#26334D] shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0B1120]/80 border-b border-[#26334D] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Alumni Mentor</th>
                  <th className="px-6 py-4">Topic & Note</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date Scheduled</th>
                  <th className="px-6 py-4 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26334D]">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-[#202B40]/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#F8FAFC]">{req.student?.fullName || 'Student'}</p>
                      <p className="text-xs text-[#94A3B8]">{req.student?.email}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-[#F8FAFC]">{req.mentor?.fullName || 'Mentor'}</p>
                      <p className="text-xs text-[#94A3B8]">{req.mentor?.email}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#F8FAFC]">{req.topic}</p>
                      <p className="text-xs text-[#CBD5E1] line-clamp-1">{req.message}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          req.status === 'completed'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                            : req.status === 'accepted'
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                            : req.status === 'rejected' || req.status === 'cancelled'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-[#94A3B8]">
                      {req.scheduledAt ? (
                        <span>{new Date(req.scheduledAt).toLocaleString()}</span>
                      ) : (
                        <span className="text-[#64748B] italic">Unscheduled</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {req.rating ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400 text-xs">
                          ★ {req.rating}/5
                        </span>
                      ) : (
                        <span className="text-xs text-[#64748B]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 border-t border-[#26334D]">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              limit={pagination.limit}
              onPageChange={(p) => fetchMentorshipData(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipManagement;
