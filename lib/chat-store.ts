/**
 * Chat Store - Streaming State Management
 *
 * Minimal store for managing streaming state during AI responses.
 * The main chat data is managed by chat-history-store.ts
 */

import { create } from 'zustand';

type StreamingState = 'idle' | 'streaming' | 'complete' | 'error';

interface ChatStoreState {
  streamingState: StreamingState;
  currentStreamingMessageId: string | null;

  // Actions
  setStreamingState: (state: StreamingState) => void;
  setCurrentStreamingMessageId: (messageId: string | null) => void;
}

export const useChatStore = create<ChatStoreState>()((set) => ({
  streamingState: 'idle',
  currentStreamingMessageId: null,

  setStreamingState: (state) => set({ streamingState: state }),
  setCurrentStreamingMessageId: (messageId) => set({ currentStreamingMessageId: messageId }),
}));

// Re-export Message type from chat-history-store for backwards compatibility
export type { Message } from './chat-history-store';
