import React from 'react';
import useAuth from '../../hooks/useAuth.js';

export const AdminDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 text-[#CBD5E1]">
      <div className="bg-[#151E32] rounded-2xl p-6 border border-[#26334D] shadow-soft-sm">
        <h1 className="text-xl font-bold text-[#F8FAFC]">
          Admin Control Center
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Logged in as {user?.fullName} ({user?.email})
        </p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
