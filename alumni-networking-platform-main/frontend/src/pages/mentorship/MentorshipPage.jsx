import React from 'react';
import EmptyState from '../../components/common/EmptyState.jsx';
import { HiOutlineAcademicCap } from 'react-icons/hi';

export const MentorshipPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Mentorship Network</h1>
          <p className="text-sm text-[#94A3B8]">Book sessions with industry mentors and request career guidance.</p>
        </div>
      </div>

      <EmptyState
        icon={HiOutlineAcademicCap}
        title="Alumni Mentorship Network"
        description="Foundation routing is established. Mentor directory and booking flows will be implemented in the Mentorship module."
      />
    </div>
  );
};

export default MentorshipPage;
