import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const renderPageNumbers = (): JSX.Element[] => {
    const buttons: JSX.Element[] = [];

    const baseBtn = 'inline-flex items-center justify-center px-3 py-1 rounded-full text-4xl font-medium transition-transform';
    const inactive = 'bg-white border border-gray-200 text-black hover:shadow-md hover:-translate-y-0.5';
    const active = 'text-black  shadow-lg transform scale-105';

    // Prev
    buttons.push(
      <button
        key="prev"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${baseBtn} ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : inactive}`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    );

    // First page shortcut
    if (currentPage > 3) {
      buttons.push(
        <button key={1} onClick={() => onPageChange(1)} className={`${baseBtn} ${inactive}`}>
          1
        </button>
      );
      if (currentPage > 4) {
        buttons.push(
          <span key="dots-1" className="px-2 text-sm text-gray-400">…</span>
        );
      }
    }

    // Pages around current
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`${baseBtn} ${currentPage === i ? active : inactive}`}
          aria-current={currentPage === i ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    // Dots and last
    if (currentPage < totalPages - 3) {
      if (currentPage < totalPages - 4) {
        buttons.push(
          <span key="dots-2" className="px-2 text-sm text-gray-400">…</span>
        );
      }
      buttons.push(
        <button key={totalPages} onClick={() => onPageChange(totalPages)} className={`${baseBtn} ${inactive}`}>
          {totalPages}
        </button>
      );
    }

    // Next
    buttons.push(
      <button
        key="next"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${baseBtn} ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : inactive}`}
        aria-label="Next page"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    );

    return buttons;
  };

  return (
    <nav aria-label="Pagination" className="mt-6">
      <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-3 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          {renderPageNumbers()}
        </div>
      </div>
    </nav>
  );
};

export default Pagination;