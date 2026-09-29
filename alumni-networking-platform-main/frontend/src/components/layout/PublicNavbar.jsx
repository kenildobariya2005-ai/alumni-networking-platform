import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import ROUTES from '../../constants/routes.js';
import Button from '../common/Button.jsx';

/**
 * Public Navigation Bar
 * Rendered exclusively on public views (e.g. Landing page "/", Unauthorized, 404).
 * Does NOT display private user session info, user roles, logout controls,
 * or authenticated application links.
 */
export const PublicNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0B1120]/95 backdrop-blur-md border-b border-[#26334D] text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Platform Branding */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#6366F1] rounded-xl p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#818CF8] flex items-center justify-center text-white shadow-soft-sm group-hover:scale-105 transition-transform">
              <HiOutlineAcademicCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-[#F8FAFC] tracking-tight">
              Alumni<span className="text-[#818CF8]">Connect</span>
            </span>
          </Link>

          {/* Desktop Public Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link to={ROUTES.STUDENT_LOGIN}>
              <Button
                variant="ghost"
                size="sm"
                icon={HiOutlineAcademicCap}
                className="text-xs font-semibold text-[#CBD5E1] hover:text-[#F8FAFC] hover:bg-[#151E32]"
              >
                Student Login
              </Button>
            </Link>

            <Link to={ROUTES.ALUMNI_LOGIN}>
              <Button
                variant="outline"
                size="sm"
                icon={HiOutlineUserGroup}
                className="text-xs font-semibold text-[#818CF8] border-[#26334D] bg-[#151E32] hover:border-[#6366F1] hover:text-white"
              >
                Alumni Login
              </Button>
            </Link>

            <Link to={ROUTES.REGISTER}>
              <Button
                variant="primary"
                size="sm"
                icon={HiOutlineArrowRight}
                className="text-xs font-semibold bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-[#94A3B8] hover:bg-[#151E32] hover:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
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

      {/* Mobile Drawer Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#26334D] bg-[#0B1120] px-4 pt-3 pb-5 space-y-3 shadow-2xl animate-fade-in">
          <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider px-1">
            Access Portals
          </p>

          <Link
            to={ROUTES.STUDENT_LOGIN}
            onClick={() => setIsMobileMenuOpen(false)}
            className="block"
          >
            <Button
              variant="outline"
              size="md"
              icon={HiOutlineAcademicCap}
              className="w-full text-xs font-semibold bg-[#151E32] text-[#CBD5E1] border-[#26334D] justify-start"
            >
              Student Portal Login
            </Button>
          </Link>

          <Link
            to={ROUTES.ALUMNI_LOGIN}
            onClick={() => setIsMobileMenuOpen(false)}
            className="block"
          >
            <Button
              variant="outline"
              size="md"
              icon={HiOutlineUserGroup}
              className="w-full text-xs font-semibold bg-[#151E32] text-[#818CF8] border-[#26334D] justify-start"
            >
              Alumni Portal Login
            </Button>
          </Link>

          <Link
            to={ROUTES.REGISTER}
            onClick={() => setIsMobileMenuOpen(false)}
            className="block pt-1"
          >
            <Button
              variant="primary"
              size="md"
              icon={HiOutlineArrowRight}
              className="w-full text-xs font-semibold bg-[#6366F1] hover:bg-[#4F46E5] text-white"
            >
              Create an Account
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
