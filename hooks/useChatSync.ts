import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatHistoryStore } from '@/lib/chat-history-store';

export function useChatSync() {
  const { user } = useAuth();
  const {
    chats,
    loadChatsFromDatabase,
    syncAllToDatabase,
    setUserId,
    clearAllChats,
    currentUserId
  } = useChatHistoryStore();

  const previousUserIdRef = useRef<string | null>(null);
  const hasSyncedRef = useRef<boolean>(false);
  const loadingRef = useRef<boolean>(false);

  // Track sync status for UI
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'synced' | 'error' | 'offline'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Handle user changes - set user ID in chat store and clear previous user's data
  useEffect(() => {
    console.log('👤 useChatSync: User ID effect triggered:', {
      authUserId: user?.id,
      previousUserId: previousUserIdRef.current,
      storeUserId: currentUserId,
      chatsCount: chats.length
    });

    // If user is logging out (user becomes null)
    if (!user?.id && previousUserIdRef.current) {
      console.log('🚪 useChatSync: User logging out, clearing chat data');
      clearAllChats();
      setUserId(null);
      previousUserIdRef.current = null;
      hasSyncedRef.current = false;
      setSyncStatus('idle');
      return;
    }

    // If user is logging in or switching users
    if (user?.id) {
      const isActualUserSwitch = previousUserIdRef.current && previousUserIdRef.current !== user.id;
      const isInitialLoad = !previousUserIdRef.current;

      if (isActualUserSwitch) {
        console.warn('🔄 useChatSync: Different user detected - clearing previous user data FOR SECURITY');
        console.warn(`   Previous: ${previousUserIdRef.current} → New: ${user.id}`);

        // SECURITY: Clear BOTH memory AND localStorage to prevent data leakage
        clearAllChats();

        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('chatnil-chat-history-v3');
            console.log('🧹 useChatSync: Cleared localStorage for user switch');
          } catch (error) {
            console.error('❌ useChatSync: Error clearing localStorage:', error);
          }
        }

        hasSyncedRef.current = false;
        loadingRef.current = false;
        setSyncStatus('idle');
      } else if (isInitialLoad) {
        console.log('✅ useChatSync: Initial user detection - will load from Supabase');
      }

      if (currentUserId !== user.id) {
        console.log(`📝 useChatSync: Setting store user ID from ${currentUserId} to ${user.id}`);
        setUserId(user.id);
      }

      previousUserIdRef.current = user.id;
    }
  }, [user?.id, setUserId, clearAllChats, currentUserId, chats.length]);

  // Load chats from Supabase on login - Supabase is source of truth
  useEffect(() => {
    console.log('🔍 useChatSync LOAD effect triggered:', {
      hasUser: !!user?.id,
      userId: user?.id,
      currentUserId,
      userIdsMatch: currentUserId === user?.id,
      chatsLength: chats.length,
      hasSynced: hasSyncedRef.current,
      isLoading: loadingRef.current,
    });

    // Only load if we haven't synced yet AND not currently loading
    const shouldLoad = user?.id &&
                      currentUserId === user.id &&
                      !hasSyncedRef.current &&
                      !loadingRef.current;

    if (shouldLoad) {
      const loadChats = async () => {
        loadingRef.current = true;
        setSyncStatus('loading');

        try {
          // Check if we're online
          if (!navigator.onLine) {
            console.log('📴 useChatSync: Offline - using localStorage cache');
            setSyncStatus('offline');
            hasSyncedRef.current = true;
            return;
          }

          console.log('📥 useChatSync: Loading from Supabase (source of truth) for user:', user.id);
          const loaded = await loadChatsFromDatabase(user.id);
          hasSyncedRef.current = true;

          if (loaded) {
            console.log('✅ useChatSync: Successfully loaded chats from Supabase');
            setSyncStatus('synced');
            setLastSyncTime(new Date());
          } else {
            console.log('ℹ️ useChatSync: No chats found in database - user starting fresh');
            setSyncStatus('synced');
            setLastSyncTime(new Date());
          }
        } catch (error) {
          console.error('❌ useChatSync: Error loading chats from Supabase:', error);

          // Fall back to localStorage cache
          if (chats.length > 0) {
            console.log('📂 useChatSync: Using localStorage cache as fallback');
            setSyncStatus('offline');
          } else {
            setSyncStatus('error');
          }

          hasSyncedRef.current = true;
        } finally {
          loadingRef.current = false;
        }
      };

      // Small delay to prevent race conditions
      const timeoutId = setTimeout(loadChats, 300);
      return () => clearTimeout(timeoutId);
    } else if (chats.length > 0 && !hasSyncedRef.current) {
      console.log('ℹ️ useChatSync: Using cached chats, count:', chats.length);
      hasSyncedRef.current = true;
      setSyncStatus('synced');
    }
  }, [user?.id, currentUserId, loadChatsFromDatabase, chats.length]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = async () => {
      console.log('🌐 useChatSync: Back online - syncing with Supabase');

      if (user?.id && currentUserId === user.id) {
        setSyncStatus('loading');

        try {
          // First, sync any local changes to Supabase
          await syncAllToDatabase(user.id);

          // Then reload from Supabase to get any changes from other devices
          await loadChatsFromDatabase(user.id);

          setSyncStatus('synced');
          setLastSyncTime(new Date());
          console.log('✅ useChatSync: Re-synced with Supabase after coming online');
        } catch (error) {
          console.error('❌ useChatSync: Error syncing after coming online:', error);
          setSyncStatus('error');
        }
      }
    };

    const handleOffline = () => {
      console.log('📴 useChatSync: Went offline - using localStorage cache');
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.id, currentUserId, syncAllToDatabase, loadChatsFromDatabase]);

  // Manual sync function that can be called from components
  const manualSync = useCallback(async () => {
    if (!user?.id) return false;

    if (!navigator.onLine) {
      console.log('📴 useChatSync: Cannot sync - offline');
      setSyncStatus('offline');
      return false;
    }

    setSyncStatus('loading');

    try {
      const synced = await syncAllToDatabase(user.id);
      if (synced) {
        setSyncStatus('synced');
        setLastSyncTime(new Date());
        console.log('✅ useChatSync: Manual sync completed');
      }
      return synced;
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
      setSyncStatus('error');
      return false;
    }
  }, [user?.id, syncAllToDatabase]);

  // Force refresh from Supabase
  const forceRefresh = useCallback(async () => {
    if (!user?.id) return false;

    if (!navigator.onLine) {
      console.log('📴 useChatSync: Cannot refresh - offline');
      setSyncStatus('offline');
      return false;
    }

    setSyncStatus('loading');
    hasSyncedRef.current = false;

    try {
      const loaded = await loadChatsFromDatabase(user.id);
      hasSyncedRef.current = true;
      setSyncStatus('synced');
      setLastSyncTime(new Date());
      console.log('✅ useChatSync: Force refresh completed');
      return loaded;
    } catch (error) {
      console.error('❌ Force refresh failed:', error);
      setSyncStatus('error');
      return false;
    }
  }, [user?.id, loadChatsFromDatabase]);

  return {
    manualSync,
    forceRefresh,
    syncStatus,
    lastSyncTime,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isReady: !!user?.id && currentUserId === user?.id,
    currentUserId,
    isUserIsolated: !!currentUserId
  };
}
