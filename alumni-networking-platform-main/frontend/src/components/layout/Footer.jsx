import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import ROUTES from '../../constants/routes.js';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B0F19] border-t border-slate-800 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white text-xs shadow-soft-sm">
              <HiOutlineAcademicCap className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-sm tracking-tight">
              Alumni<span className="text-primary-400">Connect</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <Link to={ROUTES.JOBS} className="hover:text-white transition-colors">
              Jobs
            </Link>
            <Link to={ROUTES.MENTORSHIP} className="hover:text-white transition-colors">
              Mentorship
            </Link>
            <Link to={ROUTES.PROJECTS} className="hover:text-white transition-colors">
              Projects
            </Link>
            <Link to={ROUTES.COMMUNITY} className="hover:text-white transition-colors">
              Community
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-500">
            &copy; {currentYear} AlumniConnect. Secure Alumni & Career Networking Platform.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
