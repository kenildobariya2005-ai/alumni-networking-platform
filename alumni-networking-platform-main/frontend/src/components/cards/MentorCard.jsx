import React from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineChatAlt2,
  HiOutlineBadgeCheck,
} from 'react-icons/hi';
import Button from '../common/Button.jsx';

/**
 * Reusable Alumni Mentor Card Component with modern dark theme styling
 */
export const MentorCard = ({
  mentorProfile,
  onRequestMentorship,
  onMessage,
  className = '',
}) => {
  if (!mentorProfile) return null;

  const user = mentorProfile.user || {};
  const isAvailable = mentorProfile.mentorAvailable;
  const isVerified = mentorProfile.isVerified || user.isVerified;

  return (
    <div
      className={`bg-[#151E32] rounded-2xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm hover:border-[#6366F1]/50 hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Mentor Header: Avatar, Name, Designation, Company */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullName || 'Mentor'}
                className="w-14 h-14 rounded-2xl object-cover border border-[#26334D] shadow-soft-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[#202B40] text-[#818CF8] font-bold text-lg flex items-center justify-center border border-[#6366F1]/30">
                {user.fullName?.charAt(0) || 'M'}
              </div>
            )}

            {isVerified && (
              <div
                className="absolute -top-1.5 -right-1.5 bg-[#6366F1] text-white rounded-full p-0.5 shadow-sm ring-2 ring-[#151E32]"
                title="Verified Alumni"
              >
                <HiOutlineBadgeCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-[#F8FAFC] truncate">
              {user.fullName || 'Alumni Mentor'}
            </h3>
            <p className="text-xs font-semibold text-[#818CF8] truncate mt-0.5">
              {mentorProfile.designation || 'Professional'}
            </p>
            <p className="text-xs text-[#94A3B8] truncate">
              {mentorProfile.company || 'Alumni'}
            </p>
          </div>
        </div>

        {/* Status and Experience Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isAvailable
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAvailable ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            {isAvailable ? 'Available for Mentoring' : 'Currently Unavailable'}
          </span>

          {mentorProfile.experienceYears !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60">
              <HiOutlineBriefcase className="w-3.5 h-3.5 text-slate-400" />
              {mentorProfile.experienceYears} {mentorProfile.experienceYears === 1 ? 'year' : 'years'} exp
            </span>
          )}

          {mentorProfile.location && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60">
              <HiOutlineLocationMarker className="w-3.5 h-3.5 text-slate-400" />
              {mentorProfile.location}
            </span>
          )}
        </div>

        {/* Bio snippet */}
        {mentorProfile.bio && (
          <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
            {mentorProfile.bio}
          </p>
        )}

        {/* Mentor Skills */}
        {mentorProfile.skills && mentorProfile.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-5">
            {mentorProfile.skills.slice(0, 4).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 text-xs font-medium border border-indigo-800/50"
              >
                {skill}
              </span>
            ))}
            {mentorProfile.skills.length > 4 && (
              <span className="text-[11px] text-slate-500 font-medium self-center">
                +{mentorProfile.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-[#26334D] flex items-center justify-between gap-2">
        {onMessage && user._id && (
          <Button
            variant="outline"
            size="sm"
            icon={HiOutlineChatAlt2}
            onClick={() => onMessage(user._id)}
          >
            Message
          </Button>
        )}

        {onRequestMentorship ? (
          <Button
            variant="primary"
            size="sm"
            disabled={!isAvailable}
            onClick={() => onRequestMentorship(mentorProfile)}
            className="flex-1"
          >
            {isAvailable ? 'Request Mentorship' : 'Unavailable'}
          </Button>
        ) : (
          <Link
            to={`/mentorship/request/${user._id || mentorProfile.user}`}
            className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
              isAvailable
                ? 'bg-primary-600 text-white hover:bg-primary-500'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none border border-slate-700'
            }`}
          >
            Request Mentorship
          </Link>
        )}
      </div>
    </div>
  );
};

export default MentorCard;
