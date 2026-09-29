import React from 'react';
import useAuth from '../../hooks/useAuth.js';

export const AlumniDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 text-[#CBD5E1]">
      <div className="bg-[#151E32] rounded-2xl p-6 border border-[#26334D] shadow-soft-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#F8FAFC]">
            Welcome, {user?.fullName || 'Alumni'}!
          </h1>
          {user?.isVerified && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-950/80 text-emerald-300 rounded-full border border-emerald-800/60">
              Verified Alumni
            </span>
          )}
        </div>
        <p className="text-sm text-[#94A3B8] mt-1">
          Alumni Mentorship & Hiring Workspace Foundation
        </p>
      </div>
    </div>
  );
};

export default AlumniDashboardPage;
