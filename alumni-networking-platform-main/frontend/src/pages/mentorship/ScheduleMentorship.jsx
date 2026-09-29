import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineVideoCamera,
  HiOutlineArrowLeft,
} from 'react-icons/hi';
import { mentorshipService } from '../../services/mentorshipService.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import ROUTES from '../../constants/routes.js';

export const ScheduleMentorship = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchSession = async () => {
      try {
        setLoading(true);
        const data = await mentorshipService.getMentorshipById(id);
        if (isMounted && data?.data) {
          const s = data.data;
          setSession(s);
          if (s.scheduledAt) {
            setScheduledAt(new Date(s.scheduledAt).toISOString().slice(0, 16));
          }
          if (s.meetingLink) {
            setMeetingLink(s.meetingLink);
          }
        }
      } catch (err) {
        toast.error('Failed to load mentorship session');
        navigate(ROUTES.ALUMNI_MENTORSHIPS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSession();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!scheduledAt) {
      toast.error('Please select meeting date and time');
      return;
    }

    if (new Date(scheduledAt) <= new Date()) {
      toast.error('Scheduled session must be in the future');
      return;
    }

    try {
      setSubmitting(true);
      await mentorshipService.scheduleMentorship(id, {
        scheduledAt,
        meetingLink: meetingLink.trim(),
      });

      toast.success('Session scheduled and link sent to student!');
      navigate(ROUTES.ALUMNI_MENTORSHIPS);
    } catch (err) {
      toast.error(err?.message || 'Failed to schedule mentorship');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" message="Loading session..." />
      </div>
    );
  }

  const student = session?.student || {};

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-[#CBD5E1]">
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
            Mentorship Scheduling
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Schedule Guidance Session
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Student: <span className="font-semibold text-[#CBD5E1]">{student.fullName}</span> &bull; Topic: "{session?.topic}"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#CBD5E1] mb-1.5">
              Meeting Date & Time <span className="text-rose-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              required
              className="w-full rounded-xl border border-[#334155] bg-[#202B40] px-4 py-2.5 text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
            />
          </div>

          <div>
            <Input
              label="Meeting URL (Google Meet / Zoom / Microsoft Teams)"
              name="meetingLink"
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              icon={HiOutlineVideoCamera}
              helperText="Paste the video conference invite URL where you will host this session"
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
              Confirm Schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMentorship;
