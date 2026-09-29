import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineChatAlt2,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineX,
} from 'react-icons/hi';
import useAuth from '../../../hooks/useAuth.js';
import ROUTES from '../../../constants/routes.js';

export const StudentSidebar = ({ isOpen, onClose, onOpenAI }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: ROUTES.STUDENT_DASHBOARD, icon: HiOutlineHome },
    { name: 'Profile', path: ROUTES.STUDENT_PROFILE, icon: HiOutlineUser },
    { name: 'Jobs & Internships', path: ROUTES.JOBS, icon: HiOutlineBriefcase },
    { name: 'My Applications', path: ROUTES.STUDENT_APPLICATIONS, icon: HiOutlineDocumentText },
    { name: 'Find Mentors', path: ROUTES.MENTORSHIP, icon: HiOutlineAcademicCap },
    { name: 'My Mentorships', path: ROUTES.STUDENT_MENTORSHIPS, icon: HiOutlineCheckCircle },
    { name: 'Projects', path: ROUTES.PROJECTS, icon: HiOutlineSparkles },
    { name: 'Community', path: ROUTES.COMMUNITY, icon: HiOutlineUserGroup },
    { name: 'Messages', path: ROUTES.CHAT, icon: HiOutlineChatAlt2 },
    { name: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: HiOutlineBell },
    { name: 'AI Assistant', isAction: true, onClick: onOpenAI, icon: HiOutlineSparkles },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Student Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#111827] border-r border-[#26334D] flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#26334D] flex-shrink-0 bg-[#111827]">
          <Link to={ROUTES.STUDENT_DASHBOARD} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#6366F1] flex items-center justify-center text-white font-bold shadow-soft-sm group-hover:scale-105 transition-transform">
              <HiOutlineAcademicCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-[#F8FAFC] tracking-tight block leading-tight">
                Alumni<span className="text-[#818CF8]">Connect</span>
              </span>
              <span className="text-[10px] font-semibold text-indigo-400 tracking-wider block">
                STUDENT PORTAL
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-lg"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
          <p className="px-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
            Student Workspace
          </p>
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;

              if (item.isAction) {
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      if (onClose) onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-[#CBD5E1] hover:bg-[#151E32] hover:text-[#818CF8] border border-transparent hover:border-[#26334D]"
                  >
                    <Icon className="w-5 h-5 text-indigo-400 flex-shrink-0 animate-pulse" />
                    <span>{item.name}</span>
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                      AI
                    </span>
                  </button>
                );
              }

              const isActive =
                item.path === ROUTES.STUDENT_DASHBOARD
                  ? location.pathname === ROUTES.STUDENT_DASHBOARD
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#6366F1]/15 text-[#818CF8] font-semibold border border-[#6366F1]/30 shadow-soft-sm'
                      : 'text-[#CBD5E1] hover:bg-[#151E32] hover:text-[#F8FAFC] hover:border-[#26334D] border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? 'text-[#818CF8]' : 'text-[#94A3B8]'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        {user && (
          <div className="p-3 border-t border-[#26334D] bg-[#111827] flex-shrink-0">
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#151E32] border border-[#26334D] shadow-soft-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.fullName || 'Student'}
                    className="w-8 h-8 rounded-full object-cover border border-[#26334D]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#202B40] text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-500/30">
                    {user.fullName?.charAt(0) || 'S'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                    {user.fullName}
                  </p>
                  <p className="text-[10px] text-indigo-400 font-medium capitalize">
                    Student
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => logout()}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Logout"
                aria-label="Logout"
              >
                <HiOutlineLogout className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default StudentSidebar;
