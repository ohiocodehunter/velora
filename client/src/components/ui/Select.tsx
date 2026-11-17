import React from 'react';
import { cn } from '@/utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, children, id, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={generatedId} className="block text-xs font-medium text-ink/80">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={generatedId}
          className={cn(
            'w-full h-11 rounded-xl border border-line bg-surface px-3.5 text-sm text-ink',
            'transition-all duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15',
            'disabled:bg-canvas disabled:text-muted disabled:cursor-not-allowed',
            error && 'border-danger focus:border-danger focus:ring-danger/15',
            className,
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs text-danger mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted mt-1">{helperText}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
export default Select;
