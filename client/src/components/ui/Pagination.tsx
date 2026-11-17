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
  const current = Math.max(1, Number(currentPage) || 1);
  const total = Math.max(1, Number(totalPages) || 1);

  if (total <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    return pages;
  };

  return (
    <nav className={cn('flex items-center justify-center gap-1.5 py-6', className)} aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        type="button"
        disabled={current <= 1}
        onClick={() => onPageChange(current - 1)}
        className="h-9 px-2.5"
        aria-label="Previous page"
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
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                'h-9 min-w-9 px-2 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                p === current
                  ? 'bg-ink text-surface font-semibold shadow-xs'
                  : 'text-ink hover:bg-line/40 border border-transparent',
              )}
              aria-current={p === current ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        type="button"
        disabled={current >= total}
        onClick={() => onPageChange(current + 1)}
        className="h-9 px-2.5"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};

export default Pagination;
