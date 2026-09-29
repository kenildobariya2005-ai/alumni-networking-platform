import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineVideoCamera,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineStar,
  HiOutlineExternalLink,
} from 'react-icons/hi';
import { mentorshipService } from '../../services/mentorshipService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ROUTES from '../../constants/routes.js';

export const MyMentorships = () => {
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

  // Action states
  const [cancelSessionId, setCancelSessionId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [feedbackSession, setFeedbackSession] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchMentorships = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          status: statusFilter || undefined,
        };
        const data = await mentorshipService.getMyRequests(params);
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
        toast.error(err?.message || 'Failed to load mentorship requests');
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, pagination.limit]
  );

  useEffect(() => {
    fetchMentorships(1);
  }, [statusFilter]);

  const handleCancel = async () => {
    if (!cancelSessionId) return;
    try {
      setCancelling(true);
      await mentorshipService.cancelRequest(cancelSessionId);
      toast.success('Mentorship request cancelled');
      setCancelSessionId(null);
      fetchMentorships(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackSession) return;
    try {
      setSubmittingFeedback(true);
      await mentorshipService.submitFeedback(feedbackSession._id, {
        rating,
        feedback: feedbackText.trim(),
      });
      toast.success('Thank you for your feedback!');
      setFeedbackSession(null);
      setFeedbackText('');
      setRating(5);
      fetchMentorships(pagination.page);
    } catch (err) {
      toast.error(err?.message || 'Failed to submit review');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60">
            <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
            <HiOutlineClock className="w-3.5 h-3.5" /> Pending Response
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/60">
            <HiOutlineXCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#202B40] text-[#94A3B8] border border-[#334155]">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#202B40] text-[#CBD5E1] border border-[#334155]">
            {status}
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
            Mentorship Tracking
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1">
            My Mentorship Sessions
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            View your mentorship history, attend scheduled video sessions, and submit reviews.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(ROUTES.MENTORSHIP)}
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
        >
          Find Mentors
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['', 'pending', 'accepted', 'completed', 'rejected', 'cancelled'].map((st) => (
          <button
            key={st || 'all'}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              statusFilter === st
                ? 'bg-[#6366F1] text-white shadow-soft-sm font-bold'
                : 'bg-[#151E32] border border-[#26334D] text-[#94A3B8] hover:bg-[#202B40] hover:text-[#F8FAFC]'
            }`}
          >
            {st || 'All Sessions'}
          </button>
        ))}
      </div>

      {/* Mentorship Grid */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading your mentorships..." />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={HiOutlineAcademicCap}
          title="No mentorship requests found"
          description="You haven't requested any mentorship sessions in this category."
          action={
            <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.MENTORSHIP)} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white">
              Explore Alumni Mentors
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {requests.map((req) => {
              const mentor = req.mentor || {};
              return (
                <div
                  key={req._id}
                  className="bg-[#151E32] rounded-3xl p-5 sm:p-6 border border-[#26334D] shadow-soft-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header: Mentor Info & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {mentor.profilePicture ? (
                          <img
                            src={mentor.profilePicture}
                            alt={mentor.fullName || 'Mentor'}
                            className="w-11 h-11 rounded-2xl object-cover border border-[#26334D] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-[#202B40] text-[#818CF8] font-bold text-base flex items-center justify-center flex-shrink-0 border border-[#6366F1]/30">
                            {mentor.fullName?.charAt(0) || 'M'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#F8FAFC] truncate">
                            {mentor.fullName || 'Alumni Mentor'}
                          </h3>
                          <p className="text-xs text-[#94A3B8] truncate">
                            {mentor.email}
                          </p>
                        </div>
                      </div>

                      {getStatusBadge(req.status)}
                    </div>

                    {/* Topic & Message */}
                    <div className="p-3.5 rounded-2xl bg-[#202B40] border border-[#26334D] space-y-1">
                      <p className="text-xs font-bold text-[#F8FAFC]">
                        Topic: {req.topic}
                      </p>
                      <p className="text-xs text-[#CBD5E1] line-clamp-3">
                        {req.message}
                      </p>
                    </div>

                    {/* Scheduled Time or Meeting Link */}
                    {req.scheduledAt && (
                      <div className="flex items-center gap-2 text-xs font-medium text-indigo-300 bg-indigo-950/50 p-2.5 rounded-xl border border-indigo-800/50">
                        <HiOutlineCalendar className="w-4 h-4 text-indigo-400" />
                        <span>Scheduled: {new Date(req.scheduledAt).toLocaleString()}</span>
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
                          Join Call <HiOutlineExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Submitted Feedback display */}
                    {req.rating && (
                      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 space-y-1">
                        <div className="flex items-center gap-1 font-bold text-amber-200">
                          <span className="text-amber-400">★</span> Rated {req.rating} / 5
                        </div>
                        {req.feedback && <p className="italic text-[#CBD5E1]">"{req.feedback}"</p>}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-[#26334D] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#94A3B8]">
                      Requested: {new Date(req.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {req.status === 'pending' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setCancelSessionId(req._id)}
                        >
                          Cancel Request
                        </Button>
                      )}

                      {req.status === 'completed' && !req.rating && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={HiOutlineStar}
                          onClick={() => setFeedbackSession(req)}
                          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                        >
                          Submit Feedback
                        </Button>
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
            onPageChange={(p) => fetchMentorships(p)}
          />
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelSessionId}
        onClose={() => setCancelSessionId(null)}
        title="Cancel Mentorship Request"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            Are you sure you want to cancel this pending mentorship request? The mentor will be notified.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelSessionId(null)}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
            >
              Keep Request
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={cancelling}
              onClick={handleCancel}
            >
              Cancel Mentorship
            </Button>
          </div>
        </div>
      </Modal>

      {/* Feedback Submission Modal */}
      <Modal
        isOpen={!!feedbackSession}
        onClose={() => setFeedbackSession(null)}
        title="Submit Mentorship Review"
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <p className="text-xs text-[#CBD5E1]">
            How was your session with{' '}
            <strong className="text-[#F8FAFC]">{feedbackSession?.mentor?.fullName}</strong> regarding{' '}
            <strong className="text-[#F8FAFC]">{feedbackSession?.topic}</strong>?
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-transform hover:scale-125 focus:outline-none ${
                    star <= rating ? 'text-amber-400' : 'text-slate-700'
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="text-xs font-bold text-[#CBD5E1] ml-2">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#CBD5E1] mb-1">
              Feedback / Testimonial
            </label>
            <textarea
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share what insights were helpful during your session..."
              className="w-full rounded-xl border border-[#334155] bg-[#202B40] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setFeedbackSession(null)}
              className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={submittingFeedback}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
            >
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyMentorships;

