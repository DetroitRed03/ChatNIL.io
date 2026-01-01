'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface MessageTimestampProps {
  timestamp?: string | null;
  date?: string | null;  // Alias for timestamp (some components pass 'date' instead)
  className?: string;
  format?: 'relative' | 'time' | 'full';
}

/**
 * Formats timestamps for messages
 * - Today: "2:30 PM"
 * - Yesterday: "Yesterday"
 * - This week: "Monday"
 * - Older: "Dec 15"
 */
export function MessageTimestamp({ timestamp, date, className, format = 'relative' }: MessageTimestampProps) {
  // Accept either 'timestamp' or 'date' prop
  const dateValue = timestamp || date;

  const formattedTime = useMemo(() => {
    // Handle null/undefined dates
    if (!dateValue) {
      return '-';
    }

    const parsedDate = new Date(dateValue);

    // Handle invalid dates
    if (isNaN(parsedDate.getTime())) {
      return '-';
    }

    const now = new Date();

    if (format === 'time') {
      return parsedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    if (format === 'full') {
      return parsedDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }

    // Relative format
    const diffMs = now.getTime() - parsedDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Just now (< 1 min)
    if (diffMins < 1) {
      return 'Just now';
    }

    // Minutes ago (< 60 min)
    if (diffMins < 60) {
      return `${diffMins}m`;
    }

    // Hours ago (< 24 hours, same day)
    if (diffHours < 24 && parsedDate.getDate() === now.getDate()) {
      return parsedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (parsedDate.getDate() === yesterday.getDate() &&
        parsedDate.getMonth() === yesterday.getMonth() &&
        parsedDate.getFullYear() === yesterday.getFullYear()) {
      return 'Yesterday';
    }

    // This week (< 7 days)
    if (diffDays < 7) {
      return parsedDate.toLocaleDateString('en-US', { weekday: 'short' });
    }

    // This year
    if (parsedDate.getFullYear() === now.getFullYear()) {
      return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Older
    return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  }, [dateValue, format]);

  return (
    <time
      dateTime={dateValue || undefined}
      className={cn('text-gray-500 text-xs', className)}
      title={dateValue ? new Date(dateValue).toLocaleString() : undefined}
    >
      {formattedTime}
    </time>
  );
}

/**
 * Date separator for message groups
 */
export function DateSeparator({ date }: { date: string }) {
  const formattedDate = useMemo(() => {
    const d = new Date(date);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === now.toDateString()) {
      return 'Today';
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, [date]);

  return (
    <div className="flex items-center justify-center py-4">
      <div className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
        {formattedDate}
      </div>
    </div>
  );
}
