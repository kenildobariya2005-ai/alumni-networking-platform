import React from 'react';
import EmptyState from '../../components/common/EmptyState.jsx';
import { HiOutlineBriefcase } from 'react-icons/hi';

export const JobsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs & Internships</h1>
          <p className="text-sm text-slate-500">Explore career opportunities and internal referrals posted by alumni.</p>
        </div>
      </div>

      <EmptyState
        icon={HiOutlineBriefcase}
        title="Jobs & Internships Portal"
        description="Foundation routing is established. The full job catalog and search features will be implemented in the Jobs module."
      />
    </div>
  );
};

export default JobsPage;
