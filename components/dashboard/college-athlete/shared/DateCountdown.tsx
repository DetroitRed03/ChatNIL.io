'use client';

import { useMemo } from 'react';

interface DateCountdownProps {
  date: string | Date;
  urgentThresholdDays?: number;
  showIcon?: boolean;
  className?: string;
}

export function DateCountdown({
  date,
  urgentThresholdDays = 3,
  showIcon = true,
  className = ''
}: DateCountdownProps) {
  const { daysRemaining, label, isUrgent, isOverdue, color } = useMemo(() => {
    const targetDate = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let label: string;
    let isUrgent = false;
    let isOverdue = false;
    let color: string;

    if (diffDays < 0) {
      label = `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
      isOverdue = true;
      color = 'text-red-600';
    } else if (diffDays === 0) {
      label = 'Due today';
      isUrgent = true;
      color = 'text-red-600';
    } else if (diffDays === 1) {
      label = 'Due tomorrow';
      isUrgent = true;
      color = 'text-amber-600';
    } else if (diffDays <= urgentThresholdDays) {
      label = `${diffDays} days left`;
      isUrgent = true;
      color = 'text-amber-600';
    } else if (diffDays <= 7) {
      label = `${diffDays} days left`;
      color = 'text-gray-600';
    } else if (diffDays <= 30) {
      label = `${Math.ceil(diffDays / 7)} week${diffDays > 7 ? 's' : ''} left`;
      color = 'text-gray-500';
    } else {
      label = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      color = 'text-gray-500';
    }

    return { daysRemaining: diffDays, label, isUrgent, isOverdue, color };
  }, [date, urgentThresholdDays]);

  const Icon = () => {
    if (isOverdue) {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    if (isUrgent) {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${color} ${className}`}>
      {showIcon && <Icon />}
      {label}
    </span>
  );
}
