'use client';

import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// OnboardingInput - Clean, professional input component for onboarding forms
// Matches the agency campaign creation UI style
// ============================================================================

interface OnboardingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const OnboardingInput = forwardRef<HTMLInputElement, OnboardingInputProps>(
  ({ label, error, required, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 border-2 border-orange-200/50 rounded-xl',
            'focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100',
            'bg-white text-gray-900 font-medium placeholder:text-gray-400',
            'transition-colors duration-200',
            error && 'border-red-300 focus:border-red-400 focus:ring-red-100',
            props.disabled && 'bg-gray-50 cursor-not-allowed opacity-60',
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

OnboardingInput.displayName = 'OnboardingInput';

// ============================================================================
// OnboardingTextarea - Textarea variant
// ============================================================================

interface OnboardingTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export const OnboardingTextarea = forwardRef<HTMLTextAreaElement, OnboardingTextareaProps>(
  ({ label, error, required, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 border-2 border-orange-200/50 rounded-xl',
            'focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100',
            'bg-white text-gray-900 font-medium placeholder:text-gray-400',
            'transition-colors duration-200 resize-none min-h-[120px]',
            error && 'border-red-300 focus:border-red-400 focus:ring-red-100',
            props.disabled && 'bg-gray-50 cursor-not-allowed opacity-60',
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

OnboardingTextarea.displayName = 'OnboardingTextarea';

// ============================================================================
// OnboardingSelect - Select dropdown variant
// ============================================================================

interface OnboardingSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const OnboardingSelect = forwardRef<HTMLSelectElement, OnboardingSelectProps>(
  ({ label, error, required, helperText, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-3 border-2 border-orange-200/50 rounded-xl',
            'focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100',
            'bg-white text-gray-900 font-medium',
            'transition-colors duration-200 appearance-none cursor-pointer',
            'bg-[url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")] bg-[length:1.5em_1.5em] bg-[right_0.75rem_center] bg-no-repeat',
            error && 'border-red-300 focus:border-red-400 focus:ring-red-100',
            props.disabled && 'bg-gray-50 cursor-not-allowed opacity-60',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

OnboardingSelect.displayName = 'OnboardingSelect';

// ============================================================================
// OnboardingCheckboxGroup - Checkbox group for multi-select options
// ============================================================================

interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
}

interface OnboardingCheckboxGroupProps {
  label: string;
  options: CheckboxOption[];
  value: string[];
  onChange: (values: string[]) => void;
  error?: string;
  required?: boolean;
  helperText?: string;
  columns?: 1 | 2 | 3;
}

export function OnboardingCheckboxGroup({
  label,
  options,
  value,
  onChange,
  error,
  required,
  helperText,
  columns = 2,
}: OnboardingCheckboxGroupProps) {
  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        className={cn(
          'grid gap-3',
          columns === 1 && 'grid-cols-1',
          columns === 2 && 'grid-cols-1 sm:grid-cols-2',
          columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
                isSelected
                  ? 'border-orange-400 bg-orange-50 shadow-sm'
                  : 'border-orange-200/50 bg-white hover:border-orange-300 hover:bg-orange-50/50'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors',
                  isSelected
                    ? 'bg-orange-500 border-orange-500'
                    : 'border-gray-300 bg-white'
                )}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                  </svg>
                )}
              </div>
              <div>
                <span className={cn('font-semibold', isSelected ? 'text-gray-900' : 'text-gray-700')}>
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// OnboardingRadioGroup - Radio group for single-select options
// ============================================================================

interface OnboardingRadioGroupProps {
  label: string;
  options: CheckboxOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  helperText?: string;
  columns?: 1 | 2 | 3;
}

export function OnboardingRadioGroup({
  label,
  options,
  value,
  onChange,
  error,
  required,
  helperText,
  columns = 2,
}: OnboardingRadioGroupProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        className={cn(
          'grid gap-3',
          columns === 1 && 'grid-cols-1',
          columns === 2 && 'grid-cols-1 sm:grid-cols-2',
          columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
                isSelected
                  ? 'border-orange-400 bg-orange-50 shadow-sm'
                  : 'border-orange-200/50 bg-white hover:border-orange-300 hover:bg-orange-50/50'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors',
                  isSelected
                    ? 'border-orange-500'
                    : 'border-gray-300'
                )}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                )}
              </div>
              <div>
                <span className={cn('font-semibold', isSelected ? 'text-gray-900' : 'text-gray-700')}>
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}

// ============================================================================
// OnboardingButton - Styled buttons for onboarding
// ============================================================================

interface OnboardingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function OnboardingButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className,
  disabled,
  ...props
}: OnboardingButtonProps) {
  return (
    <button
      className={cn(
        'font-bold rounded-xl transition-all flex items-center justify-center gap-2',
        // Size variants
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'md' && 'px-6 py-3',
        size === 'lg' && 'px-8 py-4 text-lg',
        // Color variants
        variant === 'primary' &&
          'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-200/50',
        variant === 'secondary' &&
          'bg-gray-100 hover:bg-gray-200 text-gray-700',
        variant === 'ghost' &&
          'bg-transparent hover:bg-gray-100 text-gray-600',
        // Disabled state
        (disabled || isLoading) && 'opacity-60 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// ============================================================================
// OnboardingCard - Container card for step content
// ============================================================================

interface OnboardingCardProps {
  children: React.ReactNode;
  className?: string;
}

export function OnboardingCard({ children, className }: OnboardingCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border-2 border-orange-100/50 shadow-xl p-8',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// OnboardingStepHeader - Header for each step
// ============================================================================

interface OnboardingStepHeaderProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

export function OnboardingStepHeader({ icon, title, description }: OnboardingStepHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        {icon}
      </div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {description && (
        <p className="text-gray-600 mt-2">{description}</p>
      )}
    </div>
  );
}

export default OnboardingInput;
