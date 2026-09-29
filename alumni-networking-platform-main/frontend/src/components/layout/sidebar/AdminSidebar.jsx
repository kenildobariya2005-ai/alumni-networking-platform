import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineShieldCheck,
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineSparkles,
  HiOutlineDocumentReport,
  HiOutlineBell,
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineX,
} from 'react-icons/hi';
import useAuth from '../../../hooks/useAuth.js';
import ROUTES from '../../../constants/routes.js';

export const AdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, icon: HiOutlineHome },
      ],
    },
    {
      title: 'User Management',
      items: [
        { name: 'Manage Students', path: `${ROUTES.ADMIN_USERS}?role=student`, icon: HiOutlineAcademicCap },
        { name: 'Manage Alumni', path: `${ROUTES.ADMIN_USERS}?role=alumni`, icon: HiOutlineUserGroup },
        { name: 'Alumni Verification', path: ROUTES.ADMIN_ALUMNI_VERIFICATION, icon: HiOutlineShieldCheck },
      ],
    },
    {
      title: 'Platform Management',
      items: [
        { name: 'Jobs & Internships', path: ROUTES.ADMIN_JOBS, icon: HiOutlineBriefcase },
        { name: 'Mentorship Management', path: ROUTES.ADMIN_MENTORSHIP, icon: HiOutlineAcademicCap },
        { name: 'Projects Management', path: ROUTES.ADMIN_PROJECTS, icon: HiOutlineSparkles },
        { name: 'Community Moderation', path: ROUTES.ADMIN_MODERATION, icon: HiOutlineDocumentReport },
      ],
    },
    {
      title: 'Communication',
      items: [
        { name: 'Notifications / Alerts', path: ROUTES.NOTIFICATIONS, icon: HiOutlineBell },
      ],
    },
    {
      title: 'Analytics',
      items: [
        { name: 'Reports & Analytics', path: ROUTES.ADMIN_REPORTS, icon: HiOutlineChartBar },
      ],
    },
    {
      title: 'System',
      items: [
        { name: 'Audit Logs', path: ROUTES.ADMIN_AUDIT_LOGS, icon: HiOutlineClipboardList },
        { name: 'Settings', path: ROUTES.ADMIN_SETTINGS, icon: HiOutlineCog },
      ],
    },
  ];

  const isItemActive = (itemPath) => {
    const [pathOnly, queryString] = itemPath.split('?');
    if (queryString) {
      return location.pathname === pathOnly && location.search.includes(queryString);
    }
    if (itemPath === ROUTES.ADMIN_DASHBOARD) {
      return location.pathname === ROUTES.ADMIN_DASHBOARD;
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Admin Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#111827] border-r border-[#334155] flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-black/90' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#334155] flex-shrink-0 bg-[#0B1120]">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#6366F1] flex items-center justify-center text-white font-bold shadow-soft-sm group-hover:scale-105 transition-transform">
              <HiOutlineShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-extrabold text-[#F8FAFC] tracking-tight block leading-tight">
                Alumni<span className="text-[#818CF8]">Connect</span>
              </span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
                ADMIN PANEL
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

        {/* System Status Pill */}
        <div className="px-4 py-2 bg-[#151E32]/80 border-b border-[#26334D] flex items-center justify-between text-[11px]">
          <span className="text-[#94A3B8] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Platform Control
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
            ROOT ADMIN
          </span>
        </div>

        {/* Navigation Section Hierarchy */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider">
                {group.title}
              </p>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.path);

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        active
                          ? 'bg-[#6366F1]/20 text-[#818CF8] font-bold border border-[#6366F1]/40 shadow-soft-sm'
                          : 'text-[#CBD5E1] hover:bg-[#151E32] hover:text-[#F8FAFC] hover:border-[#334155] border border-transparent'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          active ? 'text-[#818CF8]' : 'text-[#94A3B8]'
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Admin Footer & Logout */}
        <div className="p-3 border-t border-[#334155] bg-[#0B1120] flex-shrink-0">
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#151E32] border border-[#334155]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-950 text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-700/60 flex-shrink-0">
                <HiOutlineShieldCheck className="w-4 h-4 text-indigo-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#F8FAFC] truncate">
                  {user?.fullName || 'Administrator'}
                </p>
                <p className="text-[10px] text-emerald-400 font-semibold tracking-wide truncate">
                  Platform Admin
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              title="Logout from Admin Portal"
              aria-label="Logout"
            >
              <HiOutlineLogout className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
