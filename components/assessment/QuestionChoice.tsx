'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ChoiceOption {
  value: string;
  label: string;
}

interface QuestionChoiceProps {
  options: ChoiceOption[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function QuestionChoice({
  options,
  value,
  onChange,
  disabled = false,
}: QuestionChoiceProps) {
  return (
    <div className="w-full space-y-3">
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const optionLetter = String.fromCharCode(65 + index); // A, B, C, D

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={cn(
              'w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200',
              'hover:border-primary-300 hover:bg-primary-50/50 hover:shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              isSelected
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-gray-200 bg-white',
              disabled && 'opacity-50 cursor-not-allowed hover:border-gray-200 hover:bg-white'
            )}
          >
            {/* Option letter indicator */}
            <span
              className={cn(
                'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all',
                isSelected
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {isSelected ? <Check className="w-5 h-5" /> : optionLetter}
            </span>

            {/* Option label */}
            <span
              className={cn(
                'flex-1 text-base leading-relaxed pt-0.5',
                isSelected ? 'text-primary-900 font-medium' : 'text-text-primary'
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}

      {/* Keyboard hint */}
      <p className="text-xs text-text-tertiary text-center pt-2">
        <span className="hidden sm:inline">
          Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-xs">A</kbd>-
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-xs">
            {String.fromCharCode(64 + options.length)}
          </kbd>{' '}
          to select or click an option
        </span>
        <span className="sm:hidden">Tap to select</span>
      </p>
    </div>
  );
}
