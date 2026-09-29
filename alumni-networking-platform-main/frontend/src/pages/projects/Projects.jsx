import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineSparkles,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlinePlus,
  HiOutlineX,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth.js';
import { projectService } from '../../services/projectService.js';
import ProjectCard from '../../components/cards/ProjectCard.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ROUTES from '../../constants/routes.js';

export const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 9,
  });

  // Track applied projects for current student
  const [appliedProjectIds, setAppliedProjectIds] = useState(new Set());

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('recruiting');
  const [skill, setSkill] = useState('');

  // Apply Modal
  const [selectedProject, setSelectedProject] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applicationSkills, setApplicationSkills] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchStudentApplications = useCallback(async () => {
    if (user?.role !== 'student') return;
    try {
      const data = await projectService.getMyProjectApplications({ limit: 100 });
      if (data?.data?.applications) {
        const idSet = new Set(data.data.applications.map((app) => app.project?._id || app.project));
        setAppliedProjectIds(idSet);
      }
    } catch (err) {
      // silent
    }
  }, [user]);

  const fetchProjects = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          search: search.trim() || undefined,
          category: category || undefined,
          status: status || undefined,
          skill: skill.trim() || undefined,
        };

        const data = await projectService.getProjects(params);
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
        toast.error(err?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    },
    [search, category, status, skill, pagination.limit]
  );

  useEffect(() => {
    fetchProjects(1);
    fetchStudentApplications();
  }, [category, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('recruiting');
    setSkill('');
  };

  const handleOpenApplyModal = (project) => {
    setSelectedProject(project);
    setApplicationMessage('');
    setApplicationSkills('');
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      setApplying(true);
      await projectService.applyToProject(selectedProject._id, {
        message: applicationMessage.trim(),
        skills: applicationSkills.trim(),
      });
      toast.success(`Application sent for "${selectedProject.title}"!`);
      setAppliedProjectIds((prev) => new Set([...prev, selectedProject._id]));
      setSelectedProject(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Collaborative Engineering
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Projects & Innovation
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Join cross-functional teams, contribute to real codebases, and build industry-ready portfolio projects.
          </p>
        </div>

        {user?.role === 'alumni' && (
          <Button
            variant="primary"
            icon={HiOutlinePlus}
            onClick={() => navigate(ROUTES.CREATE_PROJECT)}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
          >
            Create Project
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#151E32] rounded-2xl p-4 sm:p-5 border border-[#26334D] shadow-soft-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by title, description, skills..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#334155] bg-[#202B40] text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] placeholder-[#64748B]"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
            >
              <option value="">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="AI/ML">AI / Machine Learning</option>
              <option value="Data Science">Data Science</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Cloud">Cloud & DevOps</option>
              <option value="IoT">IoT</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full sm:w-36 px-3 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
            >
              <option value="">All Statuses</option>
              <option value="recruiting">Recruiting</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <Button type="submit" variant="primary" size="sm" icon={HiOutlineFilter}>
              Filter
            </Button>

            {(search || category || skill || status !== 'recruiting') && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={HiOutlineX}
                onClick={handleClearFilters}
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading projects..." />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={HiOutlineSparkles}
          title="No projects found"
          description="No projects match your current filter settings."
          action={
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                isApplied={appliedProjectIds.has(project._id)}
                onApply={user?.role === 'student' ? handleOpenApplyModal : undefined}
                isOwner={project.createdBy?._id?.toString() === user?._id?.toString()}
                isAdmin={user?.role === 'admin'}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => fetchProjects(p)}
          />
        </div>
      )}

      {/* Join Project Team Modal */}
      <Modal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={`Join ${selectedProject?.title || 'Project'}`}
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#202B40] border border-[#26334D] text-xs space-y-1">
            <p className="font-bold text-[#F8FAFC]">
              Category: {selectedProject?.category}
            </p>
            <p className="text-[#94A3B8]">
              Explain how you can contribute and what technical skills you bring to the team.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
              Your Skills & Experience for this Project
            </label>
            <input
              type="text"
              value={applicationSkills}
              onChange={(e) => setApplicationSkills(e.target.value)}
              placeholder="e.g. React, Tailwind, GraphQL, PostgreSQL"
              className="w-full rounded-xl border border-[#334155] bg-[#202B40] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
              Message to Project Owner
            </label>
            <textarea
              rows={4}
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              placeholder="Why do you want to collaborate on this project? How many hours per week can you dedicate?"
              className="w-full rounded-xl border border-[#334155] bg-[#202B40] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedProject(null)}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={applying}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
            >
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
