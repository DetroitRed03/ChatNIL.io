import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chatPersistence } from './chat-persistence';

// Message type definition (previously in chat-store.ts)
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name?: string;
    mimeType?: string;
  }>;
  isStreaming?: boolean;
}

// Debounce helper for localStorage saves during streaming
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingSave: { name: string; value: any } | null = null;

const debouncedSave = (name: string, value: any) => {
  pendingSave = { name, value };

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    if (pendingSave) {
      try {
        const stringValue = typeof pendingSave.value === 'string'
          ? pendingSave.value
          : JSON.stringify(pendingSave.value);
        localStorage.setItem(pendingSave.name, stringValue);
        // Reduced logging - only log occasionally, not every save
        console.log('💾 ChatStore: Debounced save complete');
      } catch (error) {
        console.error('❌ ChatStore: Error in debounced save:', error);
      }
      pendingSave = null;
    }
    saveTimeout = null;
  }, 500); // 500ms debounce - saves at most twice per second
};

export type RoleContext = 'athlete' | 'parent' | 'coach';

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  roleContext: RoleContext;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  draft?: string;
}

export interface ChatHistoryState {
  // Chat management
  chats: Chat[];
  activeChatId: string | null;
  sidebarCollapsed: boolean;
  searchQuery: string;

  // Global draft for ephemeral (no active chat) state
  globalDraft: string;

  // User context for data isolation
  currentUserId: string | null;

  // Actions
  newChat: (roleContext?: RoleContext) => string;
  beginDraft: () => void;
  createChatWithFirstMessage: (content: string, roleContext?: RoleContext) => string;
  setActiveChat: (chatId: string) => void;
  addMessageToChat: (chatId: string, message: Message) => void;
  updateChatMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  editMessage: (chatId: string, messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  regenerateMessage: (chatId: string, messageId: string) => Promise<void>;
  setChatDraft: (chatId: string, draft: string) => void;
  setDraft: (draft: string | null) => void;
  getDraft: () => string;
  renameChat: (chatId: string, title: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  togglePin: (chatId: string) => void;
  archiveChat: (chatId: string) => void;
  clearChatMessages: (chatId: string) => void;

  // User management actions
  setUserId: (userId: string | null) => void;
  clearAllChats: () => void;
  clearUserStorage: (userId?: string) => void;
  resetSidebarState: () => void;

  // UI actions
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;

  // Import/Export
  exportChats: () => string;
  importChats: (data: string) => boolean;

  // Database sync
  loadChatsFromDatabase: (userId: string) => Promise<boolean>;
  syncChatToDatabase: (chatId: string, userId: string) => Promise<boolean>;
  syncAllToDatabase: (userId: string) => Promise<boolean>;

  // Getters
  getActiveChat: () => Chat | null;
  getFilteredChats: () => Chat[];
}

// Utility functions
export function makeTitle(firstUserMessage: string): string {
  if (!firstUserMessage.trim()) {
    return `New Chat ${new Date().toLocaleDateString()}`;
  }

  // Clean the message and take first 50 characters
  const cleaned = firstUserMessage.trim().replace(/\s+/g, ' ');
  return cleaned.length > 50 ? cleaned.slice(0, 47) + '...' : cleaned;
}

function generateChatId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createNewChat(roleContext: RoleContext = 'athlete'): Chat {
  const now = new Date();
  return {
    id: generateChatId(),
    title: 'New Chat',
    messages: [],
    roleContext,
    isPinned: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    draft: ''
  };
}

function sortChats(chats: Chat[]): Chat[] {
  // Sort: pinned first (by updatedAt desc), then unpinned (by updatedAt desc)
  return [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export const useChatHistoryStore = create<ChatHistoryState>()(
  persist(
    (set, get) => ({
      // Initial state
      chats: [],
      activeChatId: null,
      sidebarCollapsed: false, // Force expanded by default
      searchQuery: '',
      globalDraft: '',
      currentUserId: null,

      // Chat management actions
      newChat: (roleContext = 'athlete') => {
        const newChat = createNewChat(roleContext);
        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChatId: newChat.id
        }));
        return newChat.id;
      },

      beginDraft: () => {
        set({ activeChatId: null, globalDraft: '' });
      },

      createChatWithFirstMessage: (content: string, roleContext = 'athlete') => {
        const newChat = createNewChat(roleContext);
        const firstMessage: Message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content,
          role: 'user',
          timestamp: new Date()
        };

        newChat.messages = [firstMessage];
        newChat.title = makeTitle(content);

        const tempChatId = newChat.id; // Store original temp ID

        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChatId: newChat.id,
          globalDraft: ''
        }));

        // SYNC TO DATABASE IMMEDIATELY
        const { currentUserId } = get();
        if (currentUserId) {
          (async () => {
            try {
              const response = await fetch('/api/chat/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: currentUserId,
                  title: newChat.title
                })
              });

              if (response.ok) {
                const { session } = await response.json();

                // Get current chat state with any additional messages that may have been added
                const currentState = get();
                const currentChat = currentState.chats.find(c => c.id === tempChatId);
                const allMessages = currentChat?.messages || [firstMessage];

                // Update local chat with DB UUID
                set((state) => ({
                  chats: state.chats.map(chat =>
                    chat.id === tempChatId ? { ...chat, id: session.id } : chat
                  ),
                  activeChatId: state.activeChatId === tempChatId ? session.id : state.activeChatId
                }));

                // Now sync ALL messages to the database (not just the first one)
                // This handles the case where AI response was added while waiting for session creation
                for (const msg of allMessages) {
                  if (msg.content && msg.content.trim()) {
                    try {
                      await fetch('/api/chat/messages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: currentUserId,
                          session_id: session.id,
                          content: msg.content,
                          role: msg.role
                        })
                      });
                    } catch (msgErr) {
                      // Silent fail - localStorage has the data
                    }
                  }
                }
              }
            } catch (err) {
              console.error('❌ Failed to create session in database:', err);
            }
          })();
        }

        return tempChatId;
      },

      setActiveChat: (chatId) => {
        const chat = get().chats.find(c => c.id === chatId);
        if (chat && !chat.isArchived) {
          set({ activeChatId: chatId });
        }
      },

      addMessageToChat: (chatId, message) => {
        set((state) => {
          const chats = state.chats.map(chat => {
            if (chat.id === chatId) {
              const updatedChat = {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: new Date()
              };

              // Auto-generate title from first user message
              if (chat.messages.length === 0 && message.role === 'user') {
                updatedChat.title = makeTitle(message.content);
              }

              return updatedChat;
            }
            return chat;
          });

          return { chats: sortChats(chats) };
        });

        // Sync just this message to database in the background (non-blocking)
        const { currentUserId } = get();
        if (currentUserId) {
          // Check if this chat is from DB (UUID format)
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chatId);

          if (isUUID) {
            // Chat exists in DB, just add the new message (silent)
            fetch('/api/chat/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentUserId,
                session_id: chatId,
                role: message.role,
                content: message.content
              })
            }).catch(() => {
              // Silent fail - localStorage has the data
            });
          }
          // For local temp IDs, messages sync when session is created in createChatWithFirstMessage
        }
      },

      updateChatMessage: (chatId, messageId, updates) => {
        set((state) => ({
          chats: state.chats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === messageId ? { ...msg, ...updates } : msg
                ),
                updatedAt: new Date()
              };
            }
            return chat;
          })
        }));
      },

      editMessage: async (chatId, messageId, newContent) => {
        const userId = get().currentUserId;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        // 🚀 OPTIMISTIC UPDATE: Save old content for rollback
        const currentChat = get().chats.find(c => c.id === chatId);
        const currentMessage = currentChat?.messages.find(m => m.id === messageId);
        const oldContent = currentMessage?.content;

        if (!currentMessage) {
          console.warn('⚠️ Message not found for editing:', messageId);
          return;
        }

        console.log('💾 Optimistically updating message:', messageId);

        // Update UI immediately
        set((state) => ({
          chats: state.chats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.map(msg =>
                  msg.id === messageId ? { ...msg, content: newContent } : msg
                ),
                updatedAt: new Date()
              };
            }
            return chat;
          })
        }));

        console.log('✅ Message updated optimistically');

        // Sync to database (for DB-backed chats)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chatId);
        if (isUUID) {
          try {
            console.log('📤 Syncing message edit to database');
            const response = await fetch(`/api/chat/sessions/${chatId}/messages`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                messageId,
                content: newContent
              })
            });

            if (!response.ok) {
              console.error('❌ Failed to update message in database, rolling back');

              // 🔄 ROLLBACK: Restore old content
              set((state) => ({
                chats: state.chats.map(chat => {
                  if (chat.id === chatId) {
                    return {
                      ...chat,
                      messages: chat.messages.map(msg =>
                        msg.id === messageId ? { ...msg, content: oldContent || '' } : msg
                      ),
                      updatedAt: new Date()
                    };
                  }
                  return chat;
                })
              }));
              throw new Error('Failed to update message');
            }

            console.log('✅ Message edit synced to database');
          } catch (error) {
            console.error('💥 Error updating message:', error);
            throw error;
          }
        }
      },

      deleteMessage: async (chatId, messageId) => {
        const userId = get().currentUserId;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        // 🚀 OPTIMISTIC UPDATE: Save message for rollback
        const currentChat = get().chats.find(c => c.id === chatId);
        const deletedMessage = currentChat?.messages.find(m => m.id === messageId);
        const messageIndex = currentChat?.messages.findIndex(m => m.id === messageId) ?? -1;

        if (!deletedMessage) {
          console.warn('⚠️ Message not found for deletion:', messageId);
          return;
        }

        console.log('💾 Optimistically deleting message:', messageId);

        // Remove from UI immediately
        set((state) => ({
          chats: state.chats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.filter(msg => msg.id !== messageId),
                updatedAt: new Date()
              };
            }
            return chat;
          })
        }));

        console.log('✅ Message deleted optimistically');

        // Sync to database (for DB-backed chats)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chatId);
        if (isUUID) {
          try {
            console.log('📤 Syncing message deletion to database');
            const response = await fetch(`/api/chat/sessions/${chatId}/messages/${messageId}?userId=${userId}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              console.error('❌ Failed to delete message from database, rolling back');

              // 🔄 ROLLBACK: Restore deleted message at original position
              set((state) => ({
                chats: state.chats.map(chat => {
                  if (chat.id === chatId) {
                    const messages = [...chat.messages];
                    messages.splice(messageIndex, 0, deletedMessage);
                    return {
                      ...chat,
                      messages,
                      updatedAt: new Date()
                    };
                  }
                  return chat;
                })
              }));
              throw new Error('Failed to delete message');
            }

            console.log('✅ Message deletion synced to database');
          } catch (error) {
            console.error('💥 Error deleting message:', error);
            throw error;
          }
        }
      },

      regenerateMessage: async (chatId, messageId) => {
        const userId = get().currentUserId;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        // Find the message to regenerate and the previous user message
        const currentChat = get().chats.find(c => c.id === chatId);
        const messageIndex = currentChat?.messages.findIndex(m => m.id === messageId) ?? -1;
        const messageToRegenerate = currentChat?.messages[messageIndex];

        if (!messageToRegenerate || messageToRegenerate.role !== 'assistant') {
          console.warn('⚠️ Can only regenerate assistant messages');
          return;
        }

        // Find the previous user message (the prompt for this AI response)
        const userMessageIndex = messageIndex - 1;
        const userMessage = currentChat?.messages[userMessageIndex];

        if (!userMessage || userMessage.role !== 'user') {
          console.warn('⚠️ No user message found before assistant message');
          return;
        }

        console.log('🔄 Regenerating message:', messageId);

        // 🚀 OPTIMISTIC UPDATE: Mark message as regenerating
        set((state) => ({
          chats: state.chats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.map((msg, idx) =>
                  idx === messageIndex ? { ...msg, content: '', isStreaming: true } : msg
                ),
                updatedAt: new Date()
              };
            }
            return chat;
          })
        }));

        // This function needs to be called from the UI component that has access to the sendMessage function
        // For now, we'll just mark it as ready for regeneration
        // The actual API call should be handled in the chat interface component

        console.log('✅ Message marked for regeneration');
      },

      setChatDraft: (chatId, draft) => {
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, draft, updatedAt: new Date() } : chat
          )
        }));
      },

      setDraft: (draft) => {
        const { activeChatId } = get();
        if (activeChatId === null) {
          // No active chat - use global draft
          set({ globalDraft: draft || '' });
        } else {
          // Active chat - use chat-specific draft
          set((state) => ({
            chats: state.chats.map(chat =>
              chat.id === activeChatId ? { ...chat, draft: draft || '', updatedAt: new Date() } : chat
            )
          }));
        }
      },

      getDraft: () => {
        const { activeChatId, chats, globalDraft } = get();
        if (activeChatId === null) {
          return globalDraft;
        }
        const activeChat = chats.find(chat => chat.id === activeChatId);
        return activeChat?.draft || '';
      },

      renameChat: async (chatId, title) => {
        const trimmedTitle = title.trim() || 'Untitled Chat';
        const userId = get().currentUserId;
        console.log('🔄 renameChat called:', { chatId, userId, oldTitle: get().chats.find(c => c.id === chatId)?.title, newTitle: trimmedTitle });

        // 🚀 OPTIMISTIC UPDATE: Update UI immediately for instant feedback
        const oldTitle = get().chats.find(c => c.id === chatId)?.title;
        console.log('💾 Optimistically updating local state with new title:', trimmedTitle);
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, title: trimmedTitle, updatedAt: new Date() } : chat
          )
        }));
        console.log('✅ Local state updated optimistically');

        // Then sync to database in the background
        if (userId) {
          try {
            console.log('📤 Syncing rename to database (background)');
            const response = await fetch(`/api/chat/sessions/rename`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              cache: 'no-store',
              body: JSON.stringify({ chatId, title: trimmedTitle, userId })
            });

            console.log('📡 POST response status:', response.status);

            if (!response.ok) {
              const errorText = await response.text();
              console.error('❌ Failed to rename chat in database, rolling back:', errorText);

              // 🔄 ROLLBACK: Restore old title on failure
              set((state) => ({
                chats: state.chats.map(chat =>
                  chat.id === chatId ? { ...chat, title: oldTitle || 'Untitled Chat', updatedAt: new Date() } : chat
                )
              }));
              throw new Error('Failed to rename chat');
            } else {
              const result = await response.json();
              console.log('✅ Successfully synced rename to database:', chatId, result);
            }
          } catch (error) {
            console.error('💥 Error renaming chat in database:', error);
            throw error;
          }
        } else {
          console.warn('⚠️ No userId available, skipping database sync for rename');
        }
      },

      deleteChat: async (chatId) => {
        const userId = get().currentUserId;

        if (!userId) {
          throw new Error('User not authenticated');
        }

        // 🚀 OPTIMISTIC UPDATE: Save current state for potential rollback
        const currentState = get();
        const deletedChat = currentState.chats.find(c => c.id === chatId);
        const oldActiveChatId = currentState.activeChatId;

        if (!deletedChat) {
          console.warn('⚠️ Chat not found for deletion:', chatId);
          return;
        }

        console.log('💾 Optimistically deleting chat from UI:', chatId);

        // Remove from UI immediately
        set((state) => {
          const newChats = state.chats.filter(chat => chat.id !== chatId);
          const newActiveChatId = state.activeChatId === chatId
            ? (newChats.length > 0 ? newChats[0].id : null)
            : state.activeChatId;

          return {
            chats: newChats,
            activeChatId: newActiveChatId
          };
        });

        console.log('✅ Chat removed from UI optimistically');

        // Then delete from database in the background
        try {
          console.log('📤 Syncing delete to database (background)');
          const response = await fetch(`/api/chat/sessions/${chatId}?userId=${userId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Failed to delete chat from database, rolling back:', errorText);

            // 🔄 ROLLBACK: Restore deleted chat on failure
            set((state) => ({
              chats: sortChats([...state.chats, deletedChat]),
              activeChatId: oldActiveChatId
            }));
            throw new Error('Failed to delete chat. Please try again.');
          }

          console.log('✅ Successfully synced delete to database:', chatId);
        } catch (error) {
          console.error('💥 Error deleting chat from database:', error);
          throw error;
        }
      },

      togglePin: (chatId) => {
        // 🚀 OPTIMISTIC UPDATE: Update UI immediately
        const currentChat = get().chats.find(c => c.id === chatId);
        const newPinnedState = currentChat ? !currentChat.isPinned : false;

        console.log('💾 Optimistically toggling pin for chat:', chatId, 'to', newPinnedState);
        set((state) => {
          const chats = state.chats.map(chat =>
            chat.id === chatId ? { ...chat, isPinned: newPinnedState, updatedAt: new Date() } : chat
          );
          return { chats: sortChats(chats) };
        });

        // Sync to database in the background (if needed in future)
        // For now, pin state is local-only, but this can be extended
        console.log('✅ Pin toggled optimistically');
      },

      archiveChat: (chatId) => {
        // 🚀 OPTIMISTIC UPDATE: Update UI immediately
        console.log('💾 Optimistically archiving chat:', chatId);

        const oldActiveChatId = get().activeChatId;

        set((state) => {
          const chats = state.chats.map(chat =>
            chat.id === chatId ? { ...chat, isArchived: true, updatedAt: new Date() } : chat
          );
          const newActiveChatId = state.activeChatId === chatId
            ? (chats.find(c => !c.isArchived)?.id || null)
            : state.activeChatId;

          return {
            chats: chats,
            activeChatId: newActiveChatId
          };
        });

        console.log('✅ Chat archived optimistically');

        // Sync to database in the background (if needed in future)
        // For now, archive state is local-only, but this can be extended
      },

      clearChatMessages: (chatId) => {
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, messages: [], updatedAt: new Date() } : chat
          )
        }));
      },

      // User management actions
      setUserId: (userId) => {
        console.log('🔄 ChatStore: Setting user ID to:', userId);

        const currentState = get();
        console.log('👤 ChatStore: Current state:', {
          currentUserId: currentState.currentUserId,
          newUserId: userId,
          chatsCount: currentState.chats.length
        });

        // Only clear chats if explicitly switching users (not on initial load)
        // If currentUserId is null and userId is set, this is likely initial load - don't clear
        const isUserSwitch = currentState.currentUserId && currentState.currentUserId !== userId;

        if (isUserSwitch) {
          console.warn('👤 ChatStore: User switched from', currentState.currentUserId, 'to', userId, '- clearing chats');
          set({
            chats: [],
            activeChatId: null,
            globalDraft: '',
            searchQuery: '',
            currentUserId: userId,
            // Preserve UI state during user switches
            sidebarCollapsed: currentState.sidebarCollapsed
          });
        } else {
          console.log('👤 ChatStore: Setting userId without clearing chats (initial load or same user)');
          set({ currentUserId: userId });
        }
      },

      clearAllChats: () => {
        console.log('🧹 ChatStore: Clearing all chats and resetting state');
        const currentState = get();
        set({
          chats: [],
          activeChatId: null,
          globalDraft: '',
          searchQuery: '',
          currentUserId: null,
          // Preserve UI state during logout
          sidebarCollapsed: currentState.sidebarCollapsed
        });
      },

      clearUserStorage: (userId) => {
        console.log('🗑️ ChatStore: Clearing storage for user:', userId || 'all users');

        if (typeof window !== 'undefined') {
          const keys = Object.keys(localStorage);

          if (userId) {
            // Clear specific user's storage
            const userStorageKeys = keys.filter(key =>
              key.includes(`nilchat.v1.user_${userId}`) ||
              key.includes(`nilchat.v1`) && !key.includes('user_')
            );

            userStorageKeys.forEach(key => {
              console.log('🗑️ Removing storage key:', key);
              localStorage.removeItem(key);
            });
          } else {
            // Clear all chat-related storage
            const chatStorageKeys = keys.filter(key => key.startsWith('nilchat.'));
            chatStorageKeys.forEach(key => {
              console.log('🗑️ Removing storage key:', key);
              localStorage.removeItem(key);
            });
          }
        }
      },

      // Debug method to reset sidebar state
      resetSidebarState: () => {
        console.log('🔧 ChatStore: Resetting sidebar state');
        if (typeof window !== 'undefined') {
          // Clear all nilchat storage
          const keys = Object.keys(localStorage);
          const chatKeys = keys.filter(key => key.startsWith('nilchat.'));
          chatKeys.forEach(key => localStorage.removeItem(key));

          // Reset the store state
          set((state) => ({
            ...state,
            sidebarCollapsed: false // Explicitly set to expanded
          }));

          console.log('✅ Sidebar state reset - should be expanded now');
        }
      },

      // UI actions
      toggleSidebar: () => {
        set((state) => {
          const newCollapsed = !state.sidebarCollapsed;
          console.log('🔄 ChatStore: Toggling sidebar from', state.sidebarCollapsed, 'to', newCollapsed);
          return { sidebarCollapsed: newCollapsed };
        });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      // Import/Export
      exportChats: () => {
        const { chats } = get();
        const exportData = {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          chats: chats.filter(chat => !chat.isArchived)
        };
        return JSON.stringify(exportData, null, 2);
      },

      importChats: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (!parsed.chats || !Array.isArray(parsed.chats)) {
            return false;
          }

          const importedChats: Chat[] = parsed.chats.map((chat: any) => ({
            ...chat,
            id: generateChatId(), // Generate new IDs to avoid conflicts
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
            messages: chat.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));

          set((state) => ({
            chats: [...importedChats, ...state.chats]
          }));

          return true;
        } catch (error) {
          console.error('Failed to import chats:', error);
          return false;
        }
      },

      // Database sync methods - NOW USING API ROUTES
      loadChatsFromDatabase: async (userId: string) => {
        try {
          console.log('📥 Loading chats from API for user:', userId);

          const response = await fetch(`/api/chat/sessions?userId=${userId}`);

          console.log('📡 Response status:', response.status);
          console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            if (response.status === 401) {
              console.warn('⚠️ User not authenticated - keeping current state to avoid loop');
              // DON'T clear currentUserId here - it creates an infinite loop
              return false;
            }
            throw new Error(`Failed to fetch sessions: ${response.status}`);
          }

          const { sessions } = await response.json();

          if (sessions && sessions.length > 0) {
            // Also fetch messages for all sessions
            console.log('📥 Loading messages from API...');
            const messagesResponse = await fetch(`/api/chat/messages?userId=${userId}`);

            let messagesBySession: Record<string, any[]> = {};
            if (messagesResponse.ok) {
              const { messages } = await messagesResponse.json();
              // Group messages by session_id
              messagesBySession = (messages || []).reduce((acc: Record<string, any[]>, msg: any) => {
                if (!acc[msg.session_id]) acc[msg.session_id] = [];
                acc[msg.session_id].push(msg);
                return acc;
              }, {});
              console.log(`📨 Loaded ${messages?.length || 0} total messages`);
            }

            // Convert API format to store format with messages
            const dbChats: Chat[] = sessions.map((session: any) => ({
              id: session.id,
              title: session.title,
              messages: (messagesBySession[session.id] || []).map((msg: any) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: msg.created_at ? new Date(msg.created_at) : new Date()
              })),
              roleContext: 'athlete' as RoleContext,
              isPinned: false,
              isArchived: false,
              createdAt: new Date(session.created_at),
              updatedAt: new Date(session.updated_at),
              draft: ''
            }));

            set({ chats: dbChats });
            console.log(`✅ Loaded ${dbChats.length} chats with messages from API`);
            return true;
          }

          console.log('ℹ️ No chats found in database');
          return true;
        } catch (error) {
          console.error('❌ Failed to load chats from API:', error);
          return false;
        }
      },

      syncChatToDatabase: async (chatId: string, userId: string) => {
        try {
          const { chats } = get();
          const chat = chats.find(c => c.id === chatId);
          if (!chat) {
            console.warn('⚠️ Chat not found for sync:', chatId);
            return false;
          }

          // Check if this chat uses a UUID format (loaded from DB) vs our local format
          // UUIDs are 36 chars with dashes, our local IDs are different
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chatId);

          if (isUUID) {
            console.log('⏭️ Skipping sync for chat loaded from DB:', chatId);
            // This chat was loaded from the database, so it already exists there
            // Just sync any NEW messages that aren't in the DB yet
            // For now, skip entirely to avoid duplicates
            return true;
          }

          console.log('📤 Syncing NEW chat to API:', chatId);

          // Create new session in database
          const response = await fetch('/api/chat/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              title: chat.title,
              role_context: chat.roleContext
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to create session: ${response.status}`);
          }

          const { session } = await response.json();

          // Sync all messages for this chat
          for (const message of chat.messages) {
            await fetch('/api/chat/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                session_id: session.id,
                role: message.role,
                content: message.content
              })
            });
          }

          console.log('✅ New chat synced to API:', chatId);
          return true;
        } catch (error) {
          console.error('❌ Failed to sync chat to API:', error);
          return false;
        }
      },

      syncAllToDatabase: async (userId: string) => {
        try {
          const { chats } = get();
          console.log(`📤 Syncing ${chats.length} chats to API`);

          let successCount = 0;
          for (const chat of chats) {
            const synced = await get().syncChatToDatabase(chat.id, userId);
            if (synced) successCount++;
          }

          console.log(`✅ Synced ${successCount}/${chats.length} chats to API`);
          return successCount === chats.length;
        } catch (error) {
          console.error('❌ Failed to sync all chats to API:', error);
          return false;
        }
      },

      // Getters
      getActiveChat: () => {
        const { chats, activeChatId } = get();
        return chats.find(chat => chat.id === activeChatId) || null;
      },

      getFilteredChats: () => {
        const { chats, searchQuery } = get();
        const activeChats = chats.filter(chat => !chat.isArchived);

        if (!searchQuery.trim()) {
          return sortChats(activeChats);
        }

        const query = searchQuery.toLowerCase();
        const filtered = activeChats.filter(chat =>
          chat.title.toLowerCase().includes(query) ||
          chat.messages.some(msg => msg.content.toLowerCase().includes(query))
        );

        return sortChats(filtered);
      }
    }),
    {
      name: 'chatnil-chat-history-v3', // Stable storage key
      storage: {
        getItem: (name: string): any => {
          const data = localStorage.getItem(name);
          if (!data) {
            return null;
          }

          // Validate that we have actual JSON string, not "[object Object]"
          if (data === '[object Object]') {
            console.error('❌ ChatStore: Found corrupted data "[object Object]", clearing...');
            localStorage.removeItem(name);
            return null;
          }

          try {
            const parsed = JSON.parse(data);

            // VALIDATE DATA STRUCTURE to prevent app crashes
            if (!parsed || typeof parsed !== 'object') {
              console.error('❌ ChatStore: Invalid data structure (not an object), clearing...');
              localStorage.removeItem(name);
              return null;
            }

            if (!parsed.state || typeof parsed.state !== 'object') {
              console.error('❌ ChatStore: Invalid data structure (no state object), clearing...');
              localStorage.removeItem(name);
              return null;
            }

            if (!Array.isArray(parsed.state.chats)) {
              console.error('❌ ChatStore: Invalid data structure (chats not an array), clearing...');
              localStorage.removeItem(name);
              return null;
            }

            // VALIDATE EACH CHAT to prevent corrupted chats from breaking the app
            for (let i = 0; i < parsed.state.chats.length; i++) {
              const chat = parsed.state.chats[i];

              if (!chat || typeof chat !== 'object') {
                console.error(`❌ ChatStore: Corrupted chat at index ${i}, clearing all data...`);
                localStorage.removeItem(name);
                return null;
              }

              if (!chat.id || typeof chat.id !== 'string') {
                console.error(`❌ ChatStore: Chat at index ${i} missing valid id, clearing all data...`);
                localStorage.removeItem(name);
                return null;
              }

              if (!chat.title || typeof chat.title !== 'string') {
                console.error(`❌ ChatStore: Chat ${chat.id} missing valid title, clearing all data...`);
                localStorage.removeItem(name);
                return null;
              }

              if (!Array.isArray(chat.messages)) {
                console.error(`❌ ChatStore: Chat ${chat.id} has invalid messages array, clearing all data...`);
                localStorage.removeItem(name);
                return null;
              }

              // VALIDATE EACH MESSAGE within the chat
              for (let j = 0; j < chat.messages.length; j++) {
                const msg = chat.messages[j];

                if (!msg || typeof msg !== 'object') {
                  console.error(`❌ ChatStore: Chat ${chat.id} has corrupted message at index ${j}, clearing all data...`);
                  localStorage.removeItem(name);
                  return null;
                }

                if (!msg.id || !msg.content || !msg.role) {
                  console.error(`❌ ChatStore: Chat ${chat.id} message ${j} missing required fields, clearing all data...`);
                  localStorage.removeItem(name);
                  return null;
                }

                if (msg.role !== 'user' && msg.role !== 'assistant') {
                  console.error(`❌ ChatStore: Chat ${chat.id} message ${j} has invalid role "${msg.role}", clearing all data...`);
                  localStorage.removeItem(name);
                  return null;
                }
              }
            }

            // Don't filter chats on read - let all chats load, we'll filter in getFilteredChats if needed
            // This prevents losing data when user ID changes
            return data; // Return the raw string, don't re-stringify
          } catch (error) {
            console.error('❌ ChatStore: Error parsing stored data:', error);
            console.error('❌ Corrupted data:', data?.substring(0, 100));
            // Clear corrupted data
            localStorage.removeItem(name);
            return null;
          }
        },
        setItem: (name: string, value: any) => {
          // Use debounced save to prevent excessive writes during streaming
          debouncedSave(name, value);
        },
        removeItem: (name: string) => {
          console.log('🗑️ ChatStore: Removing localStorage key:', name);
          localStorage.removeItem(name);
        }
      },
      partialize: (state) => {
        // Limit to 50 active chats + archived chats, auto-archive older ones
        const sortedChats = sortChats(state.chats.filter(chat => !chat.isArchived));
        const activeChats = sortedChats.slice(0, 50);
        const archivedChats = state.chats.filter(chat => chat.isArchived);
        const autoArchivedChats = sortedChats.slice(50).map(chat => ({ ...chat, isArchived: true }));

        return {
          chats: [...activeChats, ...archivedChats, ...autoArchivedChats].map(chat => ({
            ...chat,
            // Convert dates to strings for serialization
            createdAt: chat.createdAt instanceof Date ? chat.createdAt.toISOString() : chat.createdAt,
            updatedAt: chat.updatedAt instanceof Date ? chat.updatedAt.toISOString() : chat.updatedAt,
            messages: chat.messages.map(msg => ({
              ...msg,
              timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
              isStreaming: false // Reset streaming state on persist
            }))
          })),
          activeChatId: state.activeChatId,
          sidebarCollapsed: state.sidebarCollapsed,
          globalDraft: state.globalDraft,
          currentUserId: state.currentUserId,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state?.chats) {
          // Convert string dates back to Date objects
          state.chats = state.chats.map(chat => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt),
            messages: chat.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
              isStreaming: false
            }))
          }));

          // Ensure active chat exists and is not archived
          if (state.activeChatId) {
            const activeChat = state.chats.find(chat => chat.id === state.activeChatId);
            if (!activeChat || activeChat.isArchived) {
              const firstActiveChat = state.chats.find(chat => !chat.isArchived);
              state.activeChatId = firstActiveChat?.id || null;
            }
          }
        }
      }
    }
  )
);