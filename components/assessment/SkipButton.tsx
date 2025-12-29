'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SkipForward, Clock } from 'lucide-react';

interface SkipButtonProps {
  onSkip: () => void;
  skippedCount?: number;
  disabled?: boolean;
  className?: string;
}

export function SkipButton({
  onSkip,
  skippedCount = 0,
  disabled = false,
  className,
}: SkipButtonProps) {
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleClick = () => {
    if (showConfirm) {
      onSkip();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'group flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200',
          'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300',
          showConfirm
            ? 'bg-warning-50 text-warning-700 hover:bg-warning-100'
            : 'text-text-tertiary hover:text-text-secondary',
          disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
        )}
      >
        {showConfirm ? (
          <>
            <Clock className="w-4 h-4" />
            <span>Click again to confirm skip</span>
          </>
        ) : (
          <>
            <SkipForward className="w-4 h-4" />
            <span>Skip for now</span>
          </>
        )}
      </button>

      {skippedCount > 0 && !showConfirm && (
        <span className="text-xs text-text-tertiary">
          {skippedCount} question{skippedCount !== 1 ? 's' : ''} skipped - you can return later
        </span>
      )}

      {showConfirm && (
        <span className="text-xs text-warning-600 animate-pulse">
          You&apos;ll have a chance to answer this before submitting
        </span>
      )}
    </div>
  );
}
