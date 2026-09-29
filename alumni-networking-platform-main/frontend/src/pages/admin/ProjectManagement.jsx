import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineSparkles,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineTrash,
  HiOutlineTag,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { adminService } from '../../services/adminService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export const ProjectManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
  });

  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);
        const params = {
          page,
          limit: pagination.limit,
          category: categoryFilter || undefined,
          status: statusFilter || undefined,
          search: search.trim() || undefined,
        };

        const data = await adminService.getAllProjects(params);
        if (data?.data) {
          setProjects(data.data.projects || []);
          setPagination((prev) => ({
            ...prev,
            page: data.data.pagination?.page || page,
            pages: data.data.pagination?.totalPages || 1,
            total: data.data.pagination?.totalProjects || 0,
          }));
        }
      } catch (err) {
        setError(err?.message || 'Failed to load projects');
        toast.error(err?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    },
    [categoryFilter, statusFilter, search, pagination.limit]
  );

  useEffect(() => {
    fetchProjects(1);
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects(1);
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await adminService.updateProjectStatus(projectId, newStatus);
      toast.success(`Project status updated to ${newStatus}`);
      fetchProjects(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to update project status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      setDeleting(true);
      await adminService.deleteProject(projectToDelete._id);
      toast.success('Project removed by administrator');
      setProjectToDelete(null);
      fetchProjects(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete project');
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
            Initiative Moderation
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Collaborative Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Audit student-alumni collaborative projects, monitor team sizes, and supervise status transitions.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#151E32] rounded-2xl p-4 sm:p-5 border border-[#26334D] shadow-soft-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by title or category..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#334155] bg-[#202B40] text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] placeholder-[#64748B]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
            >
              <option value="">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="AI/ML">AI / Machine Learning</option>
              <option value="Data Science">Data Science</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Cloud">Cloud</option>
              <option value="IoT">IoT</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40] capitalize"
            >
              <option value="">All Statuses</option>
              <option value="recruiting">Recruiting</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <Button type="submit" variant="primary" size="sm" icon={HiOutlineFilter} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white">
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Projects Table */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading platform projects..." />
        </div>
      ) : error ? (
        <EmptyState
          icon={HiOutlineExclamationCircle}
          title="Failed to load projects"
          description={error}
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => fetchProjects(pagination.page)}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
            >
              Retry
            </Button>
          }
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={HiOutlineSparkles}
          title="No projects found"
          description="No collaborative projects matched the search parameters."
        />
      ) : (
        <div className="bg-[#151E32] rounded-3xl border border-[#26334D] shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#0B1120]/80 border-b border-[#26334D] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Project Title & Category</th>
                  <th className="px-6 py-4">Created By</th>
                  <th className="px-6 py-4">Team Composition</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26334D]">
                {projects.map((project) => (
                  <tr key={project._id} className="hover:bg-[#202B40]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          to={`/projects/${project._id}`}
                          className="font-bold text-[#F8FAFC] hover:text-[#818CF8] transition-colors"
                        >
                          {project.title}
                        </Link>
                        <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-0.5">
                          <HiOutlineTag className="w-3.5 h-3.5 text-[#64748B]" />
                          {project.category}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <p className="font-semibold text-[#F8FAFC]">
                        {project.createdBy?.fullName || 'Alumni'}
                      </p>
                      <p className="text-[#94A3B8]">{project.createdBy?.email}</p>
                    </td>

                    <td className="px-6 py-4 text-xs font-semibold text-[#CBD5E1]">
                      {project.teamMembers?.length || 0} / {project.maxTeamSize || 5} members
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={project.status}
                        onChange={(e) => handleStatusChange(project._id, e.target.value)}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold border border-[#334155] text-[#F8FAFC] bg-[#202B40] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] capitalize"
                      >
                        <option value="recruiting">Recruiting</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setProjectToDelete(project)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete Project"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
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
              onPageChange={(p) => fetchProjects(p)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        title="Admin Delete Project"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-[#F8FAFC]">{projectToDelete?.title}</span>? This action will archive all associated collaborative resources.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProjectToDelete(null)}
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
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectManagement;
