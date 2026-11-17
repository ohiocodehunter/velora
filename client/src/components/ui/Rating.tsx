import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (val: number) => void;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  count,
  size = 'md',
  interactive = false,
  onChange,
  className,
}) => {
  const [hoverVal, setHoverVal] = React.useState<number | null>(null);

  const starSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const current = hoverVal !== null ? hoverVal : Math.round(value);

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            onMouseEnter={() => interactive && setHoverVal(star)}
            onMouseLeave={() => interactive && setHoverVal(null)}
            className={cn(
              'transition-transform',
              interactive ? 'cursor-pointer hover:scale-110 p-0.5' : 'cursor-default pointer-events-none',
            )}
            aria-label={`${star} star`}
          >
            <Star
              className={cn(
                starSizes[size],
                star <= current
                  ? 'fill-[#b89b72] text-[#b89b72]'
                  : 'fill-transparent text-[#d9d4ca]',
              )}
            />
          </button>
        ))}
      </div>
      {typeof count === 'number' && (
        <span className="text-xs text-muted">({count})</span>
      )}
    </div>
  );
};

export default Rating;
