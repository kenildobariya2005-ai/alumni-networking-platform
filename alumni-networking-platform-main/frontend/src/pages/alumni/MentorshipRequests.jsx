import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineVideoCamera,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineChatAlt2,
  HiOutlineExternalLink,
} from 'react-icons/hi';
import { mentorshipService } from '../../services/mentorshipService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ROUTES from '../../constants/routes.js';

export const MentorshipRequests = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 8,
  });

  // Schedule Session Modal
  const [schedulingSession, setSchedulingSession] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    scheduledAt: '',
    meetingLink: '',
  });
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  const fetchMentorshipRequests = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          status: statusFilter || undefined,
        };
        const data = await mentorshipService.getIncomingRequests(params);
        if (data) {
          setRequests(data.data || []);
          setPagination((prev) => ({
            ...prev,
            page: data.page || page,
            pages: data.pages || 1,
            total: data.total || 0,
          }));
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to fetch mentorship requests');
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, pagination.limit]
  );

  useEffect(() => {
    fetchMentorshipRequests(1);
  }, [statusFilter]);

  const handleAccept = async (id) => {
    try {
      await mentorshipService.acceptRequest(id);
      toast.success('Mentorship request accepted!');
      fetchMentorshipRequests(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (id) => {
    try {
      await mentorshipService.rejectRequest(id);
      toast.success('Mentorship request rejected');
      fetchMentorshipRequests(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to reject request');
    }
  };

  const handleComplete = async (id) => {
    try {
      await mentorshipService.completeMentorship(id);
      toast.success('Mentorship session marked as completed!');
      fetchMentorshipRequests(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to complete session');
    }
  };

  const handleOpenSchedule = (req) => {
    setSchedulingSession(req);
    setScheduleData({
      scheduledAt: req.scheduledAt
        ? new Date(req.scheduledAt).toISOString().slice(0, 16)
        : '',
      meetingLink: req.meetingLink || '',
    });
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!schedulingSession) return;

    if (!scheduleData.scheduledAt) {
      toast.error('Please select meeting date and time');
      return;
    }

    if (new Date(scheduleData.scheduledAt) <= new Date()) {
      toast.error('Scheduled session must be in the future');
      return;
    }

    try {
      setSubmittingSchedule(true);
      await mentorshipService.scheduleMentorship(schedulingSession._id, {
        scheduledAt: scheduleData.scheduledAt,
        meetingLink: scheduleData.meetingLink.trim(),
      });
      toast.success('Session scheduled and meeting link sent to student!');
      setSchedulingSession(null);
      fetchMentorshipRequests(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to schedule session');
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
            <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/70 text-blue-300 border border-blue-800/60">
            <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-800/60 capitalize">
            <HiOutlineXCircle className="w-3.5 h-3.5" /> {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/50 text-amber-300 border border-amber-800/60">
            <HiOutlineClock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="bg-[#151E32] rounded-3xl p-6 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Mentorship Guidance
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            Incoming Mentorship Requests
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Accept guidance requests from students, schedule video sessions, and foster the next generation of engineers.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] text-[#F8FAFC] bg-[#202B40]"
        >
          <option value="">All Mentorship Stages</option>
          <option value="pending">Pending Requests</option>
          <option value="accepted">Accepted / Scheduled</option>
          <option value="completed">Completed Sessions</option>
          <option value="rejected">Declined</option>
        </select>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading mentorship requests..." />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={HiOutlineAcademicCap}
          title="No mentorship requests"
          description="You have no mentorship requests in this status category."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {requests.map((req) => {
              const student = req.student || {};

              return (
                <div
                  key={req._id}
                  className="bg-[#151E32] rounded-3xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {student.profilePicture ? (
                          <img
                            src={student.profilePicture}
                            alt={student.fullName || 'Student'}
                            className="w-11 h-11 rounded-2xl object-cover border border-[#26334D] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-[#202B40] text-[#818CF8] font-bold text-base flex items-center justify-center flex-shrink-0 border border-[#6366F1]/30">
                            {student.fullName?.charAt(0) || 'S'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#F8FAFC] truncate">
                            {student.fullName || 'Student'}
                          </h3>
                          <p className="text-xs text-[#94A3B8] truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>

                      {getStatusBadge(req.status)}
                    </div>

                    {/* Topic & Note */}
                    <div className="p-3.5 rounded-2xl bg-[#202B40] border border-[#26334D] space-y-1">
                      <p className="text-xs font-bold text-[#F8FAFC]">
                        Topic: {req.topic}
                      </p>
                      <p className="text-xs text-[#CBD5E1] line-clamp-3">
                        {req.message}
                      </p>
                    </div>

                    {/* Preferred Date by Student */}
                    {req.preferredDate && (
                      <p className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                        <HiOutlineCalendar className="w-4 h-4 text-[#64748B]" />
                        Preferred Date: {new Date(req.preferredDate).toLocaleDateString()}
                      </p>
                    )}

                    {/* Scheduled Meeting Info */}
                    {req.scheduledAt && (
                      <div className="flex items-center gap-2 text-xs font-medium text-indigo-300 bg-indigo-950/50 p-2.5 rounded-xl border border-indigo-800/50">
                        <HiOutlineCalendar className="w-4 h-4 text-indigo-400" />
                        <span>Scheduled For: {new Date(req.scheduledAt).toLocaleString()}</span>
                      </div>
                    )}

                    {req.meetingLink && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                        <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                          <HiOutlineVideoCamera className="w-4 h-4 text-emerald-400" />
                          Meeting Link
                        </span>
                        <a
                          href={
                            req.meetingLink.startsWith('http')
                              ? req.meetingLink
                              : `https://${req.meetingLink}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-soft-sm"
                        >
                          Launch Call <HiOutlineExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Student Feedback (if completed) */}
                    {req.rating && (
                      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 space-y-0.5">
                        <span className="font-bold text-amber-200">Student Rating: ★ {req.rating} / 5</span>
                        {req.feedback && <p className="italic text-[#CBD5E1]">"{req.feedback}"</p>}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-[#26334D] flex flex-wrap items-center justify-between gap-2">
                    {student._id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={HiOutlineChatAlt2}
                        onClick={() => navigate(`/chat/${student._id}`)}
                        className="text-xs py-1 text-[#818CF8] hover:bg-[#202B40]"
                      >
                        Message Student
                      </Button>
                    )}

                    <div className="flex items-center gap-2">
                      {req.status === 'pending' && (
                        <>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(req._id)}
                          >
                            Decline
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAccept(req._id)}
                            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                          >
                            Accept
                          </Button>
                        </>
                      )}

                      {req.status === 'accepted' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={HiOutlineCalendar}
                            onClick={() => handleOpenSchedule(req)}
                            className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
                          >
                            {req.scheduledAt ? 'Reschedule' : 'Set Time & Link'}
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleComplete(req._id)}
                            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                          >
                            Complete Session
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => fetchMentorshipRequests(p)}
          />
        </div>
      )}

      {/* Schedule Session Modal */}
      <Modal
        isOpen={!!schedulingSession}
        onClose={() => setSchedulingSession(null)}
        title="Schedule Mentorship Session"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <p className="text-xs text-[#CBD5E1]">
            Set the date, time, and video meeting room for{' '}
            <span className="font-bold text-[#F8FAFC]">
              {schedulingSession?.student?.fullName || 'Student'}
            </span>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
              Meeting Date & Time <span className="text-rose-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={scheduleData.scheduledAt}
              onChange={(e) =>
                setScheduleData({ ...scheduleData, scheduledAt: e.target.value })
              }
              min={new Date().toISOString().slice(0, 16)}
              required
              className="w-full rounded-xl border border-[#334155] bg-[#202B40] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
              Meeting Link (Google Meet, Zoom, MS Teams, etc.)
            </label>
            <input
              type="text"
              value={scheduleData.meetingLink}
              onChange={(e) =>
                setScheduleData({ ...scheduleData, meetingLink: e.target.value })
              }
              placeholder="https://meet.google.com/xyz-abc-def"
              className="w-full rounded-xl border border-[#334155] bg-[#202B40] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSchedulingSession(null)}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submittingSchedule}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
            >
              Confirm Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MentorshipRequests;

