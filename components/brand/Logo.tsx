'use client';

import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export type LogoVariant = 'full' | 'icon-only' | 'minimal';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  href?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: {
    container: 'w-6 h-6',
    icon: 'h-3 w-3',
    text: 'text-base',
    gap: 'space-x-1.5',
  },
  md: {
    container: 'w-8 h-8',
    icon: 'h-5 w-5',
    text: 'text-xl',
    gap: 'space-x-2',
  },
  lg: {
    container: 'w-10 h-10',
    icon: 'h-6 w-6',
    text: 'text-2xl',
    gap: 'space-x-3',
  },
  xl: {
    container: 'w-14 h-14',
    icon: 'h-8 w-8',
    text: 'text-4xl',
    gap: 'space-x-4',
  },
};

export function Logo({
  variant = 'full',
  size = 'md',
  className = '',
  href = '/',
  onClick
}: LogoProps) {
  const sizes = sizeClasses[size];

  const logoContent = (
    <div className={cn('flex items-center', sizes.gap, className)}>
      {/* Icon */}
      <div className={cn(
        sizes.container,
        'bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm'
      )}>
        <MessageSquare className={cn(sizes.icon, 'text-white')} />
      </div>

      {/* Text (only for 'full' and 'minimal' variants) */}
      {variant !== 'icon-only' && (
        <span className={cn(
          sizes.text,
          'font-semibold text-text-primary'
        )}>
          ChatNIL
        </span>
      )}
    </div>
  );

  // If onClick is provided, render as button
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg transition-opacity hover:opacity-90"
        aria-label="ChatNIL logo"
      >
        {logoContent}
      </button>
    );
  }

  // If href is provided, render as Link
  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg transition-opacity hover:opacity-90"
        aria-label="ChatNIL home"
      >
        {logoContent}
      </Link>
    );
  }

  // Otherwise, render as plain div
  return logoContent;
}
