'use client';

import { Menu, X, LayoutDashboard, Target, Mail, User, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMessagingStore, setMessagingUserRole, setMessagingUserId } from '@/lib/stores/messaging';
import { UnreadBadge } from '@/components/messaging/shared/UnreadBadge';

/**
 * HeaderMobileMenu Component
 *
 * Mobile hamburger menu for authenticated users.
 * Shows navigation links in a drawer layout.
 */

export default function HeaderMobileMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  const handleLogout = async () => {
    await logout();
    setShowMobileMenu(false);
  };

  if (!user) return null;

  // Determine messages route based on role
  const messagesRoute = user.role === 'agency' || user.role === 'business'
    ? '/agency/messages'
    : '/messages';

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors relative"
        aria-label="Mobile menu"
        aria-expanded={showMobileMenu}
      >
        {showMobileMenu ? (
          <X className="h-5 w-5 text-gray-600" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600" />
        )}
        {/* Show unread indicator on menu button */}
        {totalUnread > 0 && !showMobileMenu && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
        )}
      </button>

      {/* Mobile Navigation Drawer */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Mobile Menu */}
          <div className="fixed top-[73px] left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 md:hidden">
            <nav className="px-4 py-3 space-y-1">
              {/* Main Navigation */}
              <button
                onClick={() => {
                  router.push('/dashboard');
                  setShowMobileMenu(false);
                }}
                className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </button>

              <button
                onClick={() => {
                  router.push('/opportunities');
                  setShowMobileMenu(false);
                }}
                className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Target className="h-5 w-5 mr-3" />
                Opportunities
              </button>

              <button
                onClick={() => {
                  router.push(messagesRoute);
                  setShowMobileMenu(false);
                }}
                className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <span className="flex items-center">
                  <Mail className="h-5 w-5 mr-3" />
                  Messages
                </span>
                {totalUnread > 0 && (
                  <UnreadBadge count={totalUnread} size="sm" />
                )}
              </button>

              <div className="border-t border-gray-200 my-3" />

              {/* Profile and Settings */}
              <button
                onClick={() => {
                  router.push('/profile');
                  setShowMobileMenu(false);
                }}
                className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <User className="h-5 w-5 mr-3 text-gray-500" />
                Profile
              </button>

              <button
                onClick={() => {
                  router.push('/settings');
                  setShowMobileMenu(false);
                }}
                className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5 mr-3 text-gray-500" />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                See You Later
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
