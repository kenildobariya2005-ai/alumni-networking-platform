import React, { useEffect } from 'react';
import { HiX } from 'react-icons/hi';

/**
 * Reusable Modal Dialog Component with modern dark theme styling
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) => {
  // Prevent scrolling behind modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1120]/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          className={`w-full ${maxWidth} transform overflow-hidden rounded-3xl bg-[#151E32] border border-[#26334D] p-6 text-left align-middle shadow-2xl shadow-black/80 transition-all text-[#CBD5E1]`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#26334D] pb-4 mb-4">
            {title && (
              <h3 className="text-lg font-bold leading-6 text-[#F8FAFC] tracking-tight">
                {title}
              </h3>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-[#94A3B8] hover:bg-[#202B40] hover:text-[#F8FAFC] transition-colors focus:outline-none"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="py-2 text-[#CBD5E1]">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#26334D] pt-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
