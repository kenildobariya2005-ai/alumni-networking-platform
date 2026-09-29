import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineX,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth.js';
import { alumniService } from '../../services/alumniService.js';
import MentorCard from '../../components/cards/MentorCard.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ROUTES from '../../constants/routes.js';

export const Mentors = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 9,
  });

  // Filters
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [availabilityOnly, setAvailabilityOnly] = useState(true);

  const fetchMentors = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          company: company.trim() || undefined,
          skills: skills.trim() || undefined,
          location: location.trim() || undefined,
          mentorAvailable: availabilityOnly ? true : undefined,
        };

        const data = await alumniService.searchAlumni(params);
        if (data) {
          setMentors(data.profiles || []);
          setPagination((prev) => ({
            ...prev,
            page: data.currentPage || page,
            pages: data.pages || 1,
            total: data.total || 0,
          }));
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to fetch alumni mentors');
      } finally {
        setLoading(false);
      }
    },
    [company, skills, location, availabilityOnly, pagination.limit]
  );

  useEffect(() => {
    fetchMentors(1);
  }, [availabilityOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMentors(1);
  };

  const handleClearFilters = () => {
    setCompany('');
    setSkills('');
    setLocation('');
    setAvailabilityOnly(false);
  };

  const handleRequestMentorship = (mentorProfile) => {
    const targetUserId = mentorProfile.user?._id || mentorProfile.user;
    navigate(`/mentorship/request/${targetUserId}`);
  };

  const handleMessage = (mentorUserId) => {
    navigate(`/chat/${mentorUserId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Alumni Mentorship Network
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Connect with Alumni Mentors
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Book 1-on-1 guidance sessions, resume reviews, and career coaching with industry leaders.
          </p>
        </div>

        {user?.role === 'student' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.STUDENT_MENTORSHIPS)}
            className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
          >
            My Mentorship Requests
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
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Search by skills or domain (e.g. Python, AI, AWS, Frontend)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#334155] bg-[#202B40] text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] placeholder-[#64748B]"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company (e.g. Google, Amazon)..."
              className="w-full sm:w-44 px-3 py-2 rounded-xl border border-[#334155] bg-[#202B40] text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] placeholder-[#64748B]"
            />

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location..."
              className="w-full sm:w-32 px-3 py-2 rounded-xl border border-[#334155] bg-[#202B40] text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] placeholder-[#64748B]"
            />

            <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#CBD5E1] px-2 py-1 select-none whitespace-nowrap cursor-pointer">
              <input
                type="checkbox"
                checked={availabilityOnly}
                onChange={(e) => setAvailabilityOnly(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-[#6366F1] border-[#334155] bg-[#202B40]"
              />
              Available Now
            </label>

            <Button type="submit" variant="primary" size="sm" icon={HiOutlineFilter}>
              Filter
            </Button>

            {(company || skills || location || !availabilityOnly) && (
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

      {/* Mentors Grid */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Finding mentors..." />
        </div>
      ) : mentors.length === 0 ? (
        <EmptyState
          icon={HiOutlineAcademicCap}
          title="No mentors found"
          description="We couldn't find any alumni mentors matching your current search parameters."
          action={
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentorProfile) => (
              <MentorCard
                key={mentorProfile._id}
                mentorProfile={mentorProfile}
                onRequestMentorship={
                  user?.role === 'student' ? handleRequestMentorship : undefined
                }
                onMessage={handleMessage}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => fetchMentors(p)}
          />
        </div>
      )}
    </div>
  );
};

export default Mentors;
