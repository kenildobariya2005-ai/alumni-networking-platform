import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineBriefcase,
  HiOutlinePlus,
  HiOutlineUserGroup,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import { jobService } from '../../services/jobService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ROUTES from '../../constants/routes.js';

export const MyJobs = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  // Edit Job Modal
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'Full-time',
    salaryRange: '',
    requiredSkills: '',
    deadline: '',
    description: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Job Modal
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyJobs = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const data = await jobService.getMyPostedJobs({
          page,
          limit: pagination.limit,
        });
        if (data) {
          setJobs(data.jobs || []);
          setPagination((prev) => ({
            ...prev,
            page: data.page || page,
            pages: data.pages || 1,
            total: data.total || 0,
          }));
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to fetch your posted jobs');
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  );

  useEffect(() => {
    fetchMyJobs(1);
  }, []);

  const handleToggleStatus = async (job) => {
    try {
      const newStatus = job.status === 'Open' ? 'Closed' : 'Open';
      await jobService.updateJobStatus(job._id, newStatus);
      toast.success(`Job status changed to ${newStatus}`);
      fetchMyJobs(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to update job status');
    }
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setEditFormData({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      jobType: job.jobType || 'Full-time',
      salaryRange: job.salaryRange || '',
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '',
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
      description: job.description || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingJob) return;

    try {
      setSavingEdit(true);
      const skillsArray = editFormData.requiredSkills
        ? editFormData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await jobService.updateJob(editingJob._id, {
        ...editFormData,
        requiredSkills: skillsArray,
        deadline: editFormData.deadline || undefined,
      });

      toast.success('Job details updated successfully!');
      setEditingJob(null);
      fetchMyJobs(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to update job');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      setDeleting(true);
      await jobService.deleteJob(jobToDelete._id);
      toast.success('Job posting deleted successfully');
      setJobToDelete(null);
      fetchMyJobs(pagination.page);
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
            Job Management
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            My Posted Jobs
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Manage your open positions, monitor candidate applications, and edit job specifications.
          </p>
        </div>

        <Button
          variant="primary"
          icon={HiOutlinePlus}
          onClick={() => navigate(ROUTES.CREATE_JOB)}
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
        >
          Post New Job
        </Button>
      </div>

      {/* Jobs Table & Cards */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading your jobs..." />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={HiOutlineBriefcase}
          title="No jobs posted yet"
          description="You haven't published any job or internship openings yet."
          action={
            <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.CREATE_JOB)} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white">
              Post First Job
            </Button>
          }
        />
      ) : (
        <div className="bg-[#151E32] rounded-3xl border border-[#26334D] shadow-soft-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0B1120]/80 border-b border-[#26334D] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Job Title & Company</th>
                  <th className="px-6 py-4">Type & Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Applicants</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4 text-right">Actions</th>
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
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 text-xs text-[#CBD5E1]">
                        <span className="font-semibold text-[#818CF8] bg-[#6366F1]/15 px-2 py-0.5 rounded-full border border-[#6366F1]/30">
                          {job.jobType}
                        </span>
                        <p className="text-[#94A3B8] pt-0.5">{job.location || 'Remote'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(job)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          job.status === 'Open'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60'
                            : 'bg-[#202B40] text-[#94A3B8] border border-[#334155] hover:bg-[#1E293B]'
                        }`}
                        title="Click to toggle status"
                      >
                        {job.status || 'Open'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/alumni/jobs/${job._id}/applications`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#202B40] hover:bg-[#6366F1]/20 hover:text-[#818CF8] text-[#CBD5E1] text-xs font-bold transition-colors border border-[#334155]"
                      >
                        <HiOutlineUserGroup className="w-4 h-4 text-[#818CF8]" />
                        {job.applicationsCount || 0} Candidates
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#94A3B8]">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'None'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(job)}
                          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#818CF8] hover:bg-[#202B40] transition-colors"
                          title="Edit Job"
                        >
                          <HiOutlinePencilAlt className="w-4 h-4" />
                        </button>
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

          {/* Mobile Cards View */}
          <div className="lg:hidden divide-y divide-[#26334D]">
            {jobs.map((job) => (
              <div key={job._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#F8FAFC]">{job.title}</h3>
                    <p className="text-xs text-[#94A3B8]">{job.company}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      job.status === 'Open'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : 'bg-[#202B40] text-[#94A3B8] border border-[#334155]'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>{job.jobType} &bull; {job.location}</span>
                  <Link
                    to={`/alumni/jobs/${job._id}/applications`}
                    className="font-bold text-[#818CF8]"
                  >
                    {job.applicationsCount || 0} applicants &rarr;
                  </Link>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#26334D]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(job)}
                    className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
                  >
                    {job.status === 'Open' ? 'Close' : 'Reopen'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(job)}
                    className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setJobToDelete(job)}
                  >
                    Delete
                  </Button>
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
              onPageChange={(p) => fetchMyJobs(p)}
            />
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      <Modal
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        title="Edit Job Posting"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Job Title"
            value={editFormData.title}
            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            required
          />
          <Input
            label="Company"
            value={editFormData.company}
            onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
            required
          />
          <Input
            label="Location"
            value={editFormData.location}
            onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
          />
          <Input
            label="Compensation"
            value={editFormData.salaryRange}
            onChange={(e) => setEditFormData({ ...editFormData, salaryRange: e.target.value })}
          />
          <Input
            label="Required Skills (comma-separated)"
            value={editFormData.requiredSkills}
            onChange={(e) => setEditFormData({ ...editFormData, requiredSkills: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              required
              className="w-full rounded-xl border border-[#334155] bg-[#202B40] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:outline-none transition-all"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingJob(null)}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={savingEdit}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        title="Delete Job Posting"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Are you sure you want to delete the job posting for{' '}
            <span className="font-bold text-[#F8FAFC]">{jobToDelete?.title}</span>? All related student applications will be removed.
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

export default MyJobs;

