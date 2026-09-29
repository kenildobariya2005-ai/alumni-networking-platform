import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HiOutlineMenu,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineUser,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth.js';
import useSocket from '../../hooks/useSocket.js';
import { notificationService } from '../../services/notificationService.js';
import Button from '../common/Button.jsx';
import ROUTES from '../../constants/routes.js';

export const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Determine dynamic title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === ROUTES.STUDENT_DASHBOARD) return 'Student Dashboard';
    if (path === ROUTES.ALUMNI_DASHBOARD) return 'Alumni Dashboard';
    if (path === ROUTES.ADMIN_DASHBOARD) return 'Admin Control Center';
    if (path.startsWith('/student/profile') || path.startsWith('/alumni/profile') || path.startsWith('/profile')) return 'My Profile';
    if (path.startsWith('/student/applications')) return 'My Job Applications';
    if (path.startsWith('/student/mentorships')) return 'My Mentorships';
    if (path.startsWith('/alumni/jobs')) return 'My Posted Jobs';
    if (path.startsWith('/alumni/applications')) return 'Job Applicant Management';
    if (path.startsWith('/alumni/mentorships')) return 'Mentorship Requests';
    if (path.startsWith('/alumni/projects')) return 'My Created Projects';
    if (path.startsWith('/jobs/create')) return 'Post a New Job';
    if (path.startsWith('/jobs')) return 'Jobs & Internships';
    if (path.startsWith('/mentorship/schedule')) return 'Schedule Mentorship';
    if (path.startsWith('/mentorship/request')) return 'Request Mentorship';
    if (path.startsWith('/mentorship')) return 'Find Alumni Mentors';
    if (path.startsWith('/projects/create')) return 'Create New Project';
    if (path.startsWith('/projects')) return 'Project Collaboration';
    if (path.startsWith('/community/create')) return 'Create Community Post';
    if (path.startsWith('/community')) return 'Community Feed';
    if (path.startsWith('/chat')) return 'Direct Messages';
    if (path.startsWith('/notifications')) return 'Notifications';
    if (path.startsWith('/admin/reports')) return 'Platform Reports & Analytics';
    if (path.startsWith('/admin/settings')) return 'Platform System Settings';
    if (path.startsWith('/admin/users')) return 'User Account Management';
    if (path.startsWith('/admin/alumni-verification')) return 'Alumni Verification Portal';
    if (path.startsWith('/admin/jobs')) return 'Platform Job Management';
    if (path.startsWith('/admin/projects')) return 'Platform Project Management';
    if (path.startsWith('/admin/moderation')) return 'Content Moderation';
    if (path.startsWith('/admin/mentorship')) return 'Mentorship Oversight';
    if (path.startsWith('/admin/audit-logs')) return 'Platform Audit Trail';
    if (path.startsWith('/alumni/network')) return 'Alumni Professional Network';
    if (path.startsWith('/alumni/settings')) return 'Alumni Account Settings';
    if (path.startsWith('/alumni/messages')) return 'Direct Messages';
    if (path.startsWith('/alumni/notifications')) return 'Alumni Notifications';
    if (path.startsWith('/alumni/community')) return 'Community Feed';
    return 'AlumniConnect';
  };

  // Fetch initial unread notifications count
  useEffect(() => {
    let isMounted = true;

    const fetchUnread = async () => {
      try {
        const data = await notificationService.getUnreadNotifications();
        if (isMounted && data?.data) {
          setUnreadCount(data.data.unreadCount || 0);
        }
      } catch (err) {
        // silent fail on topbar
      }
    };

    fetchUnread();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  // Listen for real-time new notifications via Socket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket]);

  const userRole = (user?.role || '').toLowerCase().trim();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B1120]/95 backdrop-blur-md border-b border-[#26334D] px-4 sm:px-6 flex items-center justify-between text-[#F8FAFC]">
      {/* Left controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 rounded-xl text-[#94A3B8] hover:bg-[#151E32] hover:text-[#F8FAFC] md:hidden focus:outline-none"
          aria-label="Open Sidebar"
        >
          <HiOutlineMenu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#F8FAFC] tracking-tight flex items-center gap-2">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right controls - Role Specific Navigation Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Icon */}
        <Link
          to={ROUTES.NOTIFICATIONS}
          className="relative p-2 rounded-xl text-[#94A3B8] hover:bg-[#151E32] hover:text-[#F8FAFC] transition-colors focus:outline-none"
          title="Notifications"
          aria-label="Notifications"
        >
          <HiOutlineBell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#6366F1] rounded-full ring-2 ring-[#0B1120] animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {/* ADMIN TOPBAR DISPLAY */}
        {userRole === 'admin' && (
          <div className="hidden sm:flex items-center gap-2 bg-[#151E32] px-3 py-1.5 rounded-xl border border-[#334155]">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <div className="text-right">
              <span className="block text-xs font-extrabold text-[#F8FAFC]">Admin</span>
              <span className="block text-[10px] font-semibold text-[#818CF8]">Administrator / Platform Admin</span>
            </div>
          </div>
        )}

        {/* ALUMNI TOPBAR DISPLAY */}
        {userRole === 'alumni' && (
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="text-right">
              <span className="block text-xs font-bold text-[#F8FAFC] truncate max-w-[140px]">
                {user?.fullName || 'Alumni Member'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                Alumni Role {user?.isVerified && '• Verified'}
              </span>
            </div>

            {/* Alumni Profile Button */}
            <button
              type="button"
              onClick={() => navigate(ROUTES.ALUMNI_PROFILE)}
              className="flex items-center p-0.5 rounded-full ring-2 ring-emerald-500/30 hover:ring-emerald-500/70 transition-all"
              title="My Alumni Profile"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName || 'Alumni'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#151E32] text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/40">
                  {user?.fullName?.charAt(0) || <HiOutlineUser className="w-4 h-4" />}
                </div>
              )}
            </button>
          </div>
        )}

        {/* STUDENT TOPBAR DISPLAY */}
        {userRole === 'student' && (
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="text-right">
              <span className="block text-xs font-bold text-[#F8FAFC] truncate max-w-[140px]">
                {user?.fullName || 'Student'}
              </span>
              <span className="block text-[10px] font-semibold text-indigo-400">
                Student Role
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate(ROUTES.STUDENT_PROFILE)}
              className="flex items-center p-0.5 rounded-full ring-2 ring-indigo-500/30 hover:ring-indigo-500/70 transition-all"
              title="My Student Profile"
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName || 'Student'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#151E32] text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-500/40">
                  {user?.fullName?.charAt(0) || <HiOutlineUser className="w-4 h-4" />}
                </div>
              )}
            </button>
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          icon={HiOutlineLogout}
          onClick={() => logout()}
          className="text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40"
        >
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
