import React from 'react';
import EmptyState from '../../components/common/EmptyState.jsx';
import { HiOutlineSparkles } from 'react-icons/hi';

export const ProjectsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Collaboration</h1>
          <p className="text-sm text-slate-500">Collaborate with peers, recruit team members, and build portfolios.</p>
        </div>
      </div>

      <EmptyState
        icon={HiOutlineSparkles}
        title="Project Collaboration Portal"
        description="Foundation routing is established. Project recruiting and team management will be implemented in the Project module."
      />
    </div>
  );
};

export default ProjectsPage;
