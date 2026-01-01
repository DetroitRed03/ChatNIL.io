'use client';

import { useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMessagingStore } from '@/lib/stores/messaging';
import { ConversationHeader } from './ConversationHeader';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import type { ThreadParticipant } from '@/types/messaging';

interface ConversationViewProps {
  threadId: string;
  participant: ThreadParticipant;
  currentUserId: string;
  viewerRole: 'agency' | 'athlete';
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

/**
 * Full conversation view with:
 * - Header (participant info + back button)
 * - Message list
 * - Composer
 * - Polling for new messages
 * - Mark as read on view
 */
export function ConversationView({
  threadId,
  participant,
  currentUserId,
  viewerRole,
  onBack,
  showBackButton = false,
  className,
}: ConversationViewProps) {
  const {
    messages,
    isLoadingMessages,
    isSending,
    hasMoreMessages,
    fetchMessages,
    sendMessage,
    markAsRead,
    startPolling,
    stopPolling,
  } = useMessagingStore();

  const threadMessages = messages[threadId] || [];
  const hasMore = hasMoreMessages[threadId] ?? true;

  // Fetch messages and start polling on mount
  useEffect(() => {
    fetchMessages(threadId);
    startPolling(threadId);

    return () => {
      stopPolling();
    };
  }, [threadId, fetchMessages, startPolling, stopPolling]);

  // Mark as read when viewing
  useEffect(() => {
    if (threadMessages.length > 0) {
      markAsRead(threadId);
    }
  }, [threadId, threadMessages.length, markAsRead]);

  // Handle send message
  const handleSend = useCallback(async (text: string) => {
    await sendMessage(threadId, text);
  }, [threadId, sendMessage]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMessages && hasMore) {
      fetchMessages(threadId, true);
    }
  }, [threadId, isLoadingMessages, hasMore, fetchMessages]);

  // Build profile URL based on role
  const profileUrl = participant.role === 'athlete'
    ? `/athletes/${participant.id}`
    : `/brands/${participant.id}`;

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <ConversationHeader
        participant={participant}
        onBack={onBack}
        showBackButton={showBackButton}
        profileUrl={profileUrl}
      />

      {/* Messages */}
      {isLoadingMessages && threadMessages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : (
        <MessageList
          messages={threadMessages}
          currentUserId={currentUserId}
          participant={participant}
          viewerRole={viewerRole}
          isLoading={isLoadingMessages}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      )}

      {/* Composer */}
      <MessageComposer
        onSend={handleSend}
        disabled={isSending}
        placeholder={`Message ${participant.display_name}...`}
      />
    </div>
  );
}
