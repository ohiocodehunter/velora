import React from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={generatedId} className="block text-xs font-medium text-ink/80">
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={generatedId}
          rows={rows}
          className={cn(
            'w-full rounded-xl border border-line bg-surface p-3.5 text-sm text-ink placeholder:text-muted/60',
            'transition-all duration-150 focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/15',
            'disabled:bg-canvas disabled:text-muted disabled:cursor-not-allowed',
            error && 'border-danger focus:border-danger focus:ring-danger/15',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger mt-1">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted mt-1">{helperText}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
export default Textarea;
