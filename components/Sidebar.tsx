'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  MoreVertical,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Pin,
  Edit2,
  Trash2,
  FolderOpen,
  Menu,
  ChevronLeft,
  LayoutDashboard,
  Target,
  BookOpen,
  Mail
} from 'lucide-react';
import { useChatHistoryStore, type Chat, type RoleContext } from '@/lib/chat-history-store';
import SearchModal from './SearchModal';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useChatSync } from '@/hooks/useChatSync';
import Link from 'next/link';

interface SidebarProps {
  className?: string;
  isNonAuth?: boolean;
}

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
  onPin: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}

const ChatItem = ({ chat, isActive, onClick, onPin, onRename, onDelete }: ChatItemProps) => {
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
        className={`w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors text-left relative
          ${isActive ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
      >
        <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-500" />
        <div className="flex-1 min-w-0">
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
              <div className="text-sm truncate text-gray-900">{chat.title}</div>
              <div className="text-xs text-gray-500">{chat.messages.length} messages</div>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {chat.isPinned && <Pin className="w-3 h-3 text-orange-500 fill-current" />}
          <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(chat.updatedAt)}</span>
        </div>
      </button>

      {/* Menu button - only show on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreVertical className="w-3 h-3 text-gray-500" />
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
};

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

export default function Sidebar({ className = '', isNonAuth = false }: SidebarProps) {
  const {
    chats,
    activeChatId,
    sidebarCollapsed,
    searchQuery,
    newChat,
    beginDraft,
    setActiveChat,
    toggleSidebar,
    setSearchQuery,
    getFilteredChats,
    deleteChat,
    togglePin,
    renameChat
  } = useChatHistoryStore();

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBottomProfileMenu, setShowBottomProfileMenu] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
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

  // Group chats by time periods
  const { today, previousWeek, older } = groupChatsByTime(filteredChats);

  // Close profile menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProfileMenu(false);
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileMenu]);

  const handleNewChat = () => {
    beginDraft();
    router.push('/');
  };

  const handleChatClick = (chatId: string) => {
    setActiveChat(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    if (confirm('Delete this chat? This action cannot be undone.')) {
      deleteChat(chatId);
    }
  };

  const handleTogglePin = (chatId: string) => {
    togglePin(chatId);
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    renameChat(chatId, newTitle);
  };

  // Get user initials for profile icon
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.first_name || user.firstName || '';
    const lastName = user.last_name || user.lastName || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    const firstName = user.first_name || user.firstName || '';
    const lastName = user.last_name || user.lastName || '';
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) return firstName;
    return user.email || 'User';
  };

  const getUserRole = () => {
    if (!user?.role) return '';
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

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
    <aside
      className={`
        fixed left-0 top-0 bg-gray-50 border-r border-gray-200 flex flex-col h-screen
        transition-all duration-300 ease-in-out z-40
        ${sidebarCollapsed ? 'w-12' : 'w-64'}
        ${className}
      `}
    >
      {/* Fixed Header with Logo and Controls */}
      <div className="sticky top-0 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        {!sidebarCollapsed ? (
          <div className="p-3">
            {/* Logo Section */}
            <div className="flex items-center mb-3">
              <Link href="/" className="flex-1">
                <div className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">ChatNIL</span>
                </div>
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Control Buttons */}
            <div className="space-y-1">
              {/* New Chat */}
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Plus className="w-4 h-4 text-gray-700" />
                <span className="text-sm text-gray-900">New chat</span>
              </button>

              {/* Search Chats */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Search className="w-4 h-4 text-gray-700" />
                <span className="text-sm text-gray-900">Search chats</span>
              </button>

              {/* Library */}
              <button
                onClick={() => router.push('/library')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <FolderOpen className="w-4 h-4 text-gray-700" />
                <span className="text-sm text-gray-900">Library</span>
              </button>

              {/* Quizzes */}
              <button
                onClick={() => router.push('/quizzes')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <BookOpen className="w-4 h-4 text-gray-700" />
                <span className="text-sm text-gray-900">Quizzes</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-3 space-y-2">
            {/* Logo Icon */}
            <Link href="/" title="Go to homepage">
              <div className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
              </div>
            </Link>

            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Expand sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="w-full h-px bg-gray-200 my-1"></div>

            {/* Control Icons */}
            <button
              onClick={handleNewChat}
              className="p-2 hover:bg-gray-200 rounded-md transition-colors"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2 hover:bg-gray-200 rounded-md transition-colors"
              title="Search Chats"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/library')}
              className="p-2 hover:bg-gray-200 rounded-md transition-colors"
              title="Library"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/quizzes')}
              className="p-2 hover:bg-gray-200 rounded-md transition-colors"
              title="Quizzes"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectChat={(chatId) => {
          handleChatClick(chatId);
          setShowSearchModal(false);
        }}
      />

      {/* Scrollable Chat History */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {!sidebarCollapsed ? (
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
                    onClick={() => handleChatClick(chat.id)}
                    onPin={() => handleTogglePin(chat.id)}
                    onRename={(newTitle) => handleRenameChat(chat.id, newTitle)}
                    onDelete={() => handleDeleteChat(chat.id)}
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
                    onClick={() => handleChatClick(chat.id)}
                    onPin={() => handleTogglePin(chat.id)}
                    onRename={(newTitle) => handleRenameChat(chat.id, newTitle)}
                    onDelete={() => handleDeleteChat(chat.id)}
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
                    onClick={() => handleChatClick(chat.id)}
                    onPin={() => handleTogglePin(chat.id)}
                    onRename={(newTitle) => handleRenameChat(chat.id, newTitle)}
                    onDelete={() => handleDeleteChat(chat.id)}
                  />
                ))}
              </>
            )}

            {filteredChats.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                {!user ? (
                  <>
                    <p className="text-sm">Please log in</p>
                    <p className="text-xs text-gray-400 mt-1">Sign in to see your chats</p>
                  </>
                ) : !isReady ? (
                  <>
                    <p className="text-sm">Loading your chats...</p>
                    <p className="text-xs text-gray-400 mt-1">Setting up your workspace</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm">No chats yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start a new conversation!</p>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Collapsed sidebar - simple chat indicators */
          <div className="flex flex-col items-center py-4 space-y-2">
            {filteredChats.slice(0, 5).map(chat => (
              <button
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                title={chat.title}
                className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                  activeChatId === chat.id ? 'bg-gray-200' : ''
                }`}
              >
                <MessageSquare className="h-4 w-4 text-gray-600" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Profile Section at Bottom */}
      {user && (
        <div className={`fixed bottom-0 bg-gray-50 border-t border-gray-200 flex-shrink-0 z-30 transition-all duration-300 ${
          sidebarCollapsed ? 'left-0 w-12' : 'left-0 w-64'
        }`}>
          {!sidebarCollapsed ? (
            <div className="p-3 relative">
              <button
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                onClick={() => setShowBottomProfileMenu(!showBottomProfileMenu)}
              >
                <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm overflow-hidden flex-shrink-0">
                  {(user.profile as any)?.profile_image_url ? (
                    <img
                      src={(user.profile as any).profile_image_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-white">
                      {getUserInitials()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-900 truncate">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                </div>
                <MoreVertical className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </button>

              {/* Dropdown Menu */}
              {showBottomProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowBottomProfileMenu(false)}
                  />
                  <div className="absolute left-3 right-3 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                    <div className="py-2">
                      {/* Navigation Items */}
                      <button
                        onClick={() => {
                          setShowBottomProfileMenu(false);
                          router.push('/dashboard');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-3 text-gray-500" />
                        Dashboard
                      </button>

                      <button
                        onClick={() => {
                          setShowBottomProfileMenu(false);
                          router.push('/opportunities');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Target className="h-4 w-4 mr-3 text-gray-500" />
                        Opportunities
                      </button>

                      <button
                        onClick={() => {
                          setShowBottomProfileMenu(false);
                          router.push('/messages');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Mail className="h-4 w-4 mr-3 text-gray-500" />
                        Messages
                      </button>

                      <div className="border-t border-gray-100 my-1" />

                      <button
                        onClick={() => {
                          setShowBottomProfileMenu(false);
                          router.push('/profile');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3 text-gray-500" />
                        Profile
                      </button>

                      <button
                        onClick={() => {
                          setShowBottomProfileMenu(false);
                          router.push('/settings');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-500" />
                        Settings
                      </button>

                      <div className="border-t border-gray-100 my-1" />

                      <button
                        onClick={async () => {
                          setShowBottomProfileMenu(false);
                          await logout();
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-3 relative">
              <button
                onClick={() => setShowBottomProfileMenu(!showBottomProfileMenu)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title={getUserDisplayName()}
              >
                <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center overflow-hidden">
                  {(user.profile as any)?.profile_image_url ? (
                    <img
                      src={(user.profile as any).profile_image_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-white">
                      {getUserInitials()}
                    </span>
                  )}
                </div>
              </button>

              {/* Dropdown Menu for Collapsed State */}
              {showBottomProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowBottomProfileMenu(false)}
                  />
                  <div className="absolute left-full bottom-0 ml-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-semibold text-gray-900 truncate">{getUserDisplayName()}</p>
                        <p className="text-xs text-gray-600 mt-1 truncate">{user.email}</p>
                      </div>

                      {/* Navigation Items */}
                      <button
                        onClick={() => {
                          setShowBottomProfileMenu(false);
                          router.push('/dashboard');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-3 text-gray-500" />
                        Dashboard
                      </button>

                      <button
                        onClick={() => {
                          setShowBottomProfileMenu(false);
                          router.push('/opportunities');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Target className="h-4 w-4 mr-3 text-gray-500" />
                        Opportunities
                      </button>

                      <button
                        onClick={() => {
                          setShowBottomProfileMenu(false);
                          router.push('/messages');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Mail className="h-4 w-4 mr-3 text-gray-500" />
                        Messages
                      </button>

                      <div className="border-t border-gray-100 my-1" />

                      <button
                        onClick={() => {
                          setShowBottomProfileMenu(false);
                          router.push('/profile');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3 text-gray-500" />
                        Profile
                      </button>

                      <button
                        onClick={() => {
                          setShowBottomProfileMenu(false);
                          router.push('/settings');
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-500" />
                        Settings
                      </button>

                      <div className="border-t border-gray-100 my-1" />

                      <button
                        onClick={async () => {
                          setShowBottomProfileMenu(false);
                          await logout();
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

    </aside>
  );
}