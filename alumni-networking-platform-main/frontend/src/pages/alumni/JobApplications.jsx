import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlineDocumentText,
  HiOutlineExternalLink,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineArrowLeft,
  HiOutlineChatAlt2,
} from 'react-icons/hi';
import { applicationService } from '../../services/applicationService.js';
import { jobService } from '../../services/jobService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ROUTES from '../../constants/routes.js';

export const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [jobInfo, setJobInfo] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  // Selected Cover Letter Preview Modal
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const fetchApplications = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          status: statusFilter || undefined,
        };

        if (jobId) {
          const data = await applicationService.getJobApplications(jobId, params);
          if (data) {
            setApplications(data.applications || []);
            setJobInfo({ title: data.jobTitle, company: data.company });
            setPagination((prev) => ({
              ...prev,
              page: data.page || page,
              pages: data.pages || 1,
              total: data.total || 0,
            }));
          }
        } else {
          // If no specific jobId in route, fetch alumni posted jobs then applications
          const postedJobsRes = await jobService.getMyPostedJobs({ limit: 100 });
          const myJobIds = (postedJobsRes.jobs || []).map((j) => j._id);

          if (myJobIds.length > 0) {
            // Fetch first job's applications or all
            const data = await applicationService.getJobApplications(myJobIds[0], params);
            if (data) {
              setApplications(data.applications || []);
              setJobInfo({ title: data.jobTitle, company: data.company });
              setPagination((prev) => ({
                ...prev,
                page: data.page || page,
                pages: data.pages || 1,
                total: data.total || 0,
              }));
            }
          } else {
            setApplications([]);
          }
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to fetch applicants');
      } finally {
        setLoading(false);
      }
    },
    [jobId, statusFilter, pagination.limit]
  );

  useEffect(() => {
    fetchApplications(1);
  }, [jobId, statusFilter]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      setUpdatingStatusId(applicationId);
      await applicationService.updateApplicationStatus(applicationId, newStatus);
      toast.success(`Application marked as ${newStatus}`);
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      toast.error(err?.message || 'Failed to update application status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      app.student?.fullName?.toLowerCase().includes(query) ||
      app.student?.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in text-[#CBD5E1]">
      {/* Back Button */}
      {jobId && (
        <button
          type="button"
          onClick={() => navigate(ROUTES.ALUMNI_JOBS)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#818CF8] transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to My Jobs
        </button>
      )}

      {/* Header Banner */}
      <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Applicant Tracking System
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            {jobInfo ? `Applicants for ${jobInfo.title}` : 'Job Applicants'}
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Review student candidate resumes, read cover letters, and update candidate stages.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
        >
          <option value="">All Applicant Stages</option>
          <option value="Applied">Applied</option>
          <option value="Reviewing">Reviewing</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Search Bar */}
      <div className="bg-[#151E32] rounded-2xl p-4 border border-[#26334D] shadow-soft-sm flex items-center gap-3">
        <HiOutlineSearch className="w-5 h-5 text-[#64748B] ml-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search candidates by name or email..."
          className="w-full text-xs sm:text-sm border-0 focus:ring-0 focus:outline-none bg-transparent text-[#F8FAFC] placeholder-[#64748B]"
        />
      </div>

      {/* Candidates List */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading candidate profiles..." />
        </div>
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          icon={HiOutlineUserGroup}
          title="No candidates found"
          description="No candidate applications match your current filter settings."
        />
      ) : (
        <div className="bg-[#151E32] rounded-3xl border border-[#26334D] shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0B1120]/80 border-b border-[#26334D] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Candidate</th>
                  <th className="px-6 py-4">Resume & Cover Letter</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Stage Status</th>
                  <th className="px-6 py-4 text-right">Recruitment Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26334D]">
                {filteredApplications.map((app) => {
                  const student = app.student || {};
                  const isUpdating = updatingStatusId === app._id;

                  return (
                    <tr key={app._id} className="hover:bg-[#202B40]/50 transition-colors">
                      {/* Student details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {student.profilePicture ? (
                            <img
                              src={student.profilePicture}
                              alt={student.fullName || 'Student'}
                              className="w-10 h-10 rounded-full object-cover border border-[#26334D]"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#202B40] text-[#818CF8] font-bold flex items-center justify-center text-xs border border-[#6366F1]/30">
                              {student.fullName?.charAt(0) || 'S'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-[#F8FAFC]">
                              {student.fullName || 'Student Applicant'}
                            </p>
                            <p className="text-xs text-[#94A3B8]">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Resume / Cover Letter */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {app.resumeUrl ? (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202B40] hover:bg-[#6366F1]/20 text-[#818CF8] text-xs font-semibold transition-colors border border-[#334155]"
                            >
                              <HiOutlineDocumentText className="w-4 h-4 text-[#818CF8]" />
                              PDF Resume <HiOutlineExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
                            </a>
                          ) : (
                            <span className="text-xs text-[#64748B] italic">No resume URL</span>
                          )}

                          {app.coverLetter && (
                            <button
                              type="button"
                              onClick={() => setSelectedCoverLetter(app.coverLetter)}
                              className="px-2 py-1 rounded-lg border border-[#334155] text-xs font-semibold text-[#CBD5E1] hover:bg-[#202B40] hover:text-[#818CF8]"
                            >
                              Cover Note
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Applied Date */}
                      <td className="px-6 py-4 text-[#94A3B8] text-xs">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            app.status === 'Accepted'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                              : app.status === 'Rejected'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                              : app.status === 'Shortlisted'
                              ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {student._id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={HiOutlineChatAlt2}
                              onClick={() => navigate(`/chat/${student._id}`)}
                              className="text-xs py-1 text-[#818CF8] hover:bg-[#202B40]"
                            >
                              Chat
                            </Button>
                          )}

                          <select
                            value={app.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                            className="px-2 py-1 rounded-lg border border-[#334155] text-xs font-semibold text-[#F8FAFC] bg-[#202B40] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Reviewing">Reviewing</option>
                            <option value="Shortlisted">Shortlist</option>
                            <option value="Accepted">Accept</option>
                            <option value="Rejected">Reject</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              onPageChange={(p) => fetchApplications(p)}
            />
          </div>
        </div>
      )}

      {/* Cover Letter Modal */}
      <Modal
        isOpen={!!selectedCoverLetter}
        onClose={() => setSelectedCoverLetter(null)}
        title="Applicant Cover Letter / Note"
      >
        <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D] text-xs sm:text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-line">
          {selectedCoverLetter}
        </div>
        <div className="flex justify-end pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCoverLetter(null)}
            className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default JobApplications;

