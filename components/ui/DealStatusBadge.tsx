'use client';

import { getDealDisplayStatus } from '@/lib/deal-status';

interface DealForBadge {
  status?: string;
  compliance_decision?: string | null;
  has_active_appeal?: boolean;
}

interface DealStatusBadgeProps {
  deal: DealForBadge;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DealStatusBadge({ deal, size = 'md', className = '' }: DealStatusBadgeProps) {
  const displayStatus = getDealDisplayStatus(deal);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${sizeClasses[size]}
        ${displayStatus.bgClass}
        ${displayStatus.textClass}
        ${className}
      `}
      title={displayStatus.label}
    >
      {displayStatus.friendlyLabel}
    </span>
  );
}
