'use client';

import { cn } from '@/lib/utils';

interface UnreadBadgeProps {
  count: number;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Unread message count badge
 * Shows count when > 0, displays 9+ for counts > 9
 */
export function UnreadBadge({ count, className, size = 'md' }: UnreadBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > 9 ? '9+' : count.toString();

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center bg-orange-500 text-white font-semibold rounded-full',
        size === 'sm' ? 'min-w-[18px] h-[18px] text-xs px-1' : 'min-w-[22px] h-[22px] text-sm px-1.5',
        className
      )}
    >
      {displayCount}
    </span>
  );
}

/**
 * Unread dot indicator (no count)
 */
export function UnreadDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'w-2.5 h-2.5 bg-orange-500 rounded-full',
        className
      )}
    />
  );
}
