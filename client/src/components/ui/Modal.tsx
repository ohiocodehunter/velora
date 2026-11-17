import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxSizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative w-full rounded-2xl bg-surface p-6 sm:p-8 shadow-lift border border-line z-10 my-8',
          maxSizes[maxWidth],
        )}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-1 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {(title || description) && (
          <div className="mb-5 pr-6">
            {title && <h3 className="text-xl font-normal text-ink">{title}</h3>}
            {description && <p className="text-xs text-muted mt-1">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
