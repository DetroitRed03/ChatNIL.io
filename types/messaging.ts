/**
 * Direct Messaging Types
 * Agency ↔ Athlete communication
 */

// ============================================
// DATABASE TYPES (match Supabase schema)
// ============================================

export interface MessageThread {
  id: string;
  agency_id: string;      // References users.id
  athlete_id: string;     // References users.id
  status: 'active' | 'sent' | 'archived' | 'blocked';
  last_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface DirectMessage {
  id: string;
  thread_id: string;
  agency_user_id: string;
  athlete_user_id: string;
  sender_id: string;
  message_text: string;
  attachments: MessageAttachment[] | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface MessageAttachment {
  type: 'image' | 'document' | 'link';
  url: string;
  name?: string;
  size?: number;
  mime_type?: string;
}

// ============================================
// DISPLAY TYPES (for UI components)
// ============================================

export interface ThreadParticipant {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: 'agency' | 'athlete';
  // Agency-specific
  company_name?: string;
  industry?: string;
  // Athlete-specific
  sport?: string;
  school?: string;
  is_verified?: boolean;
}

export interface ThreadListItem extends MessageThread {
  // Computed for display
  participant: ThreadParticipant;
  unread_count: number;
  is_own_last_message: boolean;
}

export interface MessageBubbleData extends DirectMessage {
  // Computed for display
  is_own_message: boolean;
  delivery_status: 'sending' | 'sent' | 'delivered' | 'read';
  show_avatar: boolean;
  show_timestamp: boolean;
}

export interface ConversationData {
  thread: MessageThread;
  participant: ThreadParticipant;
  messages: DirectMessage[];
  has_more: boolean;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateThreadRequest {
  athlete_user_id: string;
}

export interface CreateThreadResponse {
  thread: MessageThread;
  is_new: boolean;
}

export interface SendMessageRequest {
  message_text: string;
  attachments?: MessageAttachment[];
}

export interface SendMessageResponse {
  message: DirectMessage;
}

export interface GetThreadsResponse {
  threads: ThreadListItem[];
  total_unread: number;
}

export interface GetMessagesResponse {
  messages: DirectMessage[];
  has_more: boolean;
  cursor?: string;
}

export interface MarkReadResponse {
  success: boolean;
  messages_marked: number;
}

// ============================================
// STORE TYPES (Zustand state)
// ============================================

export interface MessagingState {
  // Data
  threads: ThreadListItem[];
  activeThreadId: string | null;
  messages: Record<string, DirectMessage[]>;  // threadId -> messages

  // Loading states
  isLoadingThreads: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;

  // Pagination
  hasMoreMessages: Record<string, boolean>;

  // Errors
  error: string | null;

  // Total unread count (for nav badge)
  totalUnread: number;
}

export interface MessagingActions {
  // Thread actions
  fetchThreads: () => Promise<void>;
  setActiveThread: (threadId: string | null) => void;
  startConversation: (athleteUserId: string) => Promise<string>;

  // Message actions
  fetchMessages: (threadId: string, loadMore?: boolean) => Promise<void>;
  sendMessage: (threadId: string, text: string, attachments?: MessageAttachment[]) => Promise<void>;
  markAsRead: (threadId: string) => Promise<void>;

  // Real-time updates
  addMessage: (message: DirectMessage) => void;
  updateThreadLastMessage: (threadId: string, message: DirectMessage) => void;

  // Unread count
  fetchUnreadCount: () => Promise<void>;
  decrementUnread: (threadId: string) => void;

  // Polling
  startPolling: (threadId?: string) => void;
  stopPolling: () => void;

  // Error handling
  clearError: () => void;
}

export type MessagingStore = MessagingState & MessagingActions;

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface ThreadItemProps {
  thread: ThreadListItem;
  isActive: boolean;
  onClick: () => void;
}

export interface MessageBubbleProps {
  message: MessageBubbleData;
  onRetry?: () => void;
}

export interface MessageComposerProps {
  onSend: (text: string, attachments?: MessageAttachment[]) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export interface ConversationHeaderProps {
  participant: ThreadParticipant;
  threadStatus: MessageThread['status'];
  onBack?: () => void;
  onViewProfile?: () => void;
}

export interface ThreadListProps {
  threads: ThreadListItem[];
  activeThreadId: string | null;
  onThreadSelect: (thread: ThreadListItem) => void;
  isLoading: boolean;
  emptyMessage?: string;
}

export interface ConversationViewProps {
  threadId: string;
  viewerRole: 'agency' | 'athlete';
}

// ============================================
// UTILITY TYPES
// ============================================

export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface PollConfig {
  activeInterval: number;    // When viewing conversation
  inboxInterval: number;     // When viewing inbox list
  backgroundInterval: number; // When tab is in background
}

export const DEFAULT_POLL_CONFIG: PollConfig = {
  activeInterval: 3000,      // 3 seconds
  inboxInterval: 15000,      // 15 seconds
  backgroundInterval: 60000, // 60 seconds
};
