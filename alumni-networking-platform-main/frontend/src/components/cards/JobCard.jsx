import React from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import Button from '../common/Button.jsx';

/**
 * Reusable Job Card Component with modern dark theme styling
 */
export const JobCard = ({
  job,
  isApplied = false,
  onApply,
  onEdit,
  onDelete,
  onToggleStatus,
  isOwner = false,
  isAdmin = false,
  className = '',
}) => {
  if (!job) return null;

  const isClosed = job.status === 'Closed';
  const isDeadlinePassed = job.deadline && new Date(job.deadline) < new Date();

  return (
    <div
      className={`bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm hover:border-[#6366F1]/50 hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between ${
        isClosed ? 'opacity-70 bg-[#151E32]/70' : ''
      } ${className}`}
    >
      <div>
        {/* Header: Title, Company, Status Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <Link
              to={`/jobs/${job._id}`}
              className="text-base sm:text-lg font-bold text-[#F8FAFC] hover:text-[#818CF8] transition-colors line-clamp-1"
            >
              {job.title}
            </Link>
            <p className="text-sm font-medium text-[#94A3B8] truncate mt-0.5">
              {job.company}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isClosed
                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                  : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
              }`}
            >
              {job.status || 'Open'}
            </span>

            {job.jobType && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#6366F1]/15 text-[#818CF8] border border-[#6366F1]/30">
                {job.jobType}
              </span>
            )}
          </div>
        </div>

        {/* Metadata pills */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-400 mb-4">
          {job.location && (
            <span className="inline-flex items-center gap-1">
              <HiOutlineLocationMarker className="w-3.5 h-3.5 text-slate-500" />
              {job.location}
            </span>
          )}

          {job.salaryRange && (
            <span className="inline-flex items-center gap-1">
              <HiOutlineCurrencyDollar className="w-3.5 h-3.5 text-slate-500" />
              {job.salaryRange}
            </span>
          )}

          {job.deadline && (
            <span
              className={`inline-flex items-center gap-1 ${
                isDeadlinePassed ? 'text-rose-400 font-medium' : ''
              }`}
            >
              <HiOutlineClock className="w-3.5 h-3.5" />
              Deadline: {new Date(job.deadline).toLocaleDateString()}
            </span>
          )}

          {job.applicationsCount !== undefined && (
            <span className="inline-flex items-center gap-1 font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/60">
              <HiOutlineBriefcase className="w-3.5 h-3.5 text-slate-400" />
              {job.applicationsCount} applicants
            </span>
          )}
        </div>

        {/* Description snippet */}
        {job.description && (
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mb-4 leading-relaxed">
            {job.description}
          </p>
        )}

        {/* Required Skills tags */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-5">
            {job.requiredSkills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 text-xs font-medium border border-slate-700/60"
              >
                {skill}
              </span>
            ))}
            {job.requiredSkills.length > 4 && (
              <span className="text-[11px] text-slate-500 font-medium self-center">
                +{job.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-[#26334D] flex items-center justify-between gap-3">
        <Link
          to={`/jobs/${job._id}`}
          className="text-xs font-semibold text-[#818CF8] hover:text-white hover:underline"
        >
          View Details &rarr;
        </Link>

        <div className="flex items-center gap-2">
          {/* Student Apply Button */}
          {onApply && (
            isApplied ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 text-xs font-semibold border border-emerald-800/60">
                <HiOutlineCheckCircle className="w-4 h-4" />
                Applied
              </span>
            ) : (
              <Button
                variant="primary"
                size="sm"
                disabled={isClosed || isDeadlinePassed}
                onClick={() => onApply(job)}
              >
                {isClosed ? 'Closed' : isDeadlinePassed ? 'Expired' : 'Apply Now'}
              </Button>
            )
          )}

          {/* Owner / Admin Management Actions */}
          {(isOwner || isAdmin) && (
            <>
              {onToggleStatus && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleStatus(job)}
                >
                  {job.status === 'Open' ? 'Close' : 'Reopen'}
                </Button>
              )}

              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(job)}
                >
                  Edit
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(job)}
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

export default JobCard;
