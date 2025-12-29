'use client';

import { MessageSquare } from 'lucide-react';
import { type Chat } from '@/lib/chat-history-store';
import { useAuth } from '@/contexts/AuthContext';
import { useChatSync } from '@/hooks/useChatSync';
import { useNavigation } from '@/lib/stores/navigation';
import ChatItem from './ChatItem';

/**
 * ChatHistory Component
 *
 * Displays grouped chat history with time-based sections.
 * Handles both expanded and collapsed sidebar states.
 */

interface ChatHistoryProps {
  chats: Chat[];
  activeChatId: string | null;
  onChatClick: (chatId: string) => void;
  onTogglePin: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onDeleteChat: (chatId: string) => void;
  onExportPDF?: (chat: Chat) => void;
  onEmailSummary?: (chat: Chat) => void;
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

export default function ChatHistory({
  chats,
  activeChatId,
  onChatClick,
  onTogglePin,
  onRenameChat,
  onDeleteChat,
  onExportPDF,
  onEmailSummary
}: ChatHistoryProps) {
  const { user } = useAuth();
  const { isReady } = useChatSync();
  const { sidebarCollapsed } = useNavigation();

  const { today, previousWeek, older } = groupChatsByTime(chats);

  if (sidebarCollapsed) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col items-center py-4 space-y-2">
          {chats.slice(0, 5).map(chat => (
            <button
              key={chat.id}
              onClick={() => onChatClick(chat.id)}
              title={chat.title}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                activeChatId === chat.id ? 'bg-gray-200' : ''
              }`}
            >
              <MessageSquare className="h-4 w-4 text-gray-600" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="p-2">
        {today.length > 0 && (
          <>
            <div className="text-xs font-semibold text-gray-500 px-2 py-1.5">
              Today
            </div>
            {today.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={activeChatId === chat.id}
                onClick={() => onChatClick(chat.id)}
                onPin={() => onTogglePin(chat.id)}
                onRename={(newTitle) => onRenameChat(chat.id, newTitle)}
                onDelete={() => onDeleteChat(chat.id)}
                onExportPDF={onExportPDF ? () => onExportPDF(chat) : undefined}
                onEmailSummary={onEmailSummary ? () => onEmailSummary(chat) : undefined}
              />
            ))}
          </>
        )}

        {previousWeek.length > 0 && (
          <>
            <div className="text-xs font-semibold text-gray-500 px-2 py-1.5 mt-4">
              Previous 7 Days
            </div>
            {previousWeek.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={activeChatId === chat.id}
                onClick={() => onChatClick(chat.id)}
                onPin={() => onTogglePin(chat.id)}
                onRename={(newTitle) => onRenameChat(chat.id, newTitle)}
                onDelete={() => onDeleteChat(chat.id)}
                onExportPDF={onExportPDF ? () => onExportPDF(chat) : undefined}
                onEmailSummary={onEmailSummary ? () => onEmailSummary(chat) : undefined}
              />
            ))}
          </>
        )}

        {older.length > 0 && (
          <>
            <div className="text-xs font-semibold text-gray-500 px-2 py-1.5 mt-4">
              Older
            </div>
            {older.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={activeChatId === chat.id}
                onClick={() => onChatClick(chat.id)}
                onPin={() => onTogglePin(chat.id)}
                onRename={(newTitle) => onRenameChat(chat.id, newTitle)}
                onDelete={() => onDeleteChat(chat.id)}
                onExportPDF={onExportPDF ? () => onExportPDF(chat) : undefined}
                onEmailSummary={onEmailSummary ? () => onEmailSummary(chat) : undefined}
              />
            ))}
          </>
        )}

        {chats.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            {!user ? (
              <>
                <p className="text-sm font-medium">Ready to Get Started?</p>
                <p className="text-xs text-gray-400 mt-1">Log in to ask your first question</p>
              </>
            ) : !isReady ? (
              <>
                <p className="text-sm font-medium">Getting your conversations ready...</p>
                <p className="text-xs text-gray-400 mt-1">Just a moment!</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">No chats yet</p>
                <p className="text-xs text-gray-400 mt-1">Start a new conversation!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
