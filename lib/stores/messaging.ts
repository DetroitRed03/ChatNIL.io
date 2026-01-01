/**
 * Messaging Store
 * Zustand state management for direct messaging
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  MessagingStore,
  ThreadListItem,
  DirectMessage,
  MessageAttachment,
  DEFAULT_POLL_CONFIG,
} from '@/types/messaging';

// Polling intervals
const POLL_INTERVALS = {
  active: 3000,      // 3 seconds when viewing conversation
  inbox: 15000,      // 15 seconds when viewing inbox
  background: 60000, // 60 seconds when tab in background
};

interface PollingState {
  intervalId: NodeJS.Timeout | null;
  isBackground: boolean;
}

const pollingState: PollingState = {
  intervalId: null,
  isBackground: false,
};

// Helper to determine API base path based on user role
let currentUserRole: 'agency' | 'athlete' | null = null;
let currentUserId: string | null = null;

export const setMessagingUserRole = (role: 'agency' | 'athlete') => {
  currentUserRole = role;
};

export const setMessagingUserId = (userId: string) => {
  currentUserId = userId;
};

const getApiBasePath = () => {
  return currentUserRole === 'agency' ? '/api/agency/messages' : '/api/messages';
};

// Helper to get common headers including X-User-ID for auth fallback
const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {};
  if (currentUserId) {
    headers['X-User-ID'] = currentUserId;
  }
  return headers;
};

export const useMessagingStore = create<MessagingStore>()(
  devtools(
    (set, get) => ({
      // ============================================
      // INITIAL STATE
      // ============================================
      threads: [],
      activeThreadId: null,
      messages: {},
      isLoadingThreads: false,
      isLoadingMessages: false,
      isSending: false,
      hasMoreMessages: {},
      error: null,
      totalUnread: 0,

      // ============================================
      // THREAD ACTIONS
      // ============================================

      fetchThreads: async () => {
        set({ isLoadingThreads: true, error: null });

        try {
          const response = await fetch(`${getApiBasePath()}/threads`, {
            credentials: 'include',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch threads');
          }

          const data = await response.json();

          set({
            threads: data.threads || [],
            totalUnread: data.total_unread || 0,
            isLoadingThreads: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load conversations',
            isLoadingThreads: false,
          });
        }
      },

      setActiveThread: (threadId: string | null) => {
        set({ activeThreadId: threadId });

        // Mark as read when opening a thread
        if (threadId) {
          get().markAsRead(threadId);
        }
      },

      startConversation: async (athleteUserId: string): Promise<string> => {
        set({ error: null });

        try {
          const response = await fetch(`${getApiBasePath()}/threads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            credentials: 'include',
            body: JSON.stringify({ athlete_user_id: athleteUserId }),
          });

          if (!response.ok) {
            throw new Error('Failed to start conversation');
          }

          const data = await response.json();
          const threadId = data.thread.id;

          // Refresh threads to include the new one
          await get().fetchThreads();

          return threadId;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to start conversation',
          });
          throw error;
        }
      },

      // ============================================
      // MESSAGE ACTIONS
      // ============================================

      fetchMessages: async (threadId: string, loadMore = false) => {
        set({ isLoadingMessages: true, error: null });

        try {
          const existingMessages = get().messages[threadId] || [];
          const cursor = loadMore && existingMessages.length > 0
            ? existingMessages[existingMessages.length - 1].created_at
            : undefined;

          const url = `${getApiBasePath()}/threads/${threadId}${cursor ? `?before=${cursor}` : ''}`;
          const response = await fetch(url, {
            credentials: 'include',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch messages');
          }

          const data = await response.json();
          const newMessages = data.messages || [];

          set((state) => ({
            messages: {
              ...state.messages,
              [threadId]: loadMore
                ? [...existingMessages, ...newMessages]
                : newMessages,
            },
            hasMoreMessages: {
              ...state.hasMoreMessages,
              [threadId]: data.has_more || false,
            },
            isLoadingMessages: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load messages',
            isLoadingMessages: false,
          });
        }
      },

      sendMessage: async (
        threadId: string,
        text: string,
        attachments?: MessageAttachment[]
      ) => {
        set({ isSending: true, error: null });

        // Optimistic update - create temp message
        const tempId = `temp-${Date.now()}`;
        const tempMessage: DirectMessage = {
          id: tempId,
          thread_id: threadId,
          agency_user_id: '', // Will be filled by server
          athlete_user_id: '',
          sender_id: '', // Will be filled by server
          message_text: text,
          attachments: attachments || null,
          is_read: false,
          read_at: null,
          created_at: new Date().toISOString(),
        };

        // Add temp message immediately
        set((state) => ({
          messages: {
            ...state.messages,
            [threadId]: [tempMessage, ...(state.messages[threadId] || [])],
          },
        }));

        try {
          const response = await fetch(`${getApiBasePath()}/threads/${threadId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            credentials: 'include',
            body: JSON.stringify({ message_text: text, attachments }),
          });

          if (!response.ok) {
            throw new Error('Failed to send message');
          }

          const data = await response.json();
          const realMessage = data.message;

          // Replace temp message with real one
          set((state) => ({
            messages: {
              ...state.messages,
              [threadId]: state.messages[threadId]?.map((msg) =>
                msg.id === tempId ? realMessage : msg
              ) || [realMessage],
            },
            isSending: false,
          }));

          // Update thread's last message
          get().updateThreadLastMessage(threadId, realMessage);

        } catch (error) {
          // Remove temp message on error
          set((state) => ({
            messages: {
              ...state.messages,
              [threadId]: state.messages[threadId]?.filter((msg) => msg.id !== tempId) || [],
            },
            error: error instanceof Error ? error.message : 'Failed to send message',
            isSending: false,
          }));
        }
      },

      markAsRead: async (threadId: string) => {
        try {
          const response = await fetch(`${getApiBasePath()}/threads/${threadId}/read`, {
            method: 'POST',
            credentials: 'include',
            headers: getAuthHeaders(),
          });

          if (response.ok) {
            // Update local unread count
            get().decrementUnread(threadId);
          }
        } catch {
          // Silent fail for mark as read
        }
      },

      // ============================================
      // REAL-TIME UPDATES
      // ============================================

      addMessage: (message: DirectMessage) => {
        set((state) => {
          const threadMessages = state.messages[message.thread_id] || [];

          // Check if message already exists
          if (threadMessages.some((m) => m.id === message.id)) {
            return state;
          }

          return {
            messages: {
              ...state.messages,
              [message.thread_id]: [message, ...threadMessages],
            },
          };
        });
      },

      updateThreadLastMessage: (threadId: string, message: DirectMessage) => {
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  last_message: message.message_text,
                  updated_at: message.created_at,
                  is_own_last_message: true,
                }
              : thread
          ).sort((a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          ),
        }));
      },

      // ============================================
      // UNREAD COUNT
      // ============================================

      fetchUnreadCount: async () => {
        try {
          const response = await fetch(`${getApiBasePath()}/unread-count`, {
            credentials: 'include',
            headers: getAuthHeaders(),
          });

          if (response.ok) {
            const data = await response.json();
            set({ totalUnread: data.count || 0 });
          }
        } catch {
          // Silent fail for unread count
        }
      },

      decrementUnread: (threadId: string) => {
        set((state) => {
          const thread = state.threads.find((t) => t.id === threadId);
          const unreadToRemove = thread?.unread_count || 0;

          return {
            totalUnread: Math.max(0, state.totalUnread - unreadToRemove),
            threads: state.threads.map((t) =>
              t.id === threadId ? { ...t, unread_count: 0 } : t
            ),
          };
        });
      },

      // ============================================
      // POLLING
      // ============================================

      startPolling: (threadId?: string) => {
        // Clear any existing polling
        get().stopPolling();

        // Set up visibility change listener
        const handleVisibilityChange = () => {
          pollingState.isBackground = document.hidden;
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Determine interval based on context
        const getInterval = () => {
          if (pollingState.isBackground) return POLL_INTERVALS.background;
          if (threadId) return POLL_INTERVALS.active;
          return POLL_INTERVALS.inbox;
        };

        // Poll function
        const poll = async () => {
          if (threadId) {
            await get().fetchMessages(threadId);
          } else {
            await get().fetchThreads();
          }
        };

        // Start polling with dynamic interval
        const runPoll = () => {
          poll();
          pollingState.intervalId = setTimeout(runPoll, getInterval());
        };

        pollingState.intervalId = setTimeout(runPoll, getInterval());
      },

      stopPolling: () => {
        if (pollingState.intervalId) {
          clearTimeout(pollingState.intervalId);
          pollingState.intervalId = null;
        }
      },

      // ============================================
      // ERROR HANDLING
      // ============================================

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'messaging-store' }
  )
);

// ============================================
// SELECTORS
// ============================================

export const selectActiveThread = (state: MessagingStore) =>
  state.threads.find((t) => t.id === state.activeThreadId);

export const selectActiveMessages = (state: MessagingStore) =>
  state.activeThreadId ? state.messages[state.activeThreadId] || [] : [];

export const selectUnreadCount = (state: MessagingStore) =>
  state.totalUnread;

export const selectHasUnread = (state: MessagingStore) =>
  state.totalUnread > 0;
