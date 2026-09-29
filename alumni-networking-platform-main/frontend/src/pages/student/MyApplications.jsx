import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineBriefcase,
  HiOutlineSearch,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye,
} from 'react-icons/hi';
import { applicationService } from '../../services/applicationService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ROUTES from '../../constants/routes.js';

export const MyApplications = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  const fetchApplications = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          status: statusFilter || undefined,
        };
        const data = await applicationService.getMyApplications(params);
        if (data) {
          setApplications(data.applications || []);
          setPagination((prev) => ({
            ...prev,
            page: data.page || page,
            pages: data.pages || 1,
            total: data.total || 0,
          }));
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, pagination.limit]
  );

  useEffect(() => {
    fetchApplications(1);
  }, [statusFilter]);

  const filteredApplications = applications.filter((app) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      app.job?.title?.toLowerCase().includes(query) ||
      app.job?.company?.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case 'Shortlisted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60">
            Shortlisted
          </span>
        );
      case 'Reviewing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
            <HiOutlineClock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/60">
            <HiOutlineXCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#202B40] text-[#CBD5E1] border border-[#334155]">
            Applied
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Job Tracker
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            My Job Applications
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Track real-time recruitment updates from alumni for all your submitted job applications.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(ROUTES.JOBS)}
          className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
        >
          Explore More Jobs
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#151E32] rounded-2xl p-4 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or company..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#334155] bg-[#202B40] text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] placeholder-[#64748B]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
        >
          <option value="">All Statuses</option>
          <option value="Applied">Applied</option>
          <option value="Reviewing">Reviewing</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading your applications..." />
        </div>
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          icon={HiOutlineBriefcase}
          title="No applications found"
          description="You haven't applied to any job postings matching your current criteria."
          action={
            <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.JOBS)} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white">
              Browse Available Jobs
            </Button>
          }
        />
      ) : (
        <div className="bg-[#151E32] rounded-3xl border border-[#26334D] shadow-soft-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0B1120]/80 border-b border-[#26334D] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Job Title & Company</th>
                  <th className="px-6 py-4">Job Type</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Application Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26334D]">
                {filteredApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-[#202B40]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-[#F8FAFC]">{app.job?.title || 'Job Posting'}</p>
                        <p className="text-xs text-[#94A3B8] font-medium">{app.job?.company || 'Company'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30">
                        {app.job?.jobType || 'Full-time'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#94A3B8] font-medium">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {app.job?._id && (
                        <Link
                          to={`/jobs/${app.job._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#334155] text-xs font-semibold text-[#CBD5E1] hover:bg-[#202B40] hover:text-[#818CF8] hover:border-[#6366F1] transition-colors"
                        >
                          <HiOutlineEye className="w-4 h-4" /> View Job
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-[#26334D]">
            {filteredApplications.map((app) => (
              <div key={app._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#F8FAFC]">
                      {app.job?.title || 'Job Posting'}
                    </h3>
                    <p className="text-xs text-[#94A3B8] font-medium">
                      {app.job?.company || 'Company'}
                    </p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-1">
                  <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                  {app.job?._id && (
                    <Link
                      to={`/jobs/${app.job._id}`}
                      className="text-[#818CF8] font-semibold hover:underline"
                    >
                      View Details &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-4 border-t border-[#26334D]">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              limit={pagination.limit}
              onPageChange={(p) => fetchApplications(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;

