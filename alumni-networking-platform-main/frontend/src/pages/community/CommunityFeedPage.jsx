import React from 'react';
import EmptyState from '../../components/common/EmptyState.jsx';
import { HiOutlineUserGroup } from 'react-icons/hi';

export const CommunityFeedPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Community Feed</h1>
          <p className="text-sm text-slate-500">Share updates, ask questions, and engage with the university network.</p>
        </div>
      </div>

      <EmptyState
        icon={HiOutlineUserGroup}
        title="Community Knowledge Feed"
        description="Foundation routing is established. Posts, comments, and like feeds will be implemented in the Community module."
      />
    </div>
  );
};

export default CommunityFeedPage;
