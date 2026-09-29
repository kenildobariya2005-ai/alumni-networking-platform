import React from 'react';
import { HiOutlineFolderOpen } from 'react-icons/hi';

/**
 * Reusable Empty State Component for dark theme lists and feeds
 */
export const EmptyState = ({
  icon: Icon = HiOutlineFolderOpen,
  title = 'No data found',
  description = 'There are currently no items to display.',
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-[#151E32] border border-[#26334D] shadow-soft-sm ${className}`}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#202B40] text-[#818CF8] border border-[#6366F1]/30 mb-4 shadow-soft-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[#F8FAFC] mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-[#94A3B8] max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
