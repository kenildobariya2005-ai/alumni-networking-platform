import React from 'react';

/**
 * Reusable Form Input Component with dark-theme styling, icon support, and error handling
 */
export const Input = ({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon: Icon,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs sm:text-sm font-medium text-[#CBD5E1] mb-1.5"
        >
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-soft-sm">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64748B]">
            <Icon className="h-5 w-5" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-xl border text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-[#151E32] disabled:text-[#64748B] disabled:cursor-not-allowed ${
            Icon ? 'pl-10' : 'pl-3.5'
          } pr-3.5 py-2.5 ${
            error
              ? 'border-rose-500/80 bg-[#202B40] text-rose-200 placeholder-rose-400/50 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-[#334155] bg-[#202B40] text-[#F8FAFC] placeholder-[#64748B] focus:border-[#6366F1] focus:ring-[#6366F1]/20 focus:bg-[#202B40]'
          } ${className}`}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>
      )}

      {!error && helperText && (
        <p className="mt-1 text-xs text-[#94A3B8]">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
