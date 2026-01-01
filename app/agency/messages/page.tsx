'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessagingStore, setMessagingUserRole, setMessagingUserId } from '@/lib/stores/messaging';
import { ThreadList, ConversationView } from '@/components/messaging';
import type { ThreadListItem, ThreadParticipant } from '@/types/messaging';

export default function AgencyMessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    threads,
    isLoadingThreads,
    activeThreadId,
    fetchThreads,
    setActiveThread,
    startPolling,
    stopPolling,
  } = useMessagingStore();

  const [selectedParticipant, setSelectedParticipant] = useState<ThreadParticipant | null>(null);
  const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false);
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);

  // Redirect non-agencies
  useEffect(() => {
    if (user && user.role !== 'agency' && user.role !== 'business') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Set role, user ID and fetch threads on mount
  useEffect(() => {
    if (user?.id) {
      setMessagingUserRole('agency');
      setMessagingUserId(user.id);
      fetchThreads();
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [user?.id, fetchThreads, startPolling, stopPolling]);

  // Handle thread from URL query param (for "Message" button flow)
  useEffect(() => {
    const threadId = searchParams.get('thread');
    if (!threadId) {
      setPendingThreadId(null);
      return;
    }

    // Track that we're waiting for this thread
    if (pendingThreadId !== threadId) {
      setPendingThreadId(threadId);
    }

    // If threads are loaded, try to find and select
    if (threads.length > 0) {
      const thread = threads.find(t => t.id === threadId);
      if (thread) {
        // Inline thread selection to avoid dependency issues
        setActiveThread(thread.id);
        setSelectedParticipant(thread.participant);
        setIsMobileConversationOpen(true);
        setPendingThreadId(null);
        return;
      }
    }

    // If thread not found but we have a threadId, and threads finished loading, refetch once
    // This handles the race condition where navigation happens before store updates
    if (threadId && !isLoadingThreads && threads.length > 0 && pendingThreadId === threadId) {
      // Thread should be in the list but isn't - try refetching
      fetchThreads();
    }
  }, [searchParams, threads, isLoadingThreads, pendingThreadId, fetchThreads, setActiveThread]);

  // Don't render anything while checking role
  if (!user || (user.role !== 'agency' && user.role !== 'business')) {
    return null;
  }

  const handleThreadSelect = (thread: ThreadListItem) => {
    setActiveThread(thread.id);
    setSelectedParticipant(thread.participant);
    setIsMobileConversationOpen(true);
  };

  const handleBack = () => {
    setActiveThread(null);
    setSelectedParticipant(null);
    setIsMobileConversationOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Thread list - hidden on mobile when conversation is open */}
      <div
        className={`
          w-full md:w-[360px] lg:w-[400px] flex-shrink-0 border-r border-gray-200
          ${isMobileConversationOpen ? 'hidden md:block' : 'block'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-200 bg-white">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {threads.length} conversation{threads.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Thread list */}
          <ThreadList
            threads={threads}
            activeThreadId={activeThreadId}
            onThreadSelect={handleThreadSelect}
            isLoading={isLoadingThreads}
            viewerRole="agency"
            className="flex-1"
          />
        </div>
      </div>

      {/* Conversation view - full screen on mobile */}
      <div
        className={`
          flex-1 flex flex-col
          ${!isMobileConversationOpen ? 'hidden md:flex' : 'flex'}
        `}
      >
        {activeThreadId && selectedParticipant ? (
          <ConversationView
            threadId={activeThreadId}
            participant={selectedParticipant}
            currentUserId={user.id}
            viewerRole="agency"
            onBack={handleBack}
            showBackButton={isMobileConversationOpen}
          />
        ) : threads.length === 0 ? (
          // Empty inbox state - no conversations at all
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-500 max-w-sm mb-6">
                Start connecting with athletes on the Discover page to begin conversations.
              </p>
              <Link
                href="/agency/discover"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                Discover Athletes
              </Link>
            </div>
          </div>
        ) : (
          // Conversations exist but none selected
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 max-w-sm">
                Choose a conversation from the list to continue messaging.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
