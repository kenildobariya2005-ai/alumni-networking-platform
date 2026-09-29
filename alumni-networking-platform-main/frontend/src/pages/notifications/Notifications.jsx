import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineBell,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineSparkles,
  HiOutlineChatAlt2,
  HiOutlineUserGroup,
  HiOutlineInformationCircle,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth.js';
import useSocket from '../../hooks/useSocket.js';
import { notificationService } from '../../services/notificationService.js';
import Pagination from '../../components/common/Pagination.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export const Notifications = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [isReadFilter, setIsReadFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
  });

  const fetchNotifications = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          type: filterType || undefined,
          isRead: isReadFilter !== '' ? isReadFilter : undefined,
        };

        const data = await notificationService.getNotifications(params);
        if (data?.data) {
          setNotifications(data.data.notifications || []);
          setUnreadCount(data.data.unreadCount || 0);
          setPagination((prev) => ({
            ...prev,
            page: data.data.pagination?.page || page,
            pages: data.data.pagination?.totalPages || 1,
            total: data.data.pagination?.totalNotifications || 0,
          }));
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    },
    [filterType, isReadFilter, pagination.limit]
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [filterType, isReadFilter]);

  // Listen for real-time notifications on active socket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotif = (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', handleNewNotif);

    return () => {
      socket.off('notification:new', handleNewNotif);
    };
  }, [socket]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    const norm = String(type).toLowerCase();
    if (norm.includes('mentor')) return <HiOutlineAcademicCap className="w-5 h-5 text-indigo-400" />;
    if (norm.includes('job') || norm.includes('application')) return <HiOutlineBriefcase className="w-5 h-5 text-emerald-400" />;
    if (norm.includes('project')) return <HiOutlineSparkles className="w-5 h-5 text-[#818CF8]" />;
    if (norm.includes('message')) return <HiOutlineChatAlt2 className="w-5 h-5 text-sky-400" />;
    if (norm.includes('post') || norm.includes('comment') || norm.includes('social')) return <HiOutlineUserGroup className="w-5 h-5 text-amber-400" />;
    return <HiOutlineInformationCircle className="w-5 h-5 text-[#94A3B8]" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in text-[#CBD5E1]">
      {/* Header Banner */}
      <div className="bg-[#151E32] rounded-2xl p-6 border border-[#26334D] shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider">
            Activity Alerts
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] mt-1 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6366F1] text-white shadow-sm">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Stay updated with mentorship requests, application responses, messages, and community engagement.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={HiOutlineCheck}
            onClick={handleMarkAllAsRead}
          >
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#151E32] rounded-2xl p-4 border border-[#26334D] shadow-soft-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {['', 'mentorship', 'job', 'application', 'project', 'message', 'Social', 'system'].map((type) => (
            <button
              key={type || 'all'}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all duration-150 ${
                filterType === type
                  ? 'bg-[#6366F1] text-white shadow-soft-sm font-bold'
                  : 'bg-[#202B40] text-[#CBD5E1] hover:bg-[#26334D] hover:text-[#F8FAFC] border border-[#334155]'
              }`}
            >
              {type || 'All Types'}
            </button>
          ))}
        </div>

        <select
          value={isReadFilter}
          onChange={(e) => setIsReadFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-[#334155] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 text-[#F8FAFC] bg-[#202B40]"
        >
          <option value="">All Statuses</option>
          <option value="false">Unread Only</option>
          <option value="true">Read Only</option>
        </select>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader size="lg" message="Loading notifications..." />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={HiOutlineBell}
          title="No notifications"
          description="You don't have any notifications matching this filter."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 flex items-start justify-between gap-4 ${
                notif.isRead
                  ? 'bg-[#151E32] border-[#26334D]'
                  : 'bg-[#6366F1]/10 border-[#6366F1]/30'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="p-2.5 rounded-xl bg-[#202B40] border border-[#26334D] shadow-soft-sm flex-shrink-0">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#6366F1] ring-2 ring-[#151E32] flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {notif.message}
                  </p>

                  <p className="text-[10px] text-[#94A3B8] font-medium pt-0.5">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions: Mark read & delete */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!notif.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#6366F1] hover:bg-[#6366F1]/10 transition-colors"
                    title="Mark as read"
                  >
                    <HiOutlineCheck className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteNotification(notif._id)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  title="Delete notification"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="pt-2">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              limit={pagination.limit}
              onPageChange={(p) => fetchNotifications(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
