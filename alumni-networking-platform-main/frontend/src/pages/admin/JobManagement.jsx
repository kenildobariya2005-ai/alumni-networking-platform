import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineBriefcase,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineX,
} from 'react-icons/hi';
import { adminService } from '../../services/adminService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export const JobManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
  });

  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);
        const params = {
          page,
          limit: pagination.limit,
          status: statusFilter || undefined,
          jobType: jobTypeFilter || undefined,
          search: search.trim() || undefined,
        };

        const data = await adminService.getAllJobs(params);
        if (data?.data) {
          setJobs(data.data.jobs || []);
          setPagination((prev) => ({
            ...prev,
            page: data.data.pagination?.page || page,
            pages: data.data.pagination?.totalPages || 1,
            total: data.data.pagination?.totalJobs || 0,
          }));
        }
      } catch (err) {
        setError(err?.message || 'Failed to fetch platform jobs');
        toast.error(err?.message || 'Failed to fetch platform jobs');
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, jobTypeFilter, search, pagination.limit]
  );

  useEffect(() => {
    fetchJobs(1);
  }, [statusFilter, jobTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const handleToggleStatus = async (job) => {
    try {
      if (job.status === 'Open') {
        await adminService.closeJob(job._id);
        toast.success(`Job "${job.title}" closed`);
      } else {
        await adminService.reopenJob(job._id);
        toast.success(`Job "${job.title}" reopened`);
      }
      fetchJobs(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to update job status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      setDeleting(true);
      await adminService.deleteJob(jobToDelete._id);
      toast.success('Job posting deleted');
      setJobToDelete(null);
      fetchJobs(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Platform Job Governance
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Job & Internship Moderation
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Monitor all student job listings, verify recruitment compliance, and manage active vacancies.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#151E32] rounded-2xl p-4 sm:p-5 border border-[#26334D] shadow-soft-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title or hiring company..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#334155] bg-[#202B40] text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] placeholder-[#64748B]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
            </select>

            <Button type="submit" variant="primary" size="sm" icon={HiOutlineFilter} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white">
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Jobs Table */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading platform jobs..." />
        </div>
      ) : error ? (
        <EmptyState
          icon={HiOutlineExclamationCircle}
          title="Failed to load jobs"
          description={error}
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => fetchJobs(pagination.page)}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
            >
              Retry
            </Button>
          }
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={HiOutlineBriefcase}
          title="No jobs found"
          description="No platform jobs matched your search criteria."
        />
      ) : (
        <div className="bg-[#151E32] rounded-3xl border border-[#26334D] shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0B1120]/80 border-b border-[#26334D] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Job Title & Company</th>
                  <th className="px-6 py-4">Posted By</th>
                  <th className="px-6 py-4">Type & Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Applicants</th>
                  <th className="px-6 py-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26334D]">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-[#202B40]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          to={`/jobs/${job._id}`}
                          className="font-bold text-[#F8FAFC] hover:text-[#818CF8] transition-colors"
                        >
                          {job.title}
                        </Link>
                        <p className="text-xs text-[#94A3B8]">{job.company}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <p className="font-semibold text-[#F8FAFC]">
                        {job.postedBy?.fullName || 'Alumni'}
                      </p>
                      <p className="text-[#94A3B8]">{job.postedBy?.email}</p>
                    </td>

                    <td className="px-6 py-4 text-xs text-[#CBD5E1]">
                      <span className="font-semibold text-[#818CF8] bg-[#6366F1]/15 px-2 py-0.5 rounded-full border border-[#6366F1]/30">
                        {job.jobType}
                      </span>
                      <p className="text-[#94A3B8] pt-0.5">{job.location || 'Remote'}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          job.status === 'Open'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs font-bold text-[#CBD5E1]">
                      {job.applicationsCount || 0}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(job)}
                          className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
                        >
                          {job.status === 'Open' ? 'Close' : 'Reopen'}
                        </Button>

                        <button
                          type="button"
                          onClick={() => setJobToDelete(job)}
                          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete Job"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
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
              onPageChange={(p) => fetchJobs(p)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        title="Admin Delete Job Posting"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Are you sure you want to permanently remove <span className="font-bold text-[#F8FAFC]">{jobToDelete?.title}</span> from the platform?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setJobToDelete(null)}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleting}
              onClick={handleConfirmDelete}
            >
              Delete Job
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobManagement;
