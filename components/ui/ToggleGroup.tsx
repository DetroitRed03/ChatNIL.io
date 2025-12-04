import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToggleOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ToggleGroupProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills' | 'buttons';
  className?: string;
}

export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      options,
      value,
      onChange,
      orientation = 'horizontal',
      size = 'md',
      variant = 'default',
      className,
    },
    ref
  ) => {
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
    const selectedIndex = options.findIndex((opt) => opt.value === value);

    const sizeClasses = {
      sm: 'text-sm py-1.5 px-4',
      md: 'text-base py-2 px-5',
      lg: 'text-lg py-2.5 px-6',
    };

    if (variant === 'pills') {
      return (
        <div
          ref={ref}
          className={cn(
            'inline-flex gap-3',
            orientation === 'vertical' && 'flex-col',
            className
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <motion.button
                key={option.value}
                onClick={() => !option.disabled && onChange(option.value)}
                disabled={option.disabled}
                className={cn(
                  'relative rounded-full font-medium transition-all duration-200',
                  sizeClasses[size],
                  isSelected
                    ? 'text-white'
                    : 'text-text-secondary hover:text-text-primary',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={!option.disabled ? { scale: 1.05 } : {}}
                whileTap={!option.disabled ? { scale: 0.95 } : {}}
              >
                {isSelected && (
                  <motion.div
                    layoutId="pill-background"
                    className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full shadow-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  {option.icon && <span className="text-base leading-none">{option.icon}</span>}
                  <span>{option.label}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      );
    }

    if (variant === 'buttons') {
      return (
        <div
          ref={ref}
          className={cn(
            'inline-flex gap-2',
            orientation === 'vertical' && 'flex-col',
            className
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <motion.button
                key={option.value}
                onClick={() => !option.disabled && onChange(option.value)}
                disabled={option.disabled}
                className={cn(
                  'relative rounded-lg font-medium transition-all duration-200 border-2',
                  sizeClasses[size],
                  isSelected
                    ? 'border-primary-500 text-primary-700 bg-primary-50'
                    : 'border-gray-300 text-text-secondary hover:border-primary-300 hover:text-text-primary',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
                whileHover={!option.disabled ? { scale: 1.02 } : {}}
                whileTap={!option.disabled ? { scale: 0.98 } : {}}
              >
                <span className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      );
    }

    // Default variant - segmented control with sliding indicator
    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex bg-gray-200 rounded-lg p-1',
          orientation === 'vertical' && 'flex-col',
          className
        )}
        role="radiogroup"
      >
        {/* Sliding background indicator */}
        <AnimatePresence>
          {selectedIndex !== -1 && (
            <motion.div
              layoutId="toggle-indicator"
              className="absolute bg-white rounded-md shadow-md"
              initial={false}
              animate={{
                [orientation === 'horizontal' ? 'x' : 'y']:
                  orientation === 'horizontal'
                    ? `${selectedIndex * 100}%`
                    : `${selectedIndex * 100}%`,
              }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              style={{
                [orientation === 'horizontal' ? 'width' : 'height']: `${100 / options.length}%`,
                [orientation === 'horizontal' ? 'height' : 'width']: 'calc(100% - 8px)',
                [orientation === 'horizontal' ? 'top' : 'left']: '4px',
                [orientation === 'horizontal' ? 'left' : 'top']: '4px',
              }}
            />
          )}
        </AnimatePresence>

        {/* Hover indicator */}
        {hoveredIndex !== null && hoveredIndex !== selectedIndex && (
          <motion.div
            className="absolute bg-white/50 rounded-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              [orientation === 'horizontal' ? 'left' : 'top']: '4px',
              [orientation === 'horizontal' ? 'top' : 'left']: '4px',
              [orientation === 'horizontal' ? 'width' : 'height']: `${100 / options.length}%`,
              [orientation === 'horizontal' ? 'height' : 'width']: 'calc(100% - 8px)',
              [orientation === 'horizontal' ? 'x' : 'y']: `${hoveredIndex * 100}%`,
            }}
          />
        )}

        {/* Options */}
        {options.map((option, index) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              onClick={() => !option.disabled && onChange(option.value)}
              onMouseEnter={() => !option.disabled && setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              disabled={option.disabled}
              role="radio"
              aria-checked={isSelected}
              className={cn(
                'relative z-10 rounded-md font-medium transition-colors duration-200',
                sizeClasses[size],
                isSelected ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary',
                option.disabled && 'opacity-50 cursor-not-allowed'
              )}
              style={{
                [orientation === 'horizontal' ? 'flex' : 'display']: '1',
              }}
            >
              <motion.span
                className="flex items-center justify-center gap-2"
                animate={isSelected ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {option.icon && (
                  <motion.span
                    animate={isSelected ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {option.icon}
                  </motion.span>
                )}
                {option.label}
              </motion.span>
            </button>
          );
        })}
      </div>
    );
  }
);

ToggleGroup.displayName = 'ToggleGroup';
