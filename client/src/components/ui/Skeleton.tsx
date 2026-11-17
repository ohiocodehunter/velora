import React from 'react';
import { cn } from '@/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rect',
  ...props
}) => {
  const variants = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded-md h-4 w-full',
  };

  return (
    <div
      className={cn('animate-pulse bg-line/80', variants[variant], className)}
      {...props}
    />
  );
};

export default Skeleton;
