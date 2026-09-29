import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineClipboardList,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import { adminService } from '../../services/adminService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export const AuditLogs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 15,
  });

  const fetchAuditLogs = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          action: actionFilter || undefined,
          targetType: targetTypeFilter || undefined,
          sort: '-createdAt',
        };

        const data = await adminService.getAuditLogs(params);
        if (data?.data) {
          setLogs(data.data.logs || []);
          setPagination((prev) => ({
            ...prev,
            page: data.data.pagination?.page || page,
            pages: data.data.pagination?.totalPages || 1,
            total: data.data.pagination?.totalLogs || 0,
          }));
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to fetch audit logs');
      } finally {
        setLoading(false);
      }
    },
    [actionFilter, targetTypeFilter, pagination.limit]
  );

  useEffect(() => {
    fetchAuditLogs(1);
  }, [actionFilter, targetTypeFilter]);

  const filteredLogs = logs.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.description?.toLowerCase().includes(q) ||
      l.admin?.fullName?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Security & Compliance
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            System Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Immutable administrative logs capturing user status modifications, verification events, and content moderation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#334155] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
          >
            <option value="">All Actions</option>
            <option value="USER_STATUS_UPDATED">User Status Updates</option>
            <option value="ALUMNI_VERIFIED">Alumni Verified</option>
            <option value="ALUMNI_UNVERIFIED">Alumni Unverified</option>
            <option value="JOB_CLOSED">Job Closed</option>
            <option value="JOB_REOPENED">Job Reopened</option>
            <option value="PROJECT_STATUS_UPDATED">Project Status</option>
            <option value="POST_HIDDEN">Post Hidden</option>
            <option value="COMMENT_HIDDEN">Comment Hidden</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#151E32] rounded-2xl p-4 border border-[#26334D] shadow-soft-sm flex items-center gap-3">
        <HiOutlineSearch className="w-5 h-5 text-[#64748B] ml-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit logs by description or administrator..."
          className="w-full text-xs sm:text-sm border-0 focus:ring-0 focus:outline-none bg-transparent text-[#F8FAFC] placeholder-[#64748B]"
        />
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading security audit records..." />
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={HiOutlineClipboardList}
          title="No audit logs recorded"
          description="No administrative actions match your current filter parameters."
        />
      ) : (
        <div className="bg-[#151E32] rounded-3xl border border-[#26334D] shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0B1120]/80 border-b border-[#26334D] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Action Event</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Administrator</th>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26334D] font-mono text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#202B40]/50 transition-colors font-sans">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#202B40] text-[#818CF8] border border-[#6366F1]/30 text-[11px] font-mono font-bold">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[#CBD5E1] font-medium max-w-sm">
                      {log.description}
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <p className="font-bold text-[#F8FAFC]">{log.admin?.fullName || 'Admin'}</p>
                      <p className="text-[11px] text-[#94A3B8]">{log.admin?.email}</p>
                    </td>

                    <td className="px-6 py-4 text-xs font-mono text-[#94A3B8]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="px-6 py-4 text-right text-xs text-[#94A3B8] font-mono">
                      {new Date(log.createdAt).toLocaleString()}
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
              onPageChange={(p) => fetchAuditLogs(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
