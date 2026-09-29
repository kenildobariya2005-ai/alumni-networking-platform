import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineArrowLeft,
  HiOutlineChatAlt2,
} from 'react-icons/hi';
import { projectService } from '../../services/projectService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ROUTES from '../../constants/routes.js';

export const ProjectApplications = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });

  const [actionInProgressId, setActionInProgressId] = useState(null);

  const fetchApplications = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const [projectRes, appsRes] = await Promise.all([
          projectService.getProjectById(projectId),
          projectService.getProjectApplications(projectId, {
            page,
            limit: pagination.limit,
            status: statusFilter || undefined,
          }),
        ]);

        if (projectRes?.data?.project) {
          setProject(projectRes.data.project);
        }

        if (appsRes?.data) {
          setApplications(appsRes.data.applications || []);
          setPagination((prev) => ({
            ...prev,
            page: appsRes.data.pagination?.page || page,
            pages: appsRes.data.pagination?.totalPages || 1,
            total: appsRes.data.pagination?.totalApplications || 0,
          }));
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to load project applications');
      } finally {
        setLoading(false);
      }
    },
    [projectId, statusFilter, pagination.limit]
  );

  useEffect(() => {
    fetchApplications(1);
  }, [projectId, statusFilter]);

  const handleAccept = async (appId) => {
    try {
      setActionInProgressId(appId);
      await projectService.acceptProjectApplication(appId);
      toast.success('Applicant accepted and added to project team!');
      fetchApplications(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to accept application');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleReject = async (appId) => {
    try {
      setActionInProgressId(appId);
      await projectService.rejectProjectApplication(appId);
      toast.success('Application rejected');
      fetchApplications(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to reject application');
    } finally {
      setActionInProgressId(null);
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
      <button
        type="button"
        onClick={() => navigate(ROUTES.ALUMNI_PROJECTS)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#818CF8] transition-colors"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to My Projects
      </button>

      {/* Header Banner */}
      <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Team Recruitment
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Applicants for "{project?.title || 'Project'}"
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Current Team: {project?.teamMembers?.length || 0} / {project?.maxTeamSize || 5} members
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
        >
          <option value="">All Applications</option>
          <option value="pending">Pending Review</option>
          <option value="accepted">Accepted to Team</option>
          <option value="rejected">Declined</option>
        </select>
      </div>

      {/* Search Bar */}
      <div className="bg-[#151E32] rounded-2xl p-4 border border-[#26334D] shadow-soft-sm flex items-center gap-3">
        <HiOutlineSearch className="w-5 h-5 text-[#64748B] ml-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search applicants by name or email..."
          className="w-full text-xs sm:text-sm border-0 focus:ring-0 focus:outline-none bg-transparent text-[#F8FAFC] placeholder-[#64748B]"
        />
      </div>

      {/* Applicants List */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading applicants..." />
        </div>
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          icon={HiOutlineUserGroup}
          title="No applications found"
          description="No students have applied matching this status filter."
        />
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const student = app.student || {};
            const isActing = actionInProgressId === app._id;

            return (
              <div
                key={app._id}
                className="bg-[#151E32] rounded-3xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
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
                      <h3 className="text-sm font-bold text-[#F8FAFC]">
                        {student.fullName || 'Student Applicant'}
                      </h3>
                      <p className="text-xs text-[#94A3B8]">{student.email}</p>
                    </div>
                  </div>

                  {app.skills && (
                    <p className="text-xs text-[#CBD5E1]">
                      <span className="font-semibold text-[#F8FAFC]">Skills:</span> {app.skills}
                    </p>
                  )}

                  {app.message && (
                    <p className="text-xs text-[#CBD5E1] bg-[#202B40] p-3 rounded-2xl border border-[#26334D] leading-relaxed">
                      "{app.message}"
                    </p>
                  )}

                  <p className="text-[10px] text-[#94A3B8]">
                    Applied on {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col sm:items-center md:items-end gap-2.5 flex-shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      app.status === 'accepted'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                        : app.status === 'rejected'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    }`}
                  >
                    Status: {app.status}
                  </span>

                  <div className="flex items-center gap-2">
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

                    {app.status === 'pending' && (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={isActing}
                          onClick={() => handleReject(app._id)}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isActing}
                          onClick={() => handleAccept(app._id)}
                          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                        >
                          Accept to Team
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => fetchApplications(p)}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectApplications;

