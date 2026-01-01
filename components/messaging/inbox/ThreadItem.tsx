'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { UnreadBadge } from '@/components/messaging/shared/UnreadBadge';
import { MessageTimestamp } from '@/components/messaging/shared/MessageTimestamp';
import type { ThreadListItem } from '@/types/messaging';

interface ThreadItemProps {
  thread: ThreadListItem;
  isActive: boolean;
  onClick: () => void;
}

/**
 * Thread preview item for inbox list
 * - Avatar with initials fallback
 * - Name with verified badge
 * - Last message preview (truncated)
 * - Timestamp
 * - Unread indicator
 */
export function ThreadItem({ thread, isActive, onClick }: ThreadItemProps) {
  const { participant, last_message, updated_at, unread_count, is_own_last_message } = thread;

  const initials = participant.display_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const subtitle = participant.role === 'athlete'
    ? [participant.sport, participant.school].filter(Boolean).join(' • ')
    : participant.company_name || participant.industry;

  // Truncate last message for preview
  const messagePreview = last_message
    ? (is_own_last_message ? 'You: ' : '') + last_message.slice(0, 50) + (last_message.length > 50 ? '...' : '')
    : 'No messages yet';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-gray-50 focus:outline-none focus:bg-gray-50',
        isActive && 'bg-orange-50 border-l-2 border-orange-500',
        !isActive && 'border-l-2 border-transparent'
      )}
    >
      {/* Avatar */}
      <Avatar className="w-12 h-12 flex-shrink-0">
        {participant.avatar_url && (
          <AvatarImage src={participant.avatar_url} alt={participant.display_name} />
        )}
        <AvatarFallback className="bg-orange-100 text-orange-700 font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row: Name + timestamp */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                'font-semibold truncate',
                unread_count > 0 ? 'text-gray-900' : 'text-gray-700'
              )}
            >
              {participant.display_name}
            </span>
            {participant.is_verified && (
              <span className="flex-shrink-0 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
          <MessageTimestamp
            date={updated_at}
            className="flex-shrink-0 text-xs"
          />
        </div>

        {/* Subtitle (sport/school or company) */}
        {subtitle && (
          <p className="text-xs text-gray-500 truncate mb-1">
            {subtitle}
          </p>
        )}

        {/* Bottom row: Message preview + unread badge */}
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              'text-sm truncate',
              unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
            )}
          >
            {messagePreview}
          </p>
          {unread_count > 0 && (
            <UnreadBadge count={unread_count} size="sm" />
          )}
        </div>
      </div>
    </button>
  );
}
