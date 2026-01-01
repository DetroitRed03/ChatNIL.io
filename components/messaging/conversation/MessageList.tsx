'use client';

import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessageBubble } from './MessageBubble';
import { EmptyConversation } from './EmptyConversation';
import type { DirectMessage, ThreadParticipant, MessageDeliveryStatus } from '@/types/messaging';

interface MessageListProps {
  messages: DirectMessage[];
  currentUserId: string;
  participant: ThreadParticipant;
  viewerRole: 'agency' | 'athlete';
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  className?: string;
}

/**
 * Scrollable message list with:
 * - Auto-scroll to bottom on new messages
 * - Load more on scroll to top
 * - Message grouping (avatars only for first in cluster)
 * - Timestamp grouping
 */
export function MessageList({
  messages,
  currentUserId,
  participant,
  viewerRole,
  isLoading,
  hasMore,
  onLoadMore,
  className,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  // Initial scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  // Handle scroll for load more
  const handleScroll = () => {
    if (!containerRef.current || isLoading || !hasMore) return;

    // Load more when scrolled to top
    if (containerRef.current.scrollTop < 100) {
      onLoadMore();
    }
  };

  // Group messages by date for date separators
  const getDateKey = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Determine if we should show avatar/timestamp for a message
  const getMessageDisplay = (message: DirectMessage, index: number, allMessages: DirectMessage[]) => {
    const prevMessage = index > 0 ? allMessages[index - 1] : null;
    const nextMessage = index < allMessages.length - 1 ? allMessages[index + 1] : null;

    const isOwn = message.sender_id === currentUserId;
    const prevIsSameSender = prevMessage?.sender_id === message.sender_id;
    const nextIsSameSender = nextMessage?.sender_id === message.sender_id;

    // Show avatar for first message in a cluster (only for other's messages)
    const showAvatar = !isOwn && !prevIsSameSender;

    // Show timestamp if next message is from different sender or more than 2 min later
    const timeDiff = nextMessage
      ? new Date(nextMessage.created_at).getTime() - new Date(message.created_at).getTime()
      : Infinity;
    const showTimestamp = !nextIsSameSender || timeDiff > 2 * 60 * 1000;

    // Determine delivery status
    let deliveryStatus: MessageDeliveryStatus = 'sent';
    if (isOwn) {
      if (message.is_read) {
        deliveryStatus = 'read';
      } else if (message.id.startsWith('temp-')) {
        deliveryStatus = 'sending';
      } else {
        deliveryStatus = 'delivered';
      }
    }

    return { isOwn, showAvatar, showTimestamp, deliveryStatus };
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={cn('flex-1 overflow-y-auto', className)}>
        <EmptyConversation participant={participant} viewerRole={viewerRole} />
      </div>
    );
  }

  // Group messages by date
  const messagesByDate: Record<string, DirectMessage[]> = {};
  messages.forEach(message => {
    const dateKey = getDateKey(message.created_at);
    if (!messagesByDate[dateKey]) {
      messagesByDate[dateKey] = [];
    }
    messagesByDate[dateKey].push(message);
  });

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('flex-1 overflow-y-auto px-4 py-4', className)}
      role="log"
      aria-live="polite"
    >
      {/* Load more indicator */}
      {isLoading && hasMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
        </div>
      )}

      {/* Messages grouped by date */}
      {Object.entries(messagesByDate).map(([dateKey, dateMessages]) => (
        <div key={dateKey}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
              {dateKey}
            </div>
          </div>

          {/* Messages for this date */}
          <div className="space-y-1">
            {dateMessages.map((message, index) => {
              const { isOwn, showAvatar, showTimestamp, deliveryStatus } = getMessageDisplay(
                message,
                messages.indexOf(message),
                messages
              );

              return (
                <MessageBubble
                  key={message.id}
                  message={{
                    ...message,
                    is_own_message: isOwn,
                    delivery_status: deliveryStatus,
                    show_avatar: showAvatar,
                    show_timestamp: showTimestamp,
                  }}
                  participant={participant}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Bottom anchor for auto-scroll */}
      <div ref={bottomRef} />
    </div>
  );
}
