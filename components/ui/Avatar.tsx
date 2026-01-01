import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full bg-gray-200',
  {
    variants: {
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-20 w-20',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const avatarImageVariants = cva('aspect-square h-full w-full object-cover');

const avatarFallbackVariants = cva(
  'flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold',
  {
    variants: {
      size: {
        xs: 'text-[10px]',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
        '2xl': 'text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const statusIndicatorVariants = cva(
  'absolute rounded-full border-2 border-white',
  {
    variants: {
      size: {
        xs: 'h-1.5 w-1.5 bottom-0 right-0',
        sm: 'h-2 w-2 bottom-0 right-0',
        md: 'h-2.5 w-2.5 bottom-0 right-0',
        lg: 'h-3 w-3 bottom-0 right-0',
        xl: 'h-3.5 w-3.5 bottom-0.5 right-0.5',
        '2xl': 'h-4 w-4 bottom-1 right-1',
      },
      status: {
        online: 'bg-success-500',
        offline: 'bg-gray-400',
        busy: 'bg-error-500',
        away: 'bg-warning-500',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, status, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    // Generate initials from fallback text
    const getInitials = (text?: string) => {
      if (!text) return '';
      const words = text.trim().split(/\s+/);
      if (words.length === 1) return words[0].charAt(0).toUpperCase();
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    const initials = getInitials(fallback || alt);

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className={cn(avatarImageVariants())}
            onError={() => setImageError(true)}
          />
        ) : initials ? (
          <div className={cn(avatarFallbackVariants({ size }))}>
            {initials}
          </div>
        ) : (
          <div className={cn(avatarFallbackVariants({ size }), 'bg-gray-300 text-gray-600')}>
            <User className={cn(
              size === 'xs' && 'h-3 w-3',
              size === 'sm' && 'h-4 w-4',
              size === 'md' && 'h-5 w-5',
              size === 'lg' && 'h-6 w-6',
              size === 'xl' && 'h-8 w-8',
              size === '2xl' && 'h-10 w-10'
            )} />
          </div>
        )}
        {status && (
          <span
            className={cn(statusIndicatorVariants({ size, status }))}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Sub-components for radix-style usage (AvatarImage, AvatarFallback)
// These allow composable usage: <Avatar><AvatarImage /><AvatarFallback /></Avatar>

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, ...props }, ref) => {
    const [error, setError] = React.useState(false);

    if (error || !src) {
      return null;
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt || 'Avatar'}
        className={cn(avatarImageVariants(), className)}
        onError={() => setError(true)}
        {...props}
      />
    );
  }
);

AvatarImage.displayName = 'AvatarImage';

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(avatarFallbackVariants(), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback, avatarVariants };
