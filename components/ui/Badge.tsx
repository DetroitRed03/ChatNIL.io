import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-100 text-primary-800 border border-primary-200',
        secondary:
          'bg-secondary-100 text-secondary-800 border border-secondary-200',
        accent:
          'bg-accent-100 text-accent-800 border border-accent-200',
        success:
          'bg-success-100 text-success-800 border border-success-200',
        warning:
          'bg-warning-100 text-warning-800 border border-warning-200',
        error:
          'bg-error-100 text-error-800 border border-error-200',
        gray:
          'bg-gray-100 text-gray-800 border border-gray-200',
        outline:
          'border-2 border-gray-300 text-gray-700 bg-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

function Badge({
  className,
  variant,
  size,
  leftIcon,
  rightIcon,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {leftIcon && <span className="inline-flex">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="inline-flex">{rightIcon}</span>}
    </div>
  );
}

export { Badge, badgeVariants };
