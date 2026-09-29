import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineSparkles,
  HiOutlinePlus,
  HiOutlineUserGroup,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineTag,
} from 'react-icons/hi';
import { projectService } from '../../services/projectService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ROUTES from '../../constants/routes.js';

export const MyProjects = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 8,
  });

  // Edit Project Modal
  const [editingProject, setEditingProject] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: 'Web Development',
    maxTeamSize: 5,
    requiredSkills: '',
    deadline: '',
    repositoryUrl: '',
    demoUrl: '',
    description: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Project Modal
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyProjects = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const data = await projectService.getMyProjects({
          page,
          limit: pagination.limit,
          filter: 'created',
        });

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
        toast.error(err?.message || 'Failed to fetch your projects');
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit]
  );

  useEffect(() => {
    fetchMyProjects(1);
  }, []);

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await projectService.updateProjectStatus(projectId, newStatus);
      toast.success(`Project status updated to ${newStatus}`);
      fetchMyProjects(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to update project status');
    }
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setEditFormData({
      title: project.title || '',
      category: project.category || 'Web Development',
      maxTeamSize: project.maxTeamSize || 5,
      requiredSkills: Array.isArray(project.requiredSkills)
        ? project.requiredSkills.join(', ')
        : '',
      deadline: project.deadline
        ? new Date(project.deadline).toISOString().split('T')[0]
        : '',
      repositoryUrl: project.repositoryUrl || '',
      demoUrl: project.demoUrl || '',
      description: project.description || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      setSavingEdit(true);
      const skillsArray = editFormData.requiredSkills
        ? editFormData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await projectService.updateProject(editingProject._id, {
        ...editFormData,
        requiredSkills: skillsArray,
        deadline: editFormData.deadline || undefined,
        repositoryUrl: editFormData.repositoryUrl.trim() || undefined,
        demoUrl: editFormData.demoUrl.trim() || undefined,
      });

      toast.success('Project details updated successfully!');
      setEditingProject(null);
      fetchMyProjects(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to update project');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      setDeleting(true);
      await projectService.deleteProject(projectToDelete._id);
      toast.success('Project deleted successfully');
      setProjectToDelete(null);
      fetchMyProjects(pagination.page);
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
            Project Collaboration Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            My Created Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Manage your engineering initiatives, evaluate student applications, and steer team progress.
          </p>
        </div>

        <Button
          variant="primary"
          icon={HiOutlinePlus}
          onClick={() => navigate(ROUTES.CREATE_PROJECT)}
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
        >
          Create New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading your projects..." />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={HiOutlineSparkles}
          title="No projects created yet"
          description="Start your first collaborative project and mentor students on real codebases."
          action={
            <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.CREATE_PROJECT)} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white">
              Create Project
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project) => {
              const teamMembers = project.teamMembers || [];
              const maxTeam = project.maxTeamSize || 5;

              return (
                <div
                  key={project._id}
                  className="bg-[#151E32] rounded-3xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/projects/${project._id}`}
                          className="text-base font-bold text-[#F8FAFC] hover:text-[#818CF8] transition-colors"
                        >
                          {project.title}
                        </Link>
                        <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-0.5">
                          <HiOutlineTag className="w-3.5 h-3.5 text-[#64748B]" />
                          {project.category}
                        </p>
                      </div>

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
                    </div>

                    <p className="text-xs text-[#CBD5E1] line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8]">
                      <span className="font-semibold text-[#CBD5E1] bg-[#202B40] border border-[#26334D] px-2.5 py-1 rounded-lg">
                        Team: {teamMembers.length} / {maxTeam} members
                      </span>

                      {project.deadline && (
                        <span>
                          Deadline: {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-[#26334D] flex items-center justify-between gap-2">
                    <Link
                      to={`/alumni/projects/${project._id}/applications`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6366F1]/15 hover:bg-[#6366F1]/25 text-[#818CF8] text-xs font-bold transition-colors border border-[#6366F1]/30"
                    >
                      <HiOutlineUserGroup className="w-4 h-4" />
                      View Applicants
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(project)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#818CF8] hover:bg-[#202B40] transition-colors"
                        title="Edit Project"
                      >
                        <HiOutlinePencilAlt className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setProjectToDelete(project)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete Project"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => fetchMyProjects(p)}
          />
        </div>
      )}

      {/* Edit Project Modal */}
      <Modal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        title="Edit Collaborative Project"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Project Title"
            value={editFormData.title}
            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
                Category
              </label>
              <select
                value={editFormData.category}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                className="w-full rounded-xl border border-[#334155] px-3 py-2 text-xs focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:outline-none bg-[#202B40] text-[#F8FAFC] font-medium"
              >
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="AI/ML">AI / Machine Learning</option>
                <option value="Data Science">Data Science</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Cloud">Cloud & DevOps</option>
                <option value="IoT">IoT</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Input
              label="Max Team Size"
              type="number"
              min="1"
              max="20"
              value={editFormData.maxTeamSize}
              onChange={(e) => setEditFormData({ ...editFormData, maxTeamSize: e.target.value })}
              required
            />
          </div>

          <Input
            label="Required Skills (comma-separated)"
            value={editFormData.requiredSkills}
            onChange={(e) => setEditFormData({ ...editFormData, requiredSkills: e.target.value })}
          />

          <Input
            label="Repository URL"
            value={editFormData.repositoryUrl}
            onChange={(e) => setEditFormData({ ...editFormData, repositoryUrl: e.target.value })}
          />

          <Input
            label="Demo URL"
            value={editFormData.demoUrl}
            onChange={(e) => setEditFormData({ ...editFormData, demoUrl: e.target.value })}
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
              onClick={() => setEditingProject(null)}
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
              Save Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-[#F8FAFC]">{projectToDelete?.title}</span>? Team collaboration records and applications will be archived.
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

export default MyProjects;

