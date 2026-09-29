import React from 'react';

/**
 * Reusable Button Component with customizable dark-theme variants, sizes, and loading state
 */
export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-[0.98]';

  const variants = {
    primary:
      'bg-primary-600 hover:bg-primary-500 text-white shadow-soft-sm hover:shadow-lg hover:shadow-primary-500/20 focus:ring-primary-500 border border-primary-500/30',
    secondary:
      'bg-secondary-600 hover:bg-secondary-500 text-white shadow-soft-sm hover:shadow-lg hover:shadow-secondary-500/20 focus:ring-secondary-500 border border-secondary-500/30',
    outline:
      'border border-slate-700 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 hover:text-white hover:border-slate-600 focus:ring-primary-500 shadow-soft-sm',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-soft-sm hover:shadow-lg hover:shadow-rose-500/20 focus:ring-rose-500 border border-rose-500/30',
    ghost:
      'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-slate-100 focus:ring-slate-700',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {!isLoading && Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
