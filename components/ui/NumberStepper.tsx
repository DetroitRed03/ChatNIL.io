import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Plus, Minus, ChevronUp, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface NumberStepperProps {
  label?: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  variant?: 'default' | 'circular' | 'inline';
  unit?: 'currency' | 'number' | 'percent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const NumberStepper = React.forwardRef<HTMLDivElement, NumberStepperProps>(
  (
    {
      label,
      value,
      onChange,
      min = 0,
      max = Infinity,
      step = 1,
      variant = 'default',
      unit = 'number',
      size = 'md',
      className,
    },
    ref
  ) => {
    const [isHoldingIncrement, setIsHoldingIncrement] = React.useState(false);
    const [isHoldingDecrement, setIsHoldingDecrement] = React.useState(false);
    const holdTimerRef = React.useRef<NodeJS.Timeout>();
    const holdIntervalRef = React.useRef<NodeJS.Timeout>();

    const formatValue = (val: number) => {
      if (unit === 'currency') return formatCurrency(val);
      if (unit === 'percent') return `${val}%`;
      return val.toLocaleString();
    };

    const increment = () => {
      const newValue = Math.min(value + step, max);
      onChange(newValue);
    };

    const decrement = () => {
      const newValue = Math.max(value - step, min);
      onChange(newValue);
    };

    const startHold = (action: 'increment' | 'decrement') => {
      const fn = action === 'increment' ? increment : decrement;
      action === 'increment' ? setIsHoldingIncrement(true) : setIsHoldingDecrement(true);

      fn(); // Immediate action

      holdTimerRef.current = setTimeout(() => {
        holdIntervalRef.current = setInterval(fn, 100);
      }, 500);
    };

    const stopHold = () => {
      setIsHoldingIncrement(false);
      setIsHoldingDecrement(false);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };

    React.useEffect(() => {
      return () => {
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      };
    }, []);

    if (variant === 'circular') {
      const percentage = ((value - min) / (max - min)) * 100;
      const circumference = 2 * Math.PI * 45;
      const strokeDashoffset = circumference - (percentage / 100) * circumference;

      return (
        <div ref={ref} className={cn('flex flex-col items-center space-y-4', className)}>
          {label && (
            <label className="text-sm font-semibold text-text-primary">{label}</label>
          )}

          <div className="relative">
            {/* Circular progress */}
            <svg className="w-32 h-32 -rotate-90">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <motion.circle
                cx="64"
                cy="64"
                r="45"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center value */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                key={value}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"
              >
                {formatValue(value)}
              </motion.div>
            </div>

            {/* Increment/Decrement buttons */}
            <motion.button
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-primary-500 rounded-full text-white shadow-lg hover:bg-primary-600 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onMouseDown={() => startHold('increment')}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              animate={isHoldingIncrement ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3, repeat: isHoldingIncrement ? Infinity : 0 }}
            >
              <Plus className="h-5 w-5" />
            </motion.button>

            <motion.button
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-primary-500 rounded-full text-white shadow-lg hover:bg-primary-600 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onMouseDown={() => startHold('decrement')}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              animate={isHoldingDecrement ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3, repeat: isHoldingDecrement ? Infinity : 0 }}
            >
              <Minus className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      );
    }

    if (variant === 'inline') {
      return (
        <div ref={ref} className={cn('inline-flex items-center gap-2', className)}>
          {label && (
            <label className="text-sm font-semibold text-text-primary mr-2">{label}</label>
          )}

          <motion.button
            className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-text-primary transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseDown={() => startHold('decrement')}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            disabled={value <= min}
          >
            <Minus className="h-4 w-4" />
          </motion.button>

          <motion.div
            key={value}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="min-w-[80px] text-center font-bold text-lg text-text-primary"
          >
            {formatValue(value)}
          </motion.div>

          <motion.button
            className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-text-primary transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseDown={() => startHold('increment')}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            disabled={value >= max}
          >
            <Plus className="h-4 w-4" />
          </motion.button>
        </div>
      );
    }

    // Default variant - stacked buttons
    const sizeClasses = {
      sm: 'h-8 text-sm',
      md: 'h-10 text-base',
      lg: 'h-12 text-lg',
    };

    return (
      <div ref={ref} className={cn('w-full space-y-2', className)}>
        {label && (
          <label className="block text-sm font-semibold text-text-primary">{label}</label>
        )}

        <div className="relative flex items-center">
          <input
            type="text"
            value={formatValue(value)}
            readOnly
            className={cn(
              'w-full bg-background-card border-2 border-border rounded-lg text-center font-bold text-text-primary focus:outline-none focus:border-primary-500 transition-colors',
              sizeClasses[size]
            )}
          />

          <div className="absolute right-1 flex flex-col gap-0.5">
            <motion.button
              className="w-7 h-4 bg-primary-500 hover:bg-primary-600 rounded flex items-center justify-center text-white transition-colors"
              whileTap={{ scale: 0.95 }}
              onMouseDown={() => startHold('increment')}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              disabled={value >= max}
            >
              <ChevronUp className="h-3 w-3" />
            </motion.button>
            <motion.button
              className="w-7 h-4 bg-primary-500 hover:bg-primary-600 rounded flex items-center justify-center text-white transition-colors"
              whileTap={{ scale: 0.95 }}
              onMouseDown={() => startHold('decrement')}
              onMouseUp={stopHold}
              onMouseLeave={stopHold}
              disabled={value <= min}
            >
              <ChevronDown className="h-3 w-3" />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }
);

NumberStepper.displayName = 'NumberStepper';
