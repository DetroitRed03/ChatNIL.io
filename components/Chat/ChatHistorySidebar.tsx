'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatHistoryStore } from '@/lib/chat-history-store';
import { Search, Plus, MoreVertical, Pin, Archive, Trash2, Edit2, X, Check, MessageSquare, Download, Copy, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { downloadChat, copyChatToClipboard, shareChat, ExportFormat } from '@/lib/chat-export';
import { useKeyboardShortcuts, createShortcut } from '@/hooks/useKeyboardShortcuts';

export default function ChatHistorySidebar() {
  const {
    chats,
    activeChatId,
    setActiveChat,
    newChat,
    beginDraft,
    deleteChat,
    togglePin,
    archiveChat,
    renameChat,
    searchQuery,
    setSearchQuery,
    getFilteredChats
  } = useChatHistoryStore();

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [menuOpenChatId, setMenuOpenChatId] = useState<string | null>(null);
  const [exportMenuChatId, setExportMenuChatId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredChats = getFilteredChats();

  // Define handlers before keyboard shortcuts hook to avoid hoisting issues
  const handleNewChat = () => {
    beginDraft(); // Clear active chat to show welcome screen
    setSearchQuery(''); // Clear search when creating new chat
  };

  const handleDelete = async (chatId: string) => {
    if (isDeleting === chatId) {
      // Second click - confirm delete
      try {
        await deleteChat(chatId);
        setIsDeleting(null);
        setMenuOpenChatId(null);
      } catch (error) {
        console.error('Failed to delete chat:', error);
        alert('Failed to delete chat. Please try again.');
      }
    } else {
      // First click - show confirmation
      setIsDeleting(chatId);
      // Auto-cancel after 3 seconds
      setTimeout(() => {
        if (isDeleting === chatId) {
          setIsDeleting(null);
        }
      }, 3000);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    createShortcut('n', handleNewChat, 'New chat'),
    createShortcut('k', () => searchInputRef.current?.focus(), 'Focus search'),
    createShortcut(
      'ArrowUp',
      () => {
        if (filteredChats.length === 0) return;
        const currentIndex = filteredChats.findIndex(c => c.id === activeChatId);
        if (currentIndex > 0) {
          setActiveChat(filteredChats[currentIndex - 1].id);
        }
      },
      'Navigate to previous chat'
    ),
    createShortcut(
      'ArrowDown',
      () => {
        if (filteredChats.length === 0) return;
        const currentIndex = filteredChats.findIndex(c => c.id === activeChatId);
        if (currentIndex < filteredChats.length - 1) {
          setActiveChat(filteredChats[currentIndex + 1].id);
        }
      },
      'Navigate to next chat'
    ),
    {
      key: 'Escape',
      description: 'Clear search',
      action: () => {
        if (searchQuery) {
          setSearchQuery('');
        }
      },
      preventDefault: false,
    },
    {
      key: 'Backspace',
      meta: true,
      shift: true,
      description: 'Delete active chat',
      action: () => {
        if (activeChatId) {
          handleDelete(activeChatId);
        }
      },
    },
  ]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenChatId(null);
      }
    };

    if (menuOpenChatId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpenChatId]);

  const handleChatClick = (chatId: string) => {
    if (editingChatId !== chatId) {
      setActiveChat(chatId);
      setMenuOpenChatId(null);
    }
  };

  const handleStartEdit = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
    setMenuOpenChatId(null);
  };

  const handleSaveEdit = async () => {
    if (editingChatId && editingTitle.trim()) {
      await renameChat(editingChatId, editingTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handlePin = (chatId: string) => {
    togglePin(chatId);
    setMenuOpenChatId(null);
  };

  const handleArchive = (chatId: string) => {
    archiveChat(chatId);
    setMenuOpenChatId(null);
  };

  const handleExport = async (chatId: string, format: ExportFormat) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      downloadChat(chat, format);
      setExportMenuChatId(null);
      setMenuOpenChatId(null);
    }
  };

  const handleCopy = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      const success = await copyChatToClipboard(chat, 'markdown');
      if (success) {
        // TODO: Show toast notification
        console.log('Chat copied to clipboard!');
      }
      setMenuOpenChatId(null);
    }
  };

  const handleShare = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      await shareChat(chat, 'txt');
      setMenuOpenChatId(null);
    }
  };

  const formatDate = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="w-64 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-500" />
            Chats
          </h2>
          <button
            onClick={handleNewChat}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="New chat"
          >
            <Plus className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {searchQuery ? (
              <>
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                No chats match "{searchQuery}"
              </>
            ) : (
              <>
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                No chats yet
                <p className="mt-1 text-xs">Start a new chat to begin</p>
              </>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredChats.map((chat) => {
              const isActive = chat.id === activeChatId;
              const isEditing = chat.id === editingChatId;
              const isMenuOpen = chat.id === menuOpenChatId;
              const isDeletingThis = chat.id === isDeleting;

              return (
                <div
                  key={chat.id}
                  className={`
                    group relative rounded-lg transition-colors
                    ${isActive ? 'bg-orange-100 hover:bg-orange-100' : 'hover:bg-gray-100'}
                  `}
                >
                  <div
                    onClick={() => !isEditing && handleChatClick(chat.id)}
                    className="flex items-start gap-2 p-3 cursor-pointer"
                  >
                    {/* Pin Icon */}
                    {chat.isPinned && (
                      <Pin className="h-3 w-3 text-orange-500 mt-1 flex-shrink-0" />
                    )}

                    {/* Chat Content */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-orange-500 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                            className="p-1 hover:bg-green-100 rounded text-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className={`
                            text-sm font-medium truncate
                            ${isActive ? 'text-orange-900' : 'text-gray-900'}
                          `}>
                            {chat.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {chat.messages.length} messages · {formatDate(chat.updatedAt)}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Menu Button */}
                    {!isEditing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenChatId(isMenuOpen ? null : chat.id);
                        }}
                        className={`
                          p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity
                          ${isMenuOpen ? 'opacity-100 bg-gray-200' : 'hover:bg-gray-200'}
                          ${isActive ? 'hover:bg-orange-200' : ''}
                        `}
                      >
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div
                      ref={menuRef}
                      className="absolute right-2 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleStartEdit(chat.id, chat.title)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                      >
                        <Edit2 className="h-4 w-4" />
                        Rename
                      </button>
                      <button
                        onClick={() => handlePin(chat.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                      >
                        <Pin className="h-4 w-4" />
                        {chat.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        onClick={() => handleArchive(chat.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                      >
                        <Archive className="h-4 w-4" />
                        Archive
                      </button>
                      <div className="border-t border-gray-200 my-1" />
                      <button
                        onClick={() => handleCopy(chat.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                        Copy to clipboard
                      </button>
                      <button
                        onClick={() => setExportMenuChatId(exportMenuChatId === chat.id ? null : chat.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                      >
                        <Download className="h-4 w-4" />
                        Export...
                      </button>
                      {typeof navigator !== 'undefined' && 'share' in navigator && (
                        <button
                          onClick={() => handleShare(chat.id)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      )}
                      <div className="border-t border-gray-200 my-1" />
                      <button
                        onClick={() => handleDelete(chat.id)}
                        className={`
                          w-full px-3 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2
                          ${isDeletingThis ? 'bg-red-50 text-red-700' : 'text-red-600'}
                        `}
                      >
                        <Trash2 className="h-4 w-4" />
                        {isDeletingThis ? 'Click again to confirm' : 'Delete'}
                      </button>
                    </div>
                  )}

                  {/* Export Submenu */}
                  {exportMenuChatId === chat.id && (
                    <div
                      ref={exportMenuRef}
                      className="absolute right-44 top-12 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[140px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleExport(chat.id, 'json')}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-gray-700"
                      >
                        Export as JSON
                      </button>
                      <button
                        onClick={() => handleExport(chat.id, 'markdown')}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-gray-700"
                      >
                        Export as Markdown
                      </button>
                      <button
                        onClick={() => handleExport(chat.id, 'txt')}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-gray-700"
                      >
                        Export as Text
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <p className="text-xs text-gray-500 text-center">
          {chats.length} {chats.length === 1 ? 'chat' : 'chats'} total
        </p>
      </div>
    </div>
  );
}
