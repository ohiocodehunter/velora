import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav className={cn('flex items-center justify-center gap-1.5 py-6', className)} aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-9 px-2.5"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-1">
        {getPageNumbers().map((p, idx) =>
          typeof p === 'string' ? (
            <span key={idx} className="px-2 text-xs text-muted">
              ...
            </span>
          ) : (
            <button
              key={idx}
              onClick={() => onPageChange(p)}
              className={cn(
                'h-9 min-w-9 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                p === currentPage
                  ? 'bg-ink text-surface'
                  : 'text-ink hover:bg-line/40 border border-transparent',
              )}
            >
              {p}
            </button>
          ),
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-9 px-2.5"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};

export default Pagination;
