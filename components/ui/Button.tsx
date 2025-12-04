import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 focus-visible:ring-primary-500 active:scale-[0.98]',
        secondary:
          'bg-gradient-to-r from-secondary-600 to-secondary-500 text-white shadow-md hover:shadow-lg hover:from-secondary-700 hover:to-secondary-600 focus-visible:ring-secondary-500 active:scale-[0.98]',
        accent:
          'bg-gradient-to-r from-accent-600 to-accent-500 text-white shadow-md hover:shadow-lg hover:from-accent-700 hover:to-accent-600 focus-visible:ring-accent-500 active:scale-[0.98]',
        ghost:
          'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500',
        outline:
          'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-gray-500',
        danger:
          'bg-gradient-to-r from-error-600 to-error-500 text-white shadow-md hover:shadow-lg hover:from-error-700 hover:to-error-600 focus-visible:ring-error-500 active:scale-[0.98]',
        success:
          'bg-gradient-to-r from-success-600 to-success-500 text-white shadow-md hover:shadow-lg hover:from-success-700 hover:to-success-600 focus-visible:ring-success-500 active:scale-[0.98]',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
