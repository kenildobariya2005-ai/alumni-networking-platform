import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineShieldExclamation, HiOutlineArrowLeft, HiOutlineHome } from 'react-icons/hi';
import useAuth from '../hooks/useAuth.js';
import Button from '../components/common/Button.jsx';
import ROUTES, { getRoleRedirectPath } from '../constants/routes.js';

export const Unauthorized = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleDashboardRedirect = () => {
    if (isAuthenticated && user) {
      navigate(getRoleRedirectPath(user.role));
    } else {
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12 text-[#CBD5E1]">
      <div className="w-16 h-16 rounded-2xl bg-[#202B40] text-amber-400 border border-amber-500/30 flex items-center justify-center mb-5 shadow-soft-sm">
        <HiOutlineShieldExclamation className="w-10 h-10" />
      </div>

      <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800/60 mb-3">
        403 Forbidden
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] mb-2">
        Access Denied
      </h1>

      <p className="text-sm sm:text-base text-[#94A3B8] max-w-md mx-auto mb-8">
        You do not have permission to access this page. This area is restricted to specific user roles.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          icon={HiOutlineHome}
          onClick={handleDashboardRedirect}
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-soft-sm"
        >
          Go to Dashboard
        </Button>

        <Button
          variant="outline"
          icon={HiOutlineArrowLeft}
          onClick={() => navigate(-1)}
          className="bg-[#202B40] text-[#CBD5E1] border-[#334155] hover:border-[#6366F1] hover:text-[#F8FAFC]"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
