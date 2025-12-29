'use client';

import { useState } from 'react';
import { MessageSquare, MoreVertical, Pin, Edit2, Trash2, Download, Mail } from 'lucide-react';
import { type Chat } from '@/lib/chat-history-store';

/**
 * ChatItem Component
 *
 * Individual chat item in the sidebar with inline editing,
 * pinning, and deletion capabilities.
 */

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
  onPin: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
  onExportPDF?: () => void;
  onEmailSummary?: () => void;
}

export default function ChatItem({
  chat,
  isActive,
  onClick,
  onPin,
  onRename,
  onDelete,
  onExportPDF,
  onEmailSummary
}: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [showMenu, setShowMenu] = useState(false);

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(chat.title);
    setIsEditing(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) return 'now';
    if (hours < 24) return `${Math.floor(hours)}h`;
    if (hours < 24 * 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-2 px-2 py-2 pr-8 rounded-md transition-colors text-left relative
          ${isActive ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
      >
        <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-500" />
        <div className="flex-1 min-w-0 overflow-hidden">
          {isEditing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-sm bg-white border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
              autoFocus
            />
          ) : (
            <>
              <div className="text-sm truncate text-gray-900 pr-1">{chat.title}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span>{chat.messages.length} messages</span>
                {chat.isPinned && <Pin className="w-3 h-3 text-orange-500 fill-current inline-block" />}
                <span className="text-gray-400">{formatTime(chat.updatedAt)}</span>
              </div>
            </>
          )}
        </div>
      </button>

      {/* Menu button - positioned outside main button area */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100/80 backdrop-blur-sm"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 min-w-[120px]">
          <button
            onClick={() => {
              onPin();
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
          >
            <Pin className="w-3 h-3" />
            {chat.isPinned ? 'Unpin' : 'Pin'}
          </button>
          <button
            onClick={() => {
              setIsEditing(true);
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit2 className="w-3 h-3" />
            Rename
          </button>
          {onExportPDF && (
            <button
              onClick={() => {
                onExportPDF();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-3 h-3" />
              Export PDF
            </button>
          )}
          {onEmailSummary && (
            <button
              onClick={() => {
                onEmailSummary();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
            >
              <Mail className="w-3 h-3" />
              Email Summary
            </button>
          )}
          <button
            onClick={() => {
              onDelete();
              setShowMenu(false);
            }}
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-red-600 flex items-center gap-2"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
