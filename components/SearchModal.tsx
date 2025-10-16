'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useChatHistoryStore, type Chat } from '@/lib/chat-history-store';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (chatId: string) => void;
}

const groupChatsByTime = (chats: Chat[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const todayChats = chats.filter(chat => chat.updatedAt >= today);
  const previousWeekChats = chats.filter(chat =>
    chat.updatedAt < today && chat.updatedAt >= sevenDaysAgo
  );
  const olderChats = chats.filter(chat => chat.updatedAt < sevenDaysAgo);

  return {
    today: todayChats,
    previousWeek: previousWeekChats,
    older: olderChats
  };
};

export default function SearchModal({ isOpen, onClose, onSelectChat }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { chats, getFilteredChats } = useChatHistoryStore();

  // Filter chats based on search query
  const filteredChats = searchQuery.trim()
    ? chats.filter(chat =>
        !chat.isArchived && (
          chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.messages.some(msg =>
            msg.content.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      )
    : chats.filter(chat => !chat.isArchived);

  const { today, previousWeek, older } = groupChatsByTime(filteredChats);
  const allChats = [...today, ...previousWeek, ...older];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, allChats.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const selectedChat = allChats[selectedIndex];
        if (selectedChat) {
          onSelectChat(selectedChat.id);
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, allChats, onSelectChat, onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderChatSection = (title: string, chats: Chat[], startIndex: number) => {
    if (chats.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
          {title}
        </h3>
        <div className="space-y-1">
          {chats.map((chat, index) => {
            const globalIndex = startIndex + index;
            const isSelected = selectedIndex === globalIndex;

            return (
              <button
                key={chat.id}
                onClick={() => {
                  onSelectChat(chat.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-left
                  ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 truncate">{chat.title}</div>
                  <div className="text-xs text-gray-500">
                    {chat.messages.length} messages
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredChats.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">
                  {searchQuery ? 'No chats found' : 'No chats yet'}
                </div>
                <div className="text-sm">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Start a new conversation to get started'}
                </div>
              </div>
            ) : (
              <>
                {renderChatSection('Today', today, 0)}
                {renderChatSection('Previous 7 Days', previousWeek, today.length)}
                {renderChatSection('Older', older, today.length + previousWeek.length)}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}