import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const isFloating = isFocused || hasValue;

    return (
      <div className="relative w-full">
        <div className="relative">
          {/* Glass morphism background */}
          <div className={cn(
            'absolute inset-0 rounded-2xl transition-all duration-300',
            'bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md',
            'border border-white/20 shadow-lg',
            isFocused && 'ring-2 ring-primary-500/50 border-primary-300',
            error && 'ring-2 ring-error-500/50 border-error-300'
          )} />

          {/* Icon */}
          {icon && (
            <motion.div
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ zIndex: 20 }}
              animate={{
                scale: isFocused ? 1.1 : 1,
                rotate: isFocused ? [0, -10, 10, 0] : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className={cn(
                'transition-colors duration-300',
                isFocused ? 'text-primary-600' : 'text-gray-400'
              )}>
                {icon}
              </div>
            </motion.div>
          )}

          {/* Floating Label */}
          <motion.label
            htmlFor={inputId}
            className={cn(
              'absolute left-4 pointer-events-none z-10 origin-left transition-all duration-300',
              'font-medium',
              icon && 'left-12'
            )}
            animate={{
              top: isFloating ? '8px' : '50%',
              translateY: isFloating ? '0%' : '-50%',
              fontSize: isFloating ? '0.75rem' : '1rem',
              color: isFocused ? '#f97316' : error ? '#ef4444' : '#6b7280',
            }}
          >
            {label}
          </motion.label>

          {/* Input */}
          <input
            {...props}
            ref={ref}
            id={inputId}
            className={cn(
              'relative w-full px-4 pt-6 pb-2 bg-transparent rounded-2xl',
              'text-base text-gray-900 placeholder-transparent',
              'outline-none transition-all duration-300',
              icon && 'pl-12',
              className
            )}
            style={{
              zIndex: 10,
              WebkitTextFillColor: '#111827',
              color: '#111827',
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleChange}
          />

          {/* Animated underline */}
          <motion.div
            className="absolute bottom-2 left-4 right-4 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isFocused ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Error message with animation */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-error-600 px-4"
          >
            {error}
          </motion.p>
        )}

        {/* Shine effect on focus */}
        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          </motion.div>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

export { FloatingInput };
