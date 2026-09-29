import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineChatAlt2,
  HiOutlineBell,
  HiOutlineBadgeCheck,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineX,
} from 'react-icons/hi';
import useAuth from '../../../hooks/useAuth.js';
import ROUTES from '../../../constants/routes.js';

export const AlumniSidebar = ({ isOpen, onClose, onOpenAI }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: ROUTES.ALUMNI_DASHBOARD, icon: HiOutlineHome },
    { name: 'My Profile', path: ROUTES.ALUMNI_PROFILE, icon: HiOutlineUser },
    { name: 'Alumni Network', path: ROUTES.ALUMNI_NETWORK, icon: HiOutlineUserGroup },
    { name: 'Jobs & Internships', path: ROUTES.ALUMNI_JOBS, icon: HiOutlineBriefcase },
    { name: 'Mentorship', path: ROUTES.ALUMNI_MENTORSHIPS, icon: HiOutlineAcademicCap },
    { name: 'Projects', path: ROUTES.ALUMNI_PROJECTS, icon: HiOutlineSparkles },
    { name: 'Messages', path: ROUTES.CHAT, icon: HiOutlineChatAlt2 },
    { name: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: HiOutlineBell },
    { name: 'Community', path: ROUTES.COMMUNITY, icon: HiOutlineUserGroup },
    { name: 'AI Assistant', isAction: true, onClick: onOpenAI, icon: HiOutlineSparkles },
    { name: 'Settings', path: ROUTES.ALUMNI_SETTINGS, icon: HiOutlineCog },
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

      {/* Alumni Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#111827] border-r border-[#26334D] flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#26334D] flex-shrink-0 bg-[#111827]">
          <Link to={ROUTES.ALUMNI_DASHBOARD} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-soft-sm group-hover:scale-105 transition-transform">
              <HiOutlineAcademicCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-[#F8FAFC] tracking-tight block leading-tight">
                Alumni<span className="text-[#818CF8]">Connect</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 tracking-wider block">
                ALUMNI PORTAL
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

        {/* User Quick Status Banner */}
        <div className="px-4 py-2 bg-[#151E32]/60 border-b border-[#26334D] flex items-center justify-between text-xs">
          <span className="text-[#94A3B8] text-[11px] truncate">
            {user?.isVerified ? 'Verified Mentor' : 'Community Member'}
          </span>
          {user?.isVerified ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
              <HiOutlineBadgeCheck className="w-3 h-3 text-emerald-400" /> Verified
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/60">
              Pending
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 custom-scrollbar">
          <p className="px-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
            Alumni Workspace
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
                item.path === ROUTES.ALUMNI_DASHBOARD
                  ? location.pathname === ROUTES.ALUMNI_DASHBOARD
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

        {/* Alumni User Profile Card & Logout Footer */}
        {user && (
          <div className="p-3 border-t border-[#26334D] bg-[#111827] flex-shrink-0">
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#151E32] border border-[#26334D] shadow-soft-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.fullName || 'Alumni'}
                    className="w-8 h-8 rounded-full object-cover border border-[#26334D]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#202B40] text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/30">
                    {user.fullName?.charAt(0) || 'A'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                    {user.fullName}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-medium capitalize">
                    Alumni Member
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

export default AlumniSidebar;
