import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  min = 1,
  max = 20,
  onChange,
  disabled = false,
  size = 'md',
  className,
}) => {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const heights = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl border border-line bg-surface overflow-hidden',
        heights[size],
        className,
      )}
    >
      <button
        type="button"
        disabled={disabled || value <= min}
        onClick={handleDecrement}
        className="px-2.5 h-full flex items-center justify-center text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-9 px-2 text-center font-medium text-ink select-none">{value}</span>
      <button
        type="button"
        disabled={disabled || value >= max}
        onClick={handleIncrement}
        className="px-2.5 h-full flex items-center justify-center text-ink hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default QuantityStepper;
