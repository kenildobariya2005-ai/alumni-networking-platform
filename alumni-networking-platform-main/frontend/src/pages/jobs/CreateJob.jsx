import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineArrowLeft,
} from 'react-icons/hi';
import { jobService } from '../../services/jobService.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import ROUTES from '../../constants/routes.js';

export const CreateJob = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'Full-time',
    salaryRange: '',
    requiredSkills: '',
    deadline: '',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Job title is required');
      return;
    }
    if (!formData.company.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Job description is required');
      return;
    }

    if (formData.deadline) {
      const d = new Date(formData.deadline);
      if (d <= new Date()) {
        toast.error('Application deadline must be a future date');
        return;
      }
    }

    try {
      setSubmitting(true);
      const skillsArray = formData.requiredSkills
        ? formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await jobService.createJob({
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        jobType: formData.jobType,
        salaryRange: formData.salaryRange.trim(),
        requiredSkills: skillsArray,
        deadline: formData.deadline || undefined,
        description: formData.description.trim(),
      });

      toast.success('Job posting created successfully!');
      navigate(ROUTES.ALUMNI_JOBS);
    } catch (err) {
      toast.error(err?.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in text-[#CBD5E1]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#818CF8] transition-colors"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-[#151E32] rounded-3xl p-6 sm:p-8 border border-[#26334D] shadow-soft-sm space-y-6">
        <div className="border-b border-[#26334D] pb-4">
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Alumni Recruiter Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Post a Job or Internship
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Share career opportunities at your organization with verified students and alumni.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Job / Internship Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Frontend Engineering Intern, Associate Backend Dev"
              required
            />

            <Input
              label="Hiring Company / Organization"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Google, Microsoft, TechNova Solutions"
              required
            />

            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bengaluru / Remote / Hybrid"
              icon={HiOutlineLocationMarker}
            />

            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#CBD5E1] mb-1.5">
                Employment Type
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#334155] px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:outline-none bg-[#202B40] text-[#F8FAFC] font-medium"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <Input
              label="Compensation / Salary Range (Optional)"
              name="salaryRange"
              value={formData.salaryRange}
              onChange={handleChange}
              placeholder="e.g. $80k - $100k / ₹6 LPA - ₹10 LPA / ₹25k/mo stipend"
              icon={HiOutlineCurrencyDollar}
            />

            <Input
              label="Application Deadline (Optional)"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              icon={HiOutlineCalendar}
            />
          </div>

          <div>
            <Input
              label="Required Technical Skills & Technologies (comma-separated)"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, TypeScript, PostgreSQL, Docker"
              icon={HiOutlineTag}
              helperText="Separate skills with commas"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#CBD5E1] mb-1.5">
              Full Job Description & Candidate Requirements <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the day-to-day responsibilities, qualifications, project scope, and interview process..."
              required
              className="w-full rounded-2xl border border-[#334155] bg-[#202B40] px-4 py-3 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:outline-none leading-relaxed transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#26334D]">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
            >
              Publish Job Posting
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
