import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

export interface GradientInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
}

const GradientInput = React.forwardRef<HTMLInputElement, GradientInputProps>(
  ({ className, label, error, success, icon, id, onChange, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="relative w-full group">
        {label && (
          <motion.label
            htmlFor={inputId}
            className="block text-sm font-semibold text-text-primary mb-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {label}
          </motion.label>
        )}

        <div className="relative">
          {/* Animated gradient border */}
          <motion.div
            className={cn(
              'absolute -inset-0.5 rounded-2xl opacity-75 blur-sm transition-opacity duration-300',
              error
                ? 'bg-gradient-to-r from-error-400 via-error-500 to-error-600'
                : success
                ? 'bg-gradient-to-r from-success-400 via-success-500 to-success-600'
                : 'bg-gradient-to-r from-primary-400 via-accent-500 to-primary-600',
              isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
            )}
            animate={isFocused ? {
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            } : {}}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundSize: '200% 200%',
              pointerEvents: 'none'
            }}
          />

          {/* Input container */}
          <div className="relative bg-background-card rounded-2xl border-2 border-transparent">
            <div className="flex items-center relative">
              {/* Icon with animation - pointer-events-none is critical! */}
              {icon && (
                <motion.div
                  className="absolute left-4 pointer-events-none"
                  style={{ zIndex: 20 }}
                  animate={{
                    scale: isFocused ? [1, 1.2, 1] : 1,
                    rotate: isFocused ? [0, 5, -5, 0] : 0,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={cn(
                    'transition-all duration-300',
                    isFocused
                      ? 'text-primary-600 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]'
                      : 'text-gray-400'
                  )}>
                    {icon}
                  </div>
                </motion.div>
              )}

              {/* Input - spread props first, then override critical ones */}
              <input
                {...props}
                ref={ref}
                id={inputId}
                onChange={(e) => {
                  onChange?.(e);
                }}
                onFocus={(e) => {
                  setIsFocused(true);
                  onFocus?.(e);
                }}
                onBlur={(e) => {
                  setIsFocused(false);
                  onBlur?.(e);
                }}
                className={cn(
                  'relative w-full px-4 py-3.5 bg-transparent rounded-2xl',
                  'text-base placeholder-gray-400',
                  'outline-none transition-all duration-300',
                  'caret-primary-600',
                  icon && 'pl-12',
                  (success || error) && 'pr-12',
                  className
                )}
                style={{
                  WebkitTextFillColor: '#111827 !important',
                  color: '#111827 !important',
                  zIndex: 10,
                  opacity: 1,
                  backgroundColor: 'transparent',
                }}
              />

              {/* Status icon */}
              <AnimatePresence>
                {(success || error) && (
                  <motion.div
                    className="absolute right-4 pointer-events-none"
                    style={{ zIndex: 20 }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    {success ? (
                      <div className="h-6 w-6 rounded-full bg-success-500 flex items-center justify-center shadow-lg shadow-success-500/50">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-error-500 flex items-center justify-center shadow-lg shadow-error-500/50">
                        <AlertCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Animated particles on focus */}
            {isFocused && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary-500 rounded-full"
                    initial={{
                      x: Math.random() * 100 + '%',
                      y: '100%',
                      opacity: 0,
                    }}
                    animate={{
                      y: '-10%',
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error/Helper message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mt-2 text-sm text-error-600 px-4 font-medium"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

GradientInput.displayName = 'GradientInput';

export { GradientInput };
