import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineBriefcase,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlinePlus,
  HiOutlineX,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth.js';
import { jobService } from '../../services/jobService.js';
import { applicationService } from '../../services/applicationService.js';
import JobCard from '../../components/cards/JobCard.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ROUTES from '../../constants/routes.js';

export const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 9,
  });

  // Applied job IDs for current student
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  // Filter & Search State
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [jobType, setJobType] = useState('');
  const [status, setStatus] = useState(user?.role === 'student' ? 'Open' : '');

  // Apply Modal State
  const [selectedJobToApply, setSelectedJobToApply] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  // Fetch student's already applied jobs
  const fetchAppliedJobs = useCallback(async () => {
    if (user?.role !== 'student') return;
    try {
      const data = await applicationService.getMyApplications({ limit: 100 });
      if (data?.applications) {
        const idSet = new Set(data.applications.map((app) => app.job?._id || app.job));
        setAppliedJobIds(idSet);
      }
    } catch (err) {
      // silent
    }
  }, [user]);

  // Fetch jobs from backend API
  const fetchJobs = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          search: search.trim() || undefined,
          company: company.trim() || undefined,
          location: location.trim() || undefined,
          skills: skills.trim() || undefined,
          jobType: jobType || undefined,
          status: status || undefined,
        };

        const data = await jobService.getAllJobs(params);
        if (data) {
          setJobs(data.jobs || []);
          setPagination((prev) => ({
            ...prev,
            page: data.page || page,
            pages: data.pages || 1,
            total: data.total || 0,
          }));
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    },
    [search, company, location, skills, jobType, status, pagination.limit]
  );

  useEffect(() => {
    fetchJobs(1);
    fetchAppliedJobs();
  }, [jobType, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCompany('');
    setLocation('');
    setSkills('');
    setJobType('');
    setStatus(user?.role === 'student' ? 'Open' : '');
  };

  const handleOpenApplyModal = (job) => {
    setSelectedJobToApply(job);
    setCoverLetter('');
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedJobToApply) return;

    try {
      setApplying(true);
      await applicationService.applyJob(selectedJobToApply._id, {
        coverLetter: coverLetter.trim(),
      });
      toast.success(`Application submitted for ${selectedJobToApply.title}!`);
      setAppliedJobIds((prev) => new Set([...prev, selectedJobToApply._id]));
      setSelectedJobToApply(null);
    } catch (err) {
      toast.error(err?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm">
        <div>
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Career Opportunities
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Jobs & Internships
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Discover internships and full-time positions posted directly by verified university alumni.
          </p>
        </div>

        {(user?.role === 'alumni' || user?.role === 'admin') && (
          <Button
            variant="primary"
            icon={HiOutlinePlus}
            onClick={() => navigate(ROUTES.CREATE_JOB)}
            className="self-start sm:self-auto bg-[#6366F1] hover:bg-[#4F46E5] text-white"
          >
            Post a Job
          </Button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#151E32] rounded-2xl p-4 sm:p-5 border border-[#26334D] shadow-soft-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company, skills..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#334155] bg-[#202B40] text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] placeholder-[#64748B]"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location..."
              className="w-full sm:w-36 px-3 py-2 rounded-xl border border-[#334155] bg-[#202B40] text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] placeholder-[#64748B]"
            />

            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full sm:w-36 px-3 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
            </select>

            <Button type="submit" variant="primary" size="sm" icon={HiOutlineFilter}>
              Search
            </Button>

            {(search || location || jobType) && (
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

      {/* Job Cards Grid */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Searching for opportunities..." />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={HiOutlineBriefcase}
          title="No opportunities found"
          description="We couldn't find any job postings matching your current search parameters."
          action={
            (search || location || jobType) && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Search Filters
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              isApplied={appliedJobIds.has(job._id)}
              onApply={(j) => setSelectedJobToApply(j)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="pt-4 flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => fetchJobs(p)}
          />
        </div>
      )}

      {/* Apply to Job Modal */}
      <Modal
        isOpen={!!selectedJobToApply}
        onClose={() => setSelectedJobToApply(null)}
        title={`Apply to ${selectedJobToApply?.title || 'Job'}`}
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#202B40] border border-[#26334D] text-xs space-y-1">
            <p className="font-bold text-[#F8FAFC]">
              {selectedJobToApply?.company} &bull; {selectedJobToApply?.location}
            </p>
            <p className="text-[#94A3B8]">
              Your profile snapshot and saved resume will be sent to the alumni recruiter.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
              Cover Letter / Note to Recruiter (Optional)
            </label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Introduce yourself and explain why you're a great fit for this position..."
              className="w-full rounded-xl border border-[#334155] bg-[#202B40] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedJobToApply(null)}
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

export default Jobs;
