'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { useChatHistoryStore, type Chat } from '@/lib/chat-history-store';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useChatSync } from '@/hooks/useChatSync';
import { useNavigation } from '@/lib/stores/navigation';
import SearchModal from '@/components/SearchModal';
import RecentPages from '@/components/Navigation/RecentPages';
import SidebarHeader from './SidebarHeader';
import ChatHistory from './ChatHistory';

/**
 * Sidebar Component (Refactored)
 *
 * Main sidebar navigation with chat history.
 * Now works ALONGSIDE the Header component (no duplicate profile menu).
 *
 * Changes from previous version:
 * - Removed duplicate user profile menu at bottom (now in Header)
 * - Broken into sub-components for maintainability
 * - Moved to components/navigation/Sidebar/
 * - Uses navigation-store for sidebar collapse state
 */

interface SidebarProps {
  className?: string;
  isNonAuth?: boolean;
}

export default function Sidebar({ className = '', isNonAuth = false }: SidebarProps) {
  const {
    chats,
    activeChatId,
    searchQuery,
    newChat,
    beginDraft,
    setActiveChat,
    setSearchQuery,
    getFilteredChats,
    deleteChat,
    togglePin,
    renameChat
  } = useChatHistoryStore();

  const { sidebarCollapsed, sidebarWidth, setSidebarWidth } = useNavigation();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { isReady, currentUserId, isUserIsolated } = useChatSync();

  // Get filtered chats based on search
  const filteredChats = searchQuery ? getFilteredChats() : chats.filter(chat => !chat.isArchived);

  // Debug logging for user isolation
  useEffect(() => {
    console.log('🔍 Sidebar: User isolation status:', {
      userId: user?.id,
      currentUserId,
      isReady,
      isUserIsolated,
      chatsCount: chats.length,
      filteredChatsCount: filteredChats.length
    });
  }, [user?.id, currentUserId, isReady, isUserIsolated, chats.length, filteredChats.length]);

  const handleNewChat = () => {
    beginDraft();
    router.push('/');
  };

  const handleChatClick = (chatId: string) => {
    setActiveChat(chatId);
    router.push('/');
  };

  const handleDeleteChat = async (chatId: string) => {
    if (confirm('Delete this conversation? You won\'t be able to get it back.')) {
      await deleteChat(chatId);
    }
  };

  const handleTogglePin = (chatId: string) => {
    togglePin(chatId);
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    await renameChat(chatId, newTitle);
  };

  // Handle PDF export
  const handleExportPDF = useCallback(async (chat: Chat) => {
    try {
      // Dynamically import the PDF export utilities to avoid SSR issues
      const { exportAndDownloadConversation } = await import('@/lib/utils/pdf-export');

      // Convert chat messages to export format
      const exportMessages = chat.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.timestamp?.toISOString(),
      }));

      await exportAndDownloadConversation(exportMessages, {
        title: chat.title,
        userName: user?.name || 'User',
        userRole: user?.role || 'Athlete',
        sessionId: chat.id,
        includeTimestamps: true,
        includeHeader: true,
        includeFooter: true,
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export conversation. Please try again.');
    }
  }, [user]);

  // Handle email summary
  const handleEmailSummary = useCallback(async (chat: Chat) => {
    // Prompt for email address
    const email = prompt('Enter email address to send the summary:');
    if (!email) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      // Convert chat messages to API format
      const messages = chat.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.timestamp?.toISOString(),
      }));

      const response = await fetch('/api/email/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          userName: user?.name || 'User',
          conversationTitle: chat.title,
          messages,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send email');
      }

      alert(`Summary sent to ${email}!`);
    } catch (error: any) {
      console.error('Failed to send email summary:', error);
      alert(error.message || 'Failed to send email summary. Please try again.');
    }
  }, [user]);

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    if (sidebarCollapsed) return;
    e.preventDefault();
    setIsResizing(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  // Handle resize move and stop
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(480, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setSidebarWidth]);

  // For non-authenticated users, show a simple fixed-width sidebar
  if (isNonAuth) {
    return (
      <aside className={`w-16 bg-gray-50 border-r border-gray-200 flex flex-col h-screen ${className}`}>
        <div className="p-3">
          <div className="w-10 h-10 bg-orange-500 rounded-md flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside
        style={{
          width: sidebarCollapsed ? '48px' : `${sidebarWidth}px`
        }}
        className={`
          fixed left-0 top-0 bg-gray-50 border-r border-gray-200 flex flex-col h-screen
          ${sidebarCollapsed ? '' : 'transition-none'}
          z-40
          hidden md:flex
          ${className}
        `}
      >
        {/* Fixed Header with Logo and Controls */}
        <SidebarHeader
          onNewChat={handleNewChat}
          onSearchClick={() => setShowSearchModal(true)}
        />

        {/* Recent Pages - Only show when sidebar is expanded */}
        {!sidebarCollapsed && (
          <div className="border-b border-gray-200 pb-2 mb-2">
            <RecentPages limit={3} />
          </div>
        )}

        {/* Scrollable Chat History */}
        <ChatHistory
          chats={filteredChats}
          activeChatId={activeChatId}
          onChatClick={handleChatClick}
          onTogglePin={handleTogglePin}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
          onExportPDF={handleExportPDF}
          onEmailSummary={handleEmailSummary}
        />

        {/* Resize Handle - Only show when sidebar is expanded */}
        {!sidebarCollapsed && (
          <div
            onMouseDown={handleResizeStart}
            className={`
              absolute top-0 right-0 w-1 h-full cursor-col-resize
              hover:bg-orange-500 hover:w-1.5
              transition-all duration-150
              ${isResizing ? 'bg-orange-500 w-1.5' : 'bg-transparent'}
            `}
            aria-label="Resize sidebar"
          />
        )}

        {/*
          NOTE: User profile menu has been REMOVED from here.
          It now lives in the Header component (top right).
          This eliminates duplication and creates a cleaner layout.
        */}
      </aside>

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectChat={(chatId) => {
          handleChatClick(chatId);
          setShowSearchModal(false);
        }}
      />
    </>
  );
}
