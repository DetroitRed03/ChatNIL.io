'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const neumorphicButtonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group',
  {
    variants: {
      variant: {
        raised: 'bg-background shadow-[8px_8px_16px_#D6D1CC,-8px_-8px_16px_#FFFFFF] hover:shadow-[4px_4px_8px_#D6D1CC,-4px_-4px_8px_#FFFFFF] active:shadow-[inset_4px_4px_8px_#D6D1CC,inset_-4px_-4px_8px_#FFFFFF]',
        pressed: 'bg-background shadow-[inset_6px_6px_12px_#D6D1CC,inset_-6px_-6px_12px_#FFFFFF]',
        flat: 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-[0_8px_16px_rgba(249,115,22,0.3)] hover:shadow-[0_12px_24px_rgba(249,115,22,0.4)] hover:-translate-y-1',
        glow: 'bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 bg-[length:200%_100%] shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:shadow-[0_0_30px_rgba(249,115,22,0.7)]',
        outline: 'bg-transparent border-2 border-primary-500 hover:bg-primary-50',
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-xl',
        md: 'h-12 px-6 text-base rounded-2xl',
        lg: 'h-14 px-8 text-lg rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'raised',
      size: 'md',
    },
  }
);

export interface NeumorphicButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neumorphicButtonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const NeumorphicButton = React.forwardRef<HTMLButtonElement, NeumorphicButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      onDrag: _onDrag,
      onDragStart: _onDragStart,
      onDragEnd: _onDragEnd,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = React.useState(false);

    const textColor = variant === 'flat' || variant === 'glow' ? 'text-white' : 'text-text-primary';

    return (
      <motion.button
        ref={ref}
        className={cn(neumorphicButtonVariants({ variant, size }), textColor, className)}
        disabled={disabled || isLoading}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        whileTap={{ scale: 0.98 }}
        {...(props as any)}
      >
        {/* Animated gradient background for glow variant */}
        {variant === 'glow' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ backgroundSize: '200% 100%' }}
          />
        )}

        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={isPressed ? { scale: 2, opacity: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{
            background: variant === 'flat' || variant === 'glow'
              ? 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {isLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="h-4 w-4" />
            </motion.div>
          )}
          {!isLoading && leftIcon && (
            <motion.span
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.3 }}
            >
              {leftIcon}
            </motion.span>
          )}
          {children}
          {!isLoading && rightIcon && (
            <motion.span
              whileHover={{ x: [0, 5, 0] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              {rightIcon}
            </motion.span>
          )}
        </span>

        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </motion.button>
    );
  }
);

NeumorphicButton.displayName = 'NeumorphicButton';

export { NeumorphicButton, neumorphicButtonVariants };
