import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message } from './chat-store';
import { chatPersistence } from './chat-persistence';

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
  setChatDraft: (chatId: string, draft: string) => void;
  setDraft: (draft: string | null) => void;
  getDraft: () => string;
  renameChat: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;
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

        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChatId: newChat.id,
          globalDraft: ''
        }));
        return newChat.id;
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

      renameChat: (chatId, title) => {
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, title: title.trim() || 'Untitled Chat', updatedAt: new Date() } : chat
          )
        }));
      },

      deleteChat: (chatId) => {
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
      },

      togglePin: (chatId) => {
        set((state) => {
          const chats = state.chats.map(chat =>
            chat.id === chatId ? { ...chat, isPinned: !chat.isPinned, updatedAt: new Date() } : chat
          );
          return { chats: sortChats(chats) };
        });
      },

      archiveChat: (chatId) => {
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

      // Database sync methods
      loadChatsFromDatabase: async (userId: string) => {
        try {
          const dbChats = await chatPersistence.loadFromDatabase(userId);
          if (dbChats.length > 0) {
            set({ chats: dbChats });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to load chats from database:', error);
          return false;
        }
      },

      syncChatToDatabase: async (chatId: string, userId: string) => {
        try {
          const { chats } = get();
          const chat = chats.find(c => c.id === chatId);
          if (!chat) return false;

          return await chatPersistence.createSession(chat, userId);
        } catch (error) {
          console.error('Failed to sync chat to database:', error);
          return false;
        }
      },

      syncAllToDatabase: async (userId: string) => {
        try {
          const { chats } = get();
          return await chatPersistence.syncToDatabase(chats, userId);
        } catch (error) {
          console.error('Failed to sync all chats to database:', error);
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
        getItem: (name: string) => {
          console.log('📖 ChatStore: Reading from localStorage key:', name);

          // Debug: Check all chat-related keys in localStorage
          if (typeof window !== 'undefined') {
            const allKeys = Object.keys(localStorage).filter(k => k.includes('chat') || k.includes('nil'));
            console.log('🔍 All chat-related localStorage keys:', allKeys);
            allKeys.forEach(key => {
              const size = localStorage.getItem(key)?.length || 0;
              console.log(`  - ${key}: ${(size / 1024).toFixed(2)}KB`);
            });
          }

          const data = localStorage.getItem(name);
          if (!data) {
            console.log('⚠️ ChatStore: No data found for key:', name);
            return null;
          }

          try {
            const parsed = JSON.parse(data);
            const { currentUserId } = get();

            console.log('📊 ChatStore: Loaded data:', {
              currentUserId,
              chatsCount: parsed.state?.chats?.length || 0,
              activeChatId: parsed.state?.activeChatId,
              hasState: !!parsed.state
            });

            // Don't filter chats on read - let all chats load, we'll filter in getFilteredChats if needed
            // This prevents losing data when user ID changes
            return JSON.stringify(parsed);
          } catch (error) {
            console.error('❌ ChatStore: Error parsing stored data:', error);
            return data;
          }
        },
        setItem: (name: string, value: string) => {
          try {
            const parsed = JSON.parse(value);
            const { currentUserId } = get();

            console.log('💾 ChatStore: Saving to localStorage:', {
              key: name,
              currentUserId,
              chatsCount: parsed.state?.chats?.length || 0,
              activeChatId: parsed.state?.activeChatId
            });

            // Add user ID to chats if user is set (for future filtering)
            if (currentUserId && parsed.state?.chats) {
              parsed.state.chats = parsed.state.chats.map((chat: any) => ({
                ...chat,
                userId: chat.userId || currentUserId
              }));
            }

            localStorage.setItem(name, JSON.stringify(parsed));
            console.log('✅ ChatStore: Successfully saved to localStorage');
          } catch (error) {
            console.error('❌ ChatStore: Error storing data:', error);
            localStorage.setItem(name, value);
          }
        },
        removeItem: (name: string) => {
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
        console.log('🔄 ChatStore: Rehydrating state from localStorage');

        if (state?.chats) {
          console.log('📊 ChatStore: Rehydrated state:', {
            chatsCount: state.chats.length,
            activeChatId: state.activeChatId,
            currentUserId: state.currentUserId,
            chatTitles: state.chats.map(c => c.title).slice(0, 5)
          });

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
              console.log('🔄 ChatStore: Active chat adjusted to:', state.activeChatId);
            }
          }

          console.log('✅ ChatStore: Rehydration complete');
        } else {
          console.log('⚠️ ChatStore: No chats found in rehydrated state');
        }
      }
    }
  )
);