import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'success' | 'danger' | 'warning' | 'accent' | 'muted';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-line/70 text-ink border-transparent',
    outline: 'border border-line bg-surface text-ink',
    success: 'bg-[#EEF3F0] text-success border-[#D6E4DC]',
    danger: 'bg-[#F8ECEC] text-danger border-[#EFD5D5]',
    warning: 'bg-[#FAF3E6] text-[#8a6d3b] border-[#EBDCC0]',
    accent: 'bg-accent-soft text-accent-strong border-[#e6dcce]',
    muted: 'bg-canvas text-muted border-line',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium tracking-wide',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border font-sans select-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
