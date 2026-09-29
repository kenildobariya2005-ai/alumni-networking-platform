import React from 'react';

/**
 * Reusable Loading Spinner Component
 */
export const Loader = ({
  size = 'md',
  fullScreen = false,
  message = '',
  className = '',
}) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizes[size] || sizes.md} border-[#26334D] border-t-[#6366F1] rounded-full animate-spin`}
      />
      {message && <p className="text-sm font-medium text-[#CBD5E1]">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1120]/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Loader;
