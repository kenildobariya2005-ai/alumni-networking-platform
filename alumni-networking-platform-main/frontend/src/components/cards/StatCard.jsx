import React from 'react';

/**
 * Reusable Statistic Card Component with modern SaaS dark theme styling
 * @param {object} props
 * @param {string} props.title
 * @param {string|number} props.value
 * @param {React.ComponentType} [props.icon]
 * @param {string} [props.trend]
 * @param {string} [props.variant] 'primary' | 'success' | 'warning' | 'purple' | 'slate' | 'rose'
 * @param {string} [props.subtitle]
 * @param {boolean} [props.isLoading]
 */
export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'primary',
  subtitle,
  isLoading = false,
  onClick,
  className = '',
}) => {
  const variantStyles = {
    primary: {
      bg: 'bg-primary-950/70 text-primary-400 border border-primary-800/40 shadow-inner',
      border: 'hover:border-primary-500/60',
    },
    success: {
      bg: 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 shadow-inner',
      border: 'hover:border-emerald-500/60',
    },
    warning: {
      bg: 'bg-amber-950/70 text-amber-400 border border-amber-800/40 shadow-inner',
      border: 'hover:border-amber-500/60',
    },
    purple: {
      bg: 'bg-indigo-950/70 text-indigo-400 border border-indigo-800/40 shadow-inner',
      border: 'hover:border-indigo-500/60',
    },
    rose: {
      bg: 'bg-rose-950/70 text-rose-400 border border-rose-800/40 shadow-inner',
      border: 'hover:border-rose-500/60',
    },
    slate: {
      bg: 'bg-slate-800 text-slate-300 border border-slate-700 shadow-inner',
      border: 'hover:border-slate-500',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl bg-[#151E32] p-5 sm:p-6 border border-[#26334D] shadow-soft-sm transition-all duration-200 ${
        onClick ? `cursor-pointer ${currentVariant.border} hover:shadow-soft-md hover:bg-[#202B40]` : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            {title}
          </p>
          {isLoading ? (
            <div className="h-8 w-16 bg-[#202B40] animate-pulse rounded-md" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
                {value ?? 0}
              </span>
              {trend && (
                <span className="text-xs font-semibold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/50">
                  {trend}
                </span>
              )}
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-[#94A3B8] mt-1">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl ${currentVariant.bg} flex-shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
