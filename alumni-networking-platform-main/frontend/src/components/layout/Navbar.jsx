import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineChatAlt2,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineSparkles,
} from 'react-icons/hi';
import useAuth from '../../hooks/useAuth.js';
import ROUTES from '../../constants/routes.js';
import Button from '../common/Button.jsx';
import { getInitials } from '../../utils/helpers.js';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Jobs', path: ROUTES.JOBS, icon: HiOutlineBriefcase },
    { name: 'Mentorship', path: ROUTES.MENTORSHIP, icon: HiOutlineAcademicCap },
    { name: 'Projects', path: ROUTES.PROJECTS, icon: HiOutlineSparkles },
    { name: 'Community', path: ROUTES.COMMUNITY, icon: HiOutlineUserGroup },
    ...(isAuthenticated ? [{ name: 'Messages', path: ROUTES.CHAT, icon: HiOutlineChatAlt2 }] : []),
  ];

  const getDashboardPath = () => {
    if (!user) return ROUTES.HOME;
    if (user.role === 'admin') return ROUTES.ADMIN_DASHBOARD;
    if (user.role === 'alumni') return ROUTES.ALUMNI_DASHBOARD;
    return ROUTES.STUDENT_DASHBOARD;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-soft-sm group-hover:scale-105 transition-transform">
              <HiOutlineAcademicCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Alumni<span className="text-primary-400">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-600/20 text-primary-300 font-semibold border border-primary-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/30 border border-slate-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-950/80 text-primary-300 font-bold flex items-center justify-center text-xs border border-primary-800/50">
                      {getInitials(user.fullName)}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white leading-tight">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to={ROUTES.STUDENT_LOGIN}>
                  <Button variant="ghost" size="sm" icon={HiOutlineAcademicCap} className="text-xs font-semibold">
                    Student Login
                  </Button>
                </Link>
                <Link to={ROUTES.ALUMNI_LOGIN}>
                  <Button variant="outline" size="sm" icon={HiOutlineUserGroup} className="text-xs font-semibold text-indigo-300 border-indigo-700/60 hover:bg-indigo-950/50">
                    Alumni Login
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm" className="text-xs font-semibold">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <HiOutlineX className="w-6 h-6" />
              ) : (
                <HiOutlineMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0B0F19] px-4 pt-2 pb-4 space-y-1 shadow-2xl">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <item.icon className="w-5 h-5 text-slate-400" />
              {item.name}
            </Link>
          ))}

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300"
                >
                  Dashboard ({user?.fullName})
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to={ROUTES.STUDENT_LOGIN} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" icon={HiOutlineAcademicCap} className="w-full text-xs font-semibold">
                    Student Login
                  </Button>
                </Link>
                <Link to={ROUTES.ALUMNI_LOGIN} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" icon={HiOutlineUserGroup} className="w-full text-xs font-semibold text-indigo-300 border-indigo-700/60">
                    Alumni Login
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full text-xs font-semibold">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
