'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface QuestionScaleProps {
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  labels?: string[];
  helpText?: string;
  disabled?: boolean;
}

const DEFAULT_LABELS = [
  'Strongly Disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly Agree',
];

export function QuestionScale({
  value,
  onChange,
  min = 1,
  max = 5,
  labels = DEFAULT_LABELS,
  helpText,
  disabled = false,
}: QuestionScaleProps) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return (
    <div className="w-full space-y-4">
      {/* Help text */}
      {helpText && (
        <p className="text-sm text-text-tertiary text-center">{helpText}</p>
      )}

      {/* Scale options */}
      <div className="flex justify-between gap-2">
        {options.map((option, index) => {
          const isSelected = value === option;
          const label = labels[index] || `${option}`;

          return (
            <button
              key={option}
              type="button"
              onClick={() => !disabled && onChange(option)}
              disabled={disabled}
              className={cn(
                'flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200',
                'hover:border-primary-300 hover:bg-primary-50/50',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 bg-white',
                disabled && 'opacity-50 cursor-not-allowed hover:border-gray-200 hover:bg-white'
              )}
            >
              {/* Number indicator */}
              <span
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  isSelected
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {option}
              </span>

              {/* Label (visible on larger screens) */}
              <span
                className={cn(
                  'hidden sm:block text-xs text-center leading-tight',
                  isSelected ? 'text-primary-700 font-medium' : 'text-text-tertiary'
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile labels - show below for small screens */}
      <div className="flex justify-between sm:hidden text-xs text-text-tertiary px-2">
        <span>{labels[0]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>

      {/* Selection indicator */}
      {value && (
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
            Your answer: {labels[value - min]}
          </span>
        </div>
      )}
    </div>
  );
}
