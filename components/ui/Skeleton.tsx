import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const skeletonVariants = cva(
  'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
  {
    variants: {
      variant: {
        default: 'rounded-md',
        circle: 'rounded-full',
        text: 'rounded h-4',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}

// Preset skeleton components for common use cases
function SkeletonCard() {
  return (
    <div className="space-y-4 p-6 border border-border rounded-lg bg-background-card">
      <Skeleton className="h-12 w-12" variant="circle" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" variant="text" />
        <Skeleton className="h-4 w-1/2" variant="text" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" variant="text" />
        <Skeleton className="h-3 w-full" variant="text" />
        <Skeleton className="h-3 w-2/3" variant="text" />
      </div>
    </div>
  );
}

function SkeletonButton() {
  return <Skeleton className="h-10 w-24 rounded-lg" />;
}

function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return <Skeleton className={cn(sizeClasses[size])} variant="circle" />;
}

export { Skeleton, SkeletonCard, SkeletonButton, SkeletonAvatar, skeletonVariants };
