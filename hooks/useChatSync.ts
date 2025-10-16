import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatHistoryStore } from '@/lib/chat-history-store';
import { chatPersistence } from '@/lib/chat-persistence';

export function useChatSync() {
  const { user } = useAuth();
  const { chats, loadChatsFromDatabase, syncAllToDatabase, setUserId, clearAllChats, currentUserId } = useChatHistoryStore();
  const previousUserIdRef = useRef<string | null>(null);

  // Handle user changes - set user ID in chat store and clear previous user's data
  useEffect(() => {
    console.log('👤 useChatSync: User ID changed to:', user?.id);
    console.log('👤 Previous user ID was:', previousUserIdRef.current);
    console.log('👤 Current store user ID:', currentUserId);
    console.log('👤 Current chats count:', chats.length);

    // If user is logging out (user becomes null)
    if (!user?.id && previousUserIdRef.current) {
      console.log('🚪 useChatSync: User logging out, clearing chat data');
      clearAllChats();
      setUserId(null);
      previousUserIdRef.current = null;
      return;
    }

    // If user is logging in or switching users
    if (user?.id) {
      const userChanged = previousUserIdRef.current && previousUserIdRef.current !== user.id;

      if (userChanged) {
        console.warn('🔄 useChatSync: User ACTUALLY changed (different user login), clearing previous user data');
        clearAllChats(); // Clear previous user's chats from memory
      } else if (!previousUserIdRef.current) {
        console.log('✅ useChatSync: Initial user login detected - will load chats from localStorage/DB');
      }

      // Set new user ID in chat store
      // This should NOT clear chats on initial load (only on user switch)
      setUserId(user.id);
      previousUserIdRef.current = user.id;
    }
  }, [user?.id, setUserId, clearAllChats, currentUserId, chats.length]);

  // Load chats from database when user logs in or user ID is set
  // Only load if chats are empty (localStorage already loaded if available)
  useEffect(() => {
    if (user?.id && currentUserId === user.id && chats.length === 0) {
      const loadChats = async () => {
        try {
          console.log('📥 useChatSync: No chats in memory, attempting to load from database for user:', user.id);
          const loaded = await loadChatsFromDatabase(user.id);
          if (loaded) {
            console.log('✅ useChatSync: Successfully loaded chats from database');
          } else {
            console.log('ℹ️ useChatSync: No chats found in database - user may be starting fresh');
          }
        } catch (error) {
          console.error('❌ useChatSync: Error loading chats from database:', error);
        }
      };

      // Small delay to allow localStorage rehydration to complete first
      const timeoutId = setTimeout(loadChats, 500);
      return () => clearTimeout(timeoutId);
    } else if (chats.length > 0) {
      console.log('ℹ️ useChatSync: Chats already loaded from localStorage, skipping database load');
    }
  }, [user?.id, currentUserId, chats.length, loadChatsFromDatabase]);

  // Sync chats to database periodically or when chats change (only for current user)
  useEffect(() => {
    if (user?.id && currentUserId === user.id && chats.length > 0) {
      const syncChats = async () => {
        try {
          console.log('📤 useChatSync: Syncing chats to database for user:', user.id);
          const synced = await syncAllToDatabase(user.id);
          if (synced) {
            console.log('✅ useChatSync: Successfully synced chats to database');
          } else {
            console.log('⚠️ useChatSync: Error syncing chats to database');
          }
        } catch (error) {
          console.error('❌ useChatSync: Error syncing chats to database:', error);
        }
      };

      // Debounce sync operations
      const timeoutId = setTimeout(syncChats, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [user?.id, currentUserId, chats, syncAllToDatabase]);

  // Manual sync function that can be called from components
  const manualSync = async () => {
    if (user?.id) {
      try {
        const synced = await syncAllToDatabase(user.id);
        return synced;
      } catch (error) {
        console.error('Manual sync failed:', error);
        return false;
      }
    }
    return false;
  };

  // Function to add a message and sync to database
  const addMessageWithSync = async (chatId: string, message: any) => {
    if (user?.id) {
      try {
        // Add message to database
        const added = await chatPersistence.addMessage(chatId, message, user.id);
        if (added) {
          console.log('Message added to database successfully');
        }
        return added;
      } catch (error) {
        console.error('Error adding message to database:', error);
        return false;
      }
    }
    return false;
  };

  return {
    manualSync,
    addMessageWithSync,
    isReady: !!user?.id && currentUserId === user?.id,
    currentUserId,
    isUserIsolated: !!currentUserId
  };
}