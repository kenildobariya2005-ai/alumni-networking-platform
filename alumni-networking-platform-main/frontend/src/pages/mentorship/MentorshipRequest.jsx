import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineChatAlt2,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import { alumniService } from '../../services/alumniService.js';
import { mentorshipService } from '../../services/mentorshipService.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import ROUTES from '../../constants/routes.js';

export const MentorshipRequest = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mentorProfile, setMentorProfile] = useState(null);

  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchMentor = async () => {
      try {
        setLoading(true);
        const data = await alumniService.getAlumniById(mentorId);
        if (isMounted && data?.profile) {
          setMentorProfile(data.profile);
        }
      } catch (err) {
        toast.error('Failed to load mentor details');
        navigate(ROUTES.MENTORSHIP);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMentor();

    return () => {
      isMounted = false;
    };
  }, [mentorId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      toast.error('Topic is required');
      return;
    }

    if (!message.trim()) {
      toast.error('Message is required');
      return;
    }

    if (preferredDate) {
      const selected = new Date(preferredDate);
      if (selected <= new Date()) {
        toast.error('Preferred date must be in the future');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        mentorId,
        topic: topic.trim(),
        message: message.trim(),
        preferredDate: preferredDate || undefined,
      };

      await mentorshipService.createRequest(payload);
      toast.success('Mentorship request sent successfully!');
      navigate(ROUTES.STUDENT_MENTORSHIPS);
    } catch (err) {
      toast.error(err?.message || 'Failed to submit mentorship request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" message="Loading mentor details..." />
      </div>
    );
  }

  const mentorUser = mentorProfile?.user || {};

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-[#CBD5E1]">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#818CF8] transition-colors"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to Mentors
      </button>

      {/* Mentor Profile Preview Header */}
      <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm flex items-center gap-4">
        {mentorUser.profilePicture ? (
          <img
            src={mentorUser.profilePicture}
            alt={mentorUser.fullName || 'Mentor'}
            className="w-16 h-16 rounded-2xl object-cover border border-[#26334D]"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-[#202B40] text-[#818CF8] font-bold text-xl flex items-center justify-center border border-[#6366F1]/30">
            {mentorUser.fullName?.charAt(0) || 'M'}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold text-[#818CF8] uppercase tracking-wider block">
            Request Mentorship Session
          </span>
          <h2 className="text-lg font-bold text-[#F8FAFC] truncate">
            {mentorUser.fullName || 'Alumni Mentor'}
          </h2>
          <p className="text-xs text-[#94A3B8] truncate">
            {mentorProfile?.designation || 'Professional'} at{' '}
            <span className="font-semibold text-[#CBD5E1]">{mentorProfile?.company || 'Industry'}</span>
          </p>
        </div>
      </div>

      {/* Request Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#151E32] rounded-3xl p-6 sm:p-8 border border-[#26334D] shadow-soft-sm space-y-5"
      >
        <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
          <HiOutlineAcademicCap className="w-5 h-5 text-[#818CF8]" />
          Session Information
        </h3>

        <div>
          <Input
            label="Mentorship Topic"
            name="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. System Design Interview Prep, Resume Review, Career Path in AI"
            maxLength={150}
            required
            helperText="Provide a clear, specific subject for your mentorship discussion"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#CBD5E1] mb-1.5">
            Personal Note & Discussion Goals <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself, your current semester, and specific questions you would like help with during this session..."
            maxLength={1000}
            required
            className="w-full rounded-xl border border-[#334155] bg-[#202B40] px-4 py-2.5 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
          />
          <span className="text-[11px] text-[#94A3B8] block text-right mt-1">
            {message.length} / 1000 characters
          </span>
        </div>

        <div>
          <Input
            label="Preferred Date (Optional)"
            name="preferredDate"
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            icon={HiOutlineCalendar}
            min={new Date().toISOString().split('T')[0]}
            helperText="The mentor will confirm or schedule the exact meeting time."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#26334D]">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC] hover:bg-[#2A3752]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
          >
            Send Mentorship Request
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MentorshipRequest;
