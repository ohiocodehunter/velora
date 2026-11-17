import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { removeToast, type Toast } from '@/store/slices/uiSlice';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id, toast.duration]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-success shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-danger shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-[#8a6d3b] shrink-0" />,
    info: <Info className="h-5 w-5 text-accent shrink-0" />,
  };

  const borders = {
    success: 'border-[#D6E4DC] bg-surface',
    error: 'border-[#EFD5D5] bg-surface',
    warning: 'border-[#EBDCC0] bg-surface',
    info: 'border-line bg-surface',
  };

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center justify-between gap-3 w-80 max-w-full p-4 rounded-xl border shadow-lift text-sm transition-all animate-rise',
        borders[toast.type],
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {icons[toast.type]}
        <p className="text-xs font-medium text-ink leading-tight">{toast.message}</p>
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="text-muted hover:text-ink p-1 rounded-md transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useAppSelector((state) => state.ui.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none max-w-[calc(100vw-2.5rem)]">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
