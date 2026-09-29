import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

/**
 * Reusable Pagination Component with dark theme styling
 */
export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  limit,
  isLoading = false,
  className = '',
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems === 0)) {
    return null;
  }

  const handlePrev = () => {
    if (currentPage > 1 && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers with ellipses for wide ranges
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const startItem = (currentPage - 1) * (limit || 10) + 1;
  const endItem = Math.min(currentPage * (limit || 10), totalItems || totalPages * (limit || 10));

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none text-[#CBD5E1] ${className}`}
    >
      {/* Items count summary */}
      {totalItems !== undefined && (
        <p className="text-xs text-[#94A3B8] order-2 sm:order-1 text-center sm:text-left">
          Showing <span className="font-semibold text-[#F8FAFC]">{totalItems === 0 ? 0 : startItem}</span> to{' '}
          <span className="font-semibold text-[#F8FAFC]">{endItem}</span> of{' '}
          <span className="font-semibold text-[#F8FAFC]">{totalItems}</span> results
        </p>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1 || isLoading}
          className="inline-flex items-center justify-center p-2 rounded-xl border border-[#334155] bg-[#202B40] text-[#CBD5E1] hover:bg-[#26334D] hover:text-[#F8FAFC] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm shadow-soft-sm"
          aria-label="Previous Page"
        >
          <HiChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1 text-xs font-medium">Prev</span>
        </button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-xs text-[#64748B] font-semibold"
                >
                  ...
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => onPageChange(page)}
                disabled={isLoading || isCurrent}
                className={`min-w-[32px] h-8 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-[#6366F1] text-white shadow-soft-md border border-[#6366F1]/50 font-bold'
                    : 'bg-[#202B40] border border-[#334155] text-[#CBD5E1] hover:bg-[#26334D] hover:text-[#F8FAFC] hover:border-[#6366F1]/40'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= totalPages || isLoading}
          className="inline-flex items-center justify-center p-2 rounded-xl border border-[#334155] bg-[#202B40] text-[#CBD5E1] hover:bg-[#26334D] hover:text-[#F8FAFC] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm shadow-soft-sm"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline mr-1 text-xs font-medium">Next</span>
          <HiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

