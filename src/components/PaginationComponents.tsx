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

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`relative inline-flex items-center px-3 py-2 rounded-xl border-2 transition-all duration-300 
          ${currentPage === 1 
            ? 'border-gray-100 bg-gray-50 text-gray-300' 
            : 'border-gray-100 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900 hover:shadow-sm'
          }`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    );

    // First page
    if (currentPage > 3) {
      buttons.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium border-2 border-gray-100 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all duration-300 rounded-xl hover:shadow-sm"
        >
          1
        </button>
      );
    }

    // Dots after first page
    if (currentPage > 4) {
      buttons.push(
        <span key="dots-1" className="relative inline-flex items-center px-3 py-2 text-sm text-gray-400">
          •••
        </span>
      );
    }

    // Pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl
            ${currentPage === i
              ? 'z-10 border-2 border-gray-900 bg-gray-900 text-white shadow-md transform hover:scale-105'
              : 'border-2 border-gray-100 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900 hover:shadow-sm'
            }`}
        >
          {i}
        </button>
      );
    }

    // Dots before last page
    if (currentPage < totalPages - 3) {
      buttons.push(
        <span key="dots-2" className="relative inline-flex items-center px-3 py-2 text-sm text-gray-400">
          •••
        </span>
      );
    }

    // Last page
    if (currentPage < totalPages - 2) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium border-2 border-gray-100 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all duration-300 rounded-xl hover:shadow-sm"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`relative inline-flex items-center px-3 py-2 rounded-xl border-2 transition-all duration-300
          ${currentPage === totalPages 
            ? 'border-gray-100 bg-gray-50 text-gray-300' 
            : 'border-gray-100 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900 hover:shadow-sm'
          }`}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    );

    return buttons;
  };

  return (
    <nav aria-label="Pagination" className="mt-8">
      <div className="flex justify-center gap-1.5">
        {renderPageNumbers()}
      </div>
      <div className="mt-4 text-center text-sm font-medium text-gray-500">
        Страница <span className="text-gray-900">{currentPage}</span> из <span className="text-gray-900">{totalPages}</span>
      </div>
    </nav>
  );
};

export default Pagination;