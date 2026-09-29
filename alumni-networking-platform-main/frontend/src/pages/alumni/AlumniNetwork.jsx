import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineChatAlt2,
  HiOutlineBadgeCheck,
  HiOutlineAcademicCap,
  HiOutlineFilter,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { alumniService } from '../../services/alumniService.js';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Button from '../../components/common/Button.jsx';
import useAuth from '../../hooks/useAuth.js';

export const AlumniNetwork = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [mentorOnly, setMentorOnly] = useState(false);

  const fetchNetwork = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 24,
      };
      if (companyFilter) params.company = companyFilter;
      if (mentorOnly) params.mentorAvailable = true;

      const data = await alumniService.searchAlumni(params);
      if (data && data.profiles) {
        // Filter out the currently logged in user
        const otherAlumni = data.profiles.filter(
          (p) => p.user?._id !== user?._id
        );
        setProfiles(otherAlumni);
        setTotal(data.total || otherAlumni.length);
      }
    } catch (err) {
      console.error('Failed to load alumni network:', err);
      toast.error('Failed to load alumni directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, [companyFilter, mentorOnly]);

  const filteredProfiles = profiles.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = p.user?.fullName?.toLowerCase().includes(term);
    const companyMatch = p.company?.toLowerCase().includes(term);
    const designationMatch = p.designation?.toLowerCase().includes(term);
    const skillMatch = p.skills?.some((s) => s.toLowerCase().includes(term));
    return nameMatch || companyMatch || designationMatch || skillMatch;
  });

  return (
    <div className="space-y-8 animate-fade-in text-[#CBD5E1]">
      {/* Header */}
      <div className="bg-[#151E32] rounded-2xl p-6 sm:p-8 border border-[#26334D] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 mb-2">
            <HiOutlineUserGroup className="w-4 h-4 text-emerald-400" /> Alumni Directory & Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">
            Alumni Professional Network
          </h1>
          <p className="text-[#94A3B8] text-xs sm:text-sm mt-1">
            Connect, collaborate, and exchange career referrals with fellow graduates across global industries.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-[#94A3B8] block">Total Connected Alumni</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{total}</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#151E32] rounded-2xl p-4 border border-[#26334D] flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <HiOutlineSearch className="absolute left-3.5 top-3 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by name, designation, company, or skills (e.g. React, AWS)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#202B40] text-[#F8FAFC] placeholder-[#94A3B8] text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 border border-[#26334D] focus:outline-none focus:border-[#6366F1]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Filter by company..."
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="bg-[#202B40] text-[#F8FAFC] placeholder-[#94A3B8] text-xs rounded-xl px-3 py-2.5 border border-[#26334D] focus:outline-none focus:border-[#6366F1] flex-1 sm:w-44"
          />

          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#202B40] border border-[#26334D] cursor-pointer text-xs whitespace-nowrap hover:border-[#334155]">
            <input
              type="checkbox"
              checked={mentorOnly}
              onChange={(e) => setMentorOnly(e.target.checked)}
              className="rounded border-slate-700 text-[#6366F1] focus:ring-[#6366F1]"
            />
            <span className="text-xs text-[#F8FAFC]">Available Mentors</span>
          </label>
        </div>
      </div>

      {/* Grid of Alumni Cards */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader size="md" message="Loading alumni network profiles..." />
        </div>
      ) : filteredProfiles.length === 0 ? (
        <EmptyState
          icon={HiOutlineUserGroup}
          title="No alumni found"
          description="Try modifying your search keywords or clearing filters."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setCompanyFilter('');
                setMentorOnly(false);
              }}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155]"
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProfiles.map((p) => {
            const member = p.user || {};
            return (
              <div
                key={p._id}
                className="bg-[#151E32] rounded-2xl p-5 border border-[#26334D] hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt={member.fullName || 'Alumni'}
                        className="w-12 h-12 rounded-xl object-cover border border-[#26334D] flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#202B40] text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30 flex-shrink-0">
                        {member.fullName?.charAt(0) || 'A'}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-[#F8FAFC] truncate">
                          {member.fullName || 'Alumni Member'}
                        </h3>
                        {(p.isVerified || member.isVerified) && (
                          <HiOutlineBadgeCheck
                            className="w-4 h-4 text-emerald-400 flex-shrink-0"
                            title="Verified Alumni"
                          />
                        )}
                      </div>
                      <p className="text-xs text-emerald-400 font-medium truncate mt-0.5">
                        {p.designation}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] flex items-center gap-1 mt-0.5 truncate">
                        <HiOutlineBriefcase className="w-3.5 h-3.5 text-[#94A3B8]" />
                        {p.company} &bull; {p.experienceYears || 0}y exp
                      </p>
                    </div>
                  </div>

                  {p.location && (
                    <p className="text-[11px] text-[#94A3B8] flex items-center gap-1 mt-2.5 truncate">
                      <HiOutlineLocationMarker className="w-3.5 h-3.5" />
                      {p.location}
                    </p>
                  )}

                  {p.bio && (
                    <p className="text-xs text-[#CBD5E1] mt-2 line-clamp-2 leading-relaxed">
                      {p.bio}
                    </p>
                  )}

                  {/* Skills tags */}
                  {p.skills && p.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.skills.slice(0, 4).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#202B40] text-indigo-300 border border-[#26334D]"
                        >
                          {skill}
                        </span>
                      ))}
                      {p.skills.length > 4 && (
                        <span className="text-[10px] text-[#94A3B8] self-center">
                          +{p.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#26334D] flex items-center justify-between">
                  {p.mentorAvailable ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <HiOutlineAcademicCap className="w-3.5 h-3.5" /> Available Mentor
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#94A3B8]">Alumni Member</span>
                  )}

                  <Link
                    to={`/chat/${member._id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-soft-sm transition-all"
                  >
                    <HiOutlineChatAlt2 className="w-3.5 h-3.5" /> Message
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlumniNetwork;
