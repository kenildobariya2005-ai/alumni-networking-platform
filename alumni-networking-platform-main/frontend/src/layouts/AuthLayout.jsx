import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { HiOutlineAcademicCap } from 'react-icons/hi';
import ROUTES from '../constants/routes.js';

/**
 * Authentication Layout for Login, Register, and password recovery in dark theme
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#0B1120] py-12 sm:px-6 lg:px-8 text-[#CBD5E1]">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-soft-sm group-hover:scale-105 transition-transform">
            <HiOutlineAcademicCap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            Alumni<span className="text-primary-400">Connect</span>
          </span>
        </Link>
      </div>

      {/* Main Auth Content Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#151E32] py-8 px-6 sm:px-10 shadow-2xl shadow-black/50 rounded-3xl border border-[#26334D]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
