import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineTag,
  HiOutlineClock,
  HiOutlineCode,
  HiOutlineExternalLink,
  HiOutlineArrowLeft,
  HiOutlineUser,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth.js';
import { projectService } from '../../services/projectService.js';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import ROUTES from '../../constants/routes.js';

export const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [isApplied, setIsApplied] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);

  // Apply Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applicationSkills, setApplicationSkills] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjectById(id);
      if (data?.data?.project) {
        const proj = data.data.project;
        setProject(proj);

        // Check if user is already a team member
        const isMember = proj.teamMembers?.some(
          (m) => (m._id || m).toString() === user?._id?.toString()
        );
        setIsTeamMember(isMember);
      }

      // Check student applications
      if (user?.role === 'student') {
        const myApps = await projectService.getMyProjectApplications({ limit: 100 });
        if (myApps?.data?.applications) {
          const hasApplied = myApps.data.applications.some(
            (app) => (app.project?._id || app.project) === id && app.status !== 'withdrawn'
          );
          setIsApplied(hasApplied);
        }
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      setApplying(true);
      await projectService.applyToProject(id, {
        message: applicationMessage.trim(),
        skills: applicationSkills.trim(),
      });
      toast.success('Project application submitted successfully!');
      setIsApplied(true);
      setShowApplyModal(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to apply to project');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" message="Loading project details..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <Button variant="outline" onClick={() => navigate(ROUTES.PROJECTS)}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const teamMembers = project.teamMembers || [];
  const maxTeam = project.maxTeamSize || 5;
  const isFull = teamMembers.length >= maxTeam;
  const isCreator = project.createdBy?._id?.toString() === user?._id?.toString();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-[#CBD5E1]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#818CF8] transition-colors"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Main Project Overview Card */}
      <div className="bg-[#151E32] rounded-3xl p-6 sm:p-8 border border-[#26334D] shadow-soft-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#26334D]">
          <div className="space-y-1.5 min-w-0">
            <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
              {project.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">
              {project.title}
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Created by <span className="font-semibold text-[#CBD5E1]">{project.createdBy?.fullName || 'Alumni'}</span> &bull;{' '}
              {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30 capitalize">
              Status: {project.status}
            </span>

            {user?.role === 'student' && !isCreator && (
              isTeamMember ? (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/70 text-emerald-300 text-xs font-bold border border-emerald-800/60">
                  <HiOutlineCheckCircle className="w-4 h-4" /> Team Member
                </span>
              ) : isApplied ? (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-950/70 text-amber-300 text-xs font-bold border border-amber-800/60">
                  Application Pending
                </span>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  disabled={isFull || project.status !== 'recruiting'}
                  onClick={() => setShowApplyModal(true)}
                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
                >
                  {isFull ? 'Team Full' : project.status !== 'recruiting' ? 'Not Recruiting' : 'Join Project Team'}
                </Button>
              )
            )}
          </div>
        </div>

        {/* Project Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Team Size
            </span>
            <span className="text-sm font-bold text-[#F8FAFC]">
              {teamMembers.length} / {maxTeam} members
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Category
            </span>
            <span className="text-sm font-bold text-[#F8FAFC]">
              {project.category}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Target Deadline
            </span>
            <span className="text-sm font-bold text-[#F8FAFC]">
              {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Open ended'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Status
            </span>
            <span className="text-sm font-bold text-[#F8FAFC] capitalize">
              {project.status}
            </span>
          </div>
        </div>

        {/* Links */}
        {(project.repositoryUrl || project.demoUrl) && (
          <div className="flex flex-wrap items-center gap-3">
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#202B40] text-[#CBD5E1] text-xs font-semibold border border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC] transition-colors"
              >
                <HiOutlineCode className="w-4 h-4 text-[#818CF8]" />
                Source Code Repository <HiOutlineExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#6366F1]/15 text-[#818CF8] text-xs font-semibold border border-[#6366F1]/30 hover:bg-[#6366F1]/25 transition-colors"
              >
                <HiOutlineExternalLink className="w-4 h-4" />
                Live Demo / Architecture <HiOutlineExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Required Skills */}
        {project.requiredSkills && project.requiredSkills.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
              Required Technical Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-[#6366F1]/15 text-[#818CF8] text-xs font-semibold border border-[#6366F1]/30"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Project Description */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
            Project Overview & Goals
          </h3>
          <div className="p-5 rounded-2xl bg-[#202B40] border border-[#26334D] text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-line">
            {project.description}
          </div>
        </div>

        {/* Team Members List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
            Collaborating Team Members ({teamMembers.length})
          </h3>
          {teamMembers.length === 0 ? (
            <p className="text-xs text-[#94A3B8] italic">
              No team members have joined yet. Be the first to apply!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#202B40] border border-[#26334D]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt={member.fullName || 'Member'}
                        className="w-8 h-8 rounded-full object-cover border border-[#26334D]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#151E32] text-[#818CF8] font-bold flex items-center justify-center text-xs border border-[#6366F1]/30">
                        {member.fullName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#F8FAFC] truncate">
                        {member.fullName}
                      </p>
                      <p className="text-[10px] text-[#94A3B8] capitalize">
                        {member.role || 'Contributor'}
                      </p>
                    </div>
                  </div>

                  {user?._id !== member._id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/chat/${member._id}`)}
                      className="text-[11px] py-1 px-2 text-[#818CF8] hover:bg-[#151E32]"
                    >
                      Chat
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Apply to Join Team Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={`Apply to Join ${project.title}`}
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
              Skills you bring to this project
            </label>
            <input
              type="text"
              value={applicationSkills}
              onChange={(e) => setApplicationSkills(e.target.value)}
              placeholder="e.g. React, Node.js, REST APIs, Tailwind CSS"
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
              placeholder="Tell the project creator about your interest and availability..."
              className="w-full rounded-xl border border-[#334155] bg-[#202B40] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowApplyModal(false)}
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

export default ProjectDetails;

