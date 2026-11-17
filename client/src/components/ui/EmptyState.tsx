import React from 'react';
import { cn } from '@/utils/cn';
import Button from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-line rounded-2xl bg-surface/50',
        className,
      )}
    >
      {icon && (
        <div className="h-14 w-14 rounded-2xl bg-canvas flex items-center justify-center text-muted mb-4 border border-line">
          {icon}
        </div>
      )}
      <h3 className="text-base font-normal text-ink">{title}</h3>
      {description && <p className="text-xs text-muted max-w-sm mt-1">{description}</p>}
      {actionLabel && onAction && (
        <Button size="sm" variant="outline" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
