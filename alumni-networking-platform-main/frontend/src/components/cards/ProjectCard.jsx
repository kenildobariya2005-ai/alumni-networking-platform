import React from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineUserGroup,
  HiOutlineTag,
  HiOutlineClock,
  HiOutlineCode,
  HiOutlineExternalLink,
} from 'react-icons/hi';
import Button from '../common/Button.jsx';

/**
 * Reusable Project Collaboration Card Component with modern dark theme styling
 */
export const ProjectCard = ({
  project,
  isApplied = false,
  onApply,
  onEdit,
  onDelete,
  onStatusChange,
  isOwner = false,
  isAdmin = false,
  className = '',
}) => {
  if (!project) return null;

  const teamCount = project.teamMembers?.length || 0;
  const maxTeam = project.maxTeamSize || 5;
  const isFull = teamCount >= maxTeam;
  const isExpired = project.deadline && new Date(project.deadline) < new Date();

  const statusColors = {
    recruiting: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    'in-progress': 'bg-blue-950/70 text-blue-300 border-blue-800/60',
    completed: 'bg-[#202B40] text-[#CBD5E1] border-[#334155]',
    cancelled: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
  };

  return (
    <div
      className={`bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm hover:border-[#6366F1]/50 hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header: Title, Category, Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <Link
              to={`/projects/${project._id}`}
              className="text-base sm:text-lg font-bold text-[#F8FAFC] hover:text-[#818CF8] transition-colors line-clamp-1"
            >
              {project.title}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#94A3B8]">
                <HiOutlineTag className="w-3.5 h-3.5 text-[#64748B]" />
                {project.category}
              </span>
              {project.createdBy?.fullName && (
                <span className="text-xs text-[#64748B]">
                  &bull; by {project.createdBy.fullName}
                </span>
              )}
            </div>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize flex-shrink-0 ${
              statusColors[project.status] || 'bg-[#202B40] text-[#CBD5E1] border-[#334155]'
            }`}
          >
            {project.status}
          </span>
        </div>

        {/* Team Size & Deadline Metrics */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-[#94A3B8] mb-4">
          <span
            className={`inline-flex items-center gap-1 font-medium ${
              isFull ? 'text-amber-400' : 'text-[#CBD5E1]'
            }`}
          >
            <HiOutlineUserGroup className="w-3.5 h-3.5 text-[#64748B]" />
            Team: {teamCount} / {maxTeam} members {isFull && '(Full)'}
          </span>

          {project.deadline && (
            <span
              className={`inline-flex items-center gap-1 ${
                isExpired ? 'text-rose-400 font-medium' : ''
              }`}
            >
              <HiOutlineClock className="w-3.5 h-3.5 text-[#64748B]" />
              Deadline: {new Date(project.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs sm:text-sm text-[#CBD5E1] line-clamp-2 mb-4 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Required Skills */}
        {project.requiredSkills && project.requiredSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-5">
            {project.requiredSkills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-[#202B40] text-[#CBD5E1] text-xs font-medium border border-[#334155]"
              >
                {skill}
              </span>
            ))}
            {project.requiredSkills.length > 4 && (
              <span className="text-[11px] text-[#94A3B8] font-medium self-center">
                +{project.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Links & Actions */}
      <div className="pt-4 border-t border-[#26334D] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${project._id}`}
            className="text-xs font-semibold text-[#818CF8] hover:text-[#F8FAFC] hover:underline"
          >
            View Details &rarr;
          </Link>

          {project.repositoryUrl && (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              title="Repository Link"
            >
              <HiOutlineCode className="w-4 h-4" />
            </a>
          )}

          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              title="Live Demo Link"
            >
              <HiOutlineExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Apply Button */}
          {onApply && (
            isApplied ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 text-xs font-semibold border border-emerald-800/60">
                Applied
              </span>
            ) : (
              <Button
                variant="primary"
                size="sm"
                disabled={isFull || project.status !== 'recruiting' || isExpired}
                onClick={() => onApply(project)}
              >
                {isFull ? 'Team Full' : project.status !== 'recruiting' ? 'Not Recruiting' : 'Join Team'}
              </Button>
            )
          )}

          {/* Owner / Admin Management */}
          {(isOwner || isAdmin) && (
            <>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(project)}
                >
                  Edit
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(project)}
                >
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
