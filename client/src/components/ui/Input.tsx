import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, id, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={generatedId} className="block text-xs font-medium text-ink/80">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={generatedId}
            className={cn(
              'w-full h-11 rounded-xl border border-line bg-surface px-4 text-sm text-ink placeholder:text-muted/60',
              'transition-all duration-150 focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/15',
              'disabled:bg-canvas disabled:text-muted disabled:cursor-not-allowed',
              icon && 'pl-10',
              error && 'border-danger focus:border-danger focus:ring-danger/15',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted mt-1">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
