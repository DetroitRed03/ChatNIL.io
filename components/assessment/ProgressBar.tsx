'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/Progress';
import { CheckCircle } from 'lucide-react';

interface AssessmentProgressBarProps {
  current: number;
  total: number;
  section?: string;
  skippedCount?: number;
  className?: string;
}

export function AssessmentProgressBar({
  current,
  total,
  section,
  skippedCount = 0,
  className,
}: AssessmentProgressBarProps) {
  const percentage = Math.round((current / total) * 100);
  const isComplete = current === total;

  return (
    <div className={cn('w-full space-y-3', className)}>
      {/* Section indicator */}
      {section && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-secondary">
            {section}
          </span>
          {skippedCount > 0 && (
            <span className="text-xs text-warning-600">
              {skippedCount} skipped
            </span>
          )}
        </div>
      )}

      {/* Progress bar with step indicators */}
      <div className="relative">
        <Progress
          value={current}
          max={total}
          variant={isComplete ? 'success' : 'primary'}
          size="md"
        />

        {/* Step dots */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-0">
          {Array.from({ length: Math.min(total, 10) }).map((_, i) => {
            const stepIndex = Math.floor((i / 9) * (total - 1));
            const isCompleted = current > stepIndex;
            const isCurrent = current === stepIndex + 1;

            return (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  isCompleted
                    ? 'bg-primary-600 scale-100'
                    : isCurrent
                    ? 'bg-primary-400 scale-125 ring-2 ring-primary-200'
                    : 'bg-gray-300 scale-75'
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Question count */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <>
              <CheckCircle className="w-4 h-4 text-success-600" />
              <span className="text-success-600 font-medium">Complete!</span>
            </>
          ) : (
            <span className="text-text-tertiary">
              Question {current} of {total}
            </span>
          )}
        </div>
        <span className="font-medium text-text-primary">{percentage}%</span>
      </div>
    </div>
  );
}
