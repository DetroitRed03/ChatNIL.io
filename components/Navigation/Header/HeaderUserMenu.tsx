'use client';

import { ChevronDown, User, Settings, LogOut, LayoutDashboard, Target, Mail } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { useMessagingStore, setMessagingUserRole, setMessagingUserId } from '@/lib/stores/messaging';
import { UnreadBadge } from '@/components/messaging/shared/UnreadBadge';

/**
 * HeaderUserMenu Component
 *
 * User profile dropdown menu in the header.
 * Displays avatar, user info, and navigation links.
 */

export default function HeaderUserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { totalUnread, fetchUnreadCount } = useMessagingStore();

  // Fetch unread count on mount and set user role
  useEffect(() => {
    if (user?.id) {
      const role = user.role === 'agency' || user.role === 'business' ? 'agency' : 'athlete';
      setMessagingUserRole(role);
      setMessagingUserId(user.id);
      fetchUnreadCount();

      // Poll for unread count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id, user?.role, fetchUnreadCount]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    // Redirect to home page after logout
    router.push('/');
  };

  if (!user) return null;

  // Determine messages route based on role
  const messagesRoute = user.role === 'agency' || user.role === 'business'
    ? '/agency/messages'
    : '/messages';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors relative"
        aria-label="User menu"
        aria-expanded={showUserMenu}
        aria-haspopup="true"
      >
        <div className="relative">
          <Avatar
            src={(user.profile as any)?.profile_photo_url}
            alt={`${user.name}'s profile`}
            fallback={user.name}
            size="sm"
            className="w-7 h-7 sm:w-9 sm:h-9"
          />
          {/* Unread indicator dot on avatar */}
          {totalUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white" />
          )}
        </div>
        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" aria-hidden="true" />
      </button>

      {/* Dropdown Menu */}
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="py-2">
            {/* User Info Header */}
            <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{user.email}</p>
            </div>

            {/* Navigation Items */}
            <button
              onClick={() => {
                setShowUserMenu(false);
                router.push('/dashboard');
              }}
              className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 mr-3 text-gray-500" />
              Dashboard
            </button>

            {/* Athlete-only feature */}
            {user.role === 'athlete' && (
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  router.push('/opportunities');
                }}
                className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Target className="h-4 w-4 mr-3 text-gray-500" />
                Opportunities
              </button>
            )}

            <button
              onClick={() => {
                setShowUserMenu(false);
                router.push(messagesRoute);
              }}
              className="flex items-center justify-between w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-gray-500" />
                Messages
              </span>
              {totalUnread > 0 && (
                <UnreadBadge count={totalUnread} size="sm" />
              )}
            </button>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={() => {
                setShowUserMenu(false);
                router.push('/profile');
              }}
              className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="h-4 w-4 mr-3 text-gray-500" />
              Profile
            </button>

            <button
              onClick={() => {
                setShowUserMenu(false);
                router.push('/settings');
              }}
              className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 mr-3 text-gray-500" />
              Settings
            </button>

            <div className="border-t border-gray-100 my-1 sm:my-2" />

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3 text-gray-500" />
              See You Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
