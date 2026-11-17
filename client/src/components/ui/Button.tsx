import React from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants = {
      primary: 'bg-ink text-surface hover:bg-ink/90 active:scale-[0.99] shadow-xs',
      secondary: 'bg-line/80 text-ink hover:bg-line active:scale-[0.99]',
      outline: 'border border-line bg-transparent text-ink hover:bg-line/40 hover:border-line-strong active:scale-[0.99]',
      ghost: 'bg-transparent text-ink hover:bg-line/50',
      danger: 'bg-danger text-surface hover:bg-danger/90 active:scale-[0.99]',
      accent: 'bg-accent text-surface hover:bg-accent-strong active:scale-[0.99] shadow-xs',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-xs rounded-lg gap-1.5',
      md: 'h-11 px-5 text-sm rounded-xl gap-2',
      lg: 'h-13 px-7 text-base rounded-xl gap-2.5',
      icon: 'h-10 w-10 p-0 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
