import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineArrowLeft,
  HiOutlineUser,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth.js';
import { jobService } from '../../services/jobService.js';
import { applicationService } from '../../services/applicationService.js';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import ROUTES from '../../constants/routes.js';

export const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [isApplied, setIsApplied] = useState(false);

  // Apply Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchJobDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await jobService.getJobById(id);
      if (data?.job) {
        setJob(data.job);
      }

      // Check if student already applied
      if (user?.role === 'student') {
        const myApps = await applicationService.getMyApplications({ limit: 100 });
        if (myApps?.applications) {
          const hasApplied = myApps.applications.some(
            (app) => (app.job?._id || app.job) === id
          );
          setIsApplied(hasApplied);
        }
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      setApplying(true);
      await applicationService.applyJob(id, { coverLetter: coverLetter.trim() });
      toast.success('Application submitted successfully!');
      setIsApplied(true);
      setShowApplyModal(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" message="Loading job posting..." />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Job Posting Not Found</h2>
        <Button variant="outline" onClick={() => navigate(ROUTES.JOBS)}>
          Back to Jobs
        </Button>
      </div>
    );
  }

  const isClosed = job.status === 'Closed';
  const isDeadlinePassed = job.deadline && new Date(job.deadline) < new Date();
  const poster = job.postedBy || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-[#CBD5E1]">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#818CF8] transition-colors"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Main Job Overview Card */}
      <div className="bg-[#151E32] rounded-3xl p-6 sm:p-8 border border-[#26334D] shadow-soft-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#26334D]">
          <div className="space-y-1.5 min-w-0">
            <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
              {job.company}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8] pt-1">
              {job.location && (
                <span className="inline-flex items-center gap-1">
                  <HiOutlineLocationMarker className="w-4 h-4 text-[#64748B]" />
                  {job.location}
                </span>
              )}
              {job.salaryRange && (
                <span className="inline-flex items-center gap-1">
                  <HiOutlineCurrencyDollar className="w-4 h-4 text-[#64748B]" />
                  {job.salaryRange}
                </span>
              )}
              {job.jobType && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#6366F1]/15 text-[#818CF8] font-semibold border border-[#6366F1]/30">
                  {job.jobType}
                </span>
              )}
            </div>
          </div>

          {/* Status & Apply Action Button */}
          <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isClosed
                  ? 'bg-[#202B40] text-[#94A3B8] border border-[#334155]'
                  : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
              }`}
            >
              Status: {job.status || 'Open'}
            </span>

            {user?.role === 'student' && (
              isApplied ? (
                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-950/70 text-emerald-300 text-xs font-bold border border-emerald-800/60">
                  <HiOutlineCheckCircle className="w-4 h-4" />
                  Already Applied
                </span>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  disabled={isClosed || isDeadlinePassed}
                  onClick={() => setShowApplyModal(true)}
                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
                >
                  {isClosed
                    ? 'Job Closed'
                    : isDeadlinePassed
                    ? 'Deadline Passed'
                    : 'Apply for Position'}
                </Button>
              )
            )}
          </div>
        </div>

        {/* Key Information Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Employment Type
            </span>
            <span className="text-sm font-bold text-[#F8FAFC]">
              {job.jobType || 'Full-time'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Compensation
            </span>
            <span className="text-sm font-bold text-[#F8FAFC]">
              {job.salaryRange || 'Competitive'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Deadline
            </span>
            <span
              className={`text-sm font-bold ${
                isDeadlinePassed ? 'text-rose-400' : 'text-[#F8FAFC]'
              }`}
            >
              {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#202B40] border border-[#26334D]">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block">
              Posted Date
            </span>
            <span className="text-sm font-bold text-[#F8FAFC]">
              {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recent'}
            </span>
          </div>
        </div>

        {/* Required Skills */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
              Required Skills & Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, idx) => (
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

        {/* Full Job Description */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3">
            Job Description & Responsibilities
          </h3>
          <div className="p-5 rounded-2xl bg-[#202B40] border border-[#26334D] text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-line">
            {job.description}
          </div>
        </div>

        {/* Recruiter / Posted By Profile Box */}
        {poster && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#202B40] border border-[#26334D] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {poster.profilePicture ? (
                <img
                  src={poster.profilePicture}
                  alt={poster.fullName || 'Alumni Recruiter'}
                  className="w-11 h-11 rounded-full object-cover border border-[#26334D]"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#151E32] text-[#818CF8] font-bold flex items-center justify-center text-sm border border-[#6366F1]/30">
                  {poster.fullName?.charAt(0) || <HiOutlineUser className="w-5 h-5" />}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Posted By Alumni
                </p>
                <p className="text-sm font-bold text-[#F8FAFC]">
                  {poster.fullName || 'Verified Alumni'}
                </p>
              </div>
            </div>

            {user?._id !== poster._id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/chat/${poster._id}`)}
                className="bg-[#151E32] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
              >
                Send Message
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={`Apply for ${job.title}`}
      >
        <form onSubmit={handleApply} className="space-y-4">
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Your verified student profile and resume will be attached to your application for{' '}
            <span className="font-bold text-[#F8FAFC]">{job.company}</span>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
              Cover Letter / Note to Recruiter (Optional)
            </label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Highlight relevant projects, coursework, or why you're interested in this role..."
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
              Confirm Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobDetails;

