import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FileProcessingStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  preview?: string;
  // Document processing fields
  processingStatus?: FileProcessingStatus;
  processingError?: string;
  documentId?: string; // Server-side document ID after processing
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: UploadedFile[];
  isStreaming?: boolean;
}

type StreamingState = 'idle' | 'submitting' | 'processing_attachments' | 'streaming' | 'complete' | 'error';

interface ChatState {
  // Messages
  messages: Message[];
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;

  // Input/Draft
  draft: string;
  setDraft: (draft: string) => void;

  // Attached files
  attachedFiles: UploadedFile[];
  addAttachedFile: (file: UploadedFile) => void;
  removeAttachedFile: (fileId: string) => void;
  updateAttachedFile: (fileId: string, updates: Partial<UploadedFile>) => void;
  clearAttachedFiles: () => void;

  // Streaming state
  streamingState: StreamingState;
  setStreamingState: (state: StreamingState) => void;
  currentStreamingMessageId: string | null;
  setCurrentStreamingMessageId: (id: string | null) => void;

  // UI state (legacy - keeping for backward compatibility)
  isTyping: boolean;
  setIsTyping: (isTyping: boolean) => void;

  isAnimatingResponse: boolean;
  setIsAnimatingResponse: (isAnimating: boolean) => void;

  typingText: string;
  setTypingText: (text: string) => void;

  typingStatus: string;
  setTypingStatus: (status: string) => void;

  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;

  // Auto scroll
  canAutoScroll: boolean;
  setCanAutoScroll: (canScroll: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Messages
      messages: [],
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message]
        })),
      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map(msg =>
            msg.id === id ? { ...msg, ...updates } : msg
          )
        })),
      clearMessages: () => set({ messages: [] }),

      // Input/Draft
      draft: '',
      setDraft: (draft) => set({ draft }),

      // Attached files (not persisted due to File objects)
      attachedFiles: [],
      addAttachedFile: (file) =>
        set((state) => ({
          attachedFiles: [...state.attachedFiles, file]
        })),
      removeAttachedFile: (fileId) =>
        set((state) => ({
          attachedFiles: state.attachedFiles.filter(f => f.id !== fileId)
        })),
      updateAttachedFile: (fileId, updates) =>
        set((state) => ({
          attachedFiles: state.attachedFiles.map(f =>
            f.id === fileId ? { ...f, ...updates } : f
          )
        })),
      clearAttachedFiles: () => set({ attachedFiles: [] }),

      // Streaming state (not persisted)
      streamingState: 'idle',
      setStreamingState: (streamingState) => set({ streamingState }),
      currentStreamingMessageId: null,
      setCurrentStreamingMessageId: (currentStreamingMessageId) => set({ currentStreamingMessageId }),

      // UI state (legacy - not persisted)
      isTyping: false,
      setIsTyping: (isTyping) => set({ isTyping }),

      isAnimatingResponse: false,
      setIsAnimatingResponse: (isAnimatingResponse) => set({ isAnimatingResponse }),

      typingText: '',
      setTypingText: (typingText) => set({ typingText }),

      typingStatus: '',
      setTypingStatus: (typingStatus) => set({ typingStatus }),

      showSuggestions: false,
      setShowSuggestions: (showSuggestions) => set({ showSuggestions }),

      // Auto scroll (not persisted)
      canAutoScroll: true,
      setCanAutoScroll: (canAutoScroll) => set({ canAutoScroll }),
    }),
    {
      name: 'chatnil-storage',
      partialize: (state) => ({
        // Only persist messages (last 30) and draft
        messages: state.messages.slice(-30).map(msg => ({
          ...msg,
          // Convert Date back to string for serialization
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
        })),
        draft: state.draft,
      }),
      onRehydrateStorage: () => (state) => {
        // Convert timestamp strings back to Date objects and clear streaming state
        if (state?.messages) {
          state.messages = state.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
            isStreaming: false // Reset streaming state on page reload
          }));
        }
        // Reset streaming state
        if (state) {
          state.streamingState = 'idle';
          state.currentStreamingMessageId = null;
        }
      }
    }
  )
);