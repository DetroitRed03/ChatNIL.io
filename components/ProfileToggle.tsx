'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatHistoryStore } from '@/lib/chat-history-store';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react';
import Link from 'next/link';

interface ProfileMenuProps {
  className?: string;
}

export default function ProfileMenu({ className = '' }: ProfileMenuProps) {
  const { user } = useAuth();
  const { sidebarCollapsed } = useChatHistoryStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log('Logout clicked');
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className={`fixed bottom-4 z-50 transition-all duration-300 ${
      sidebarCollapsed ? 'left-4' : 'left-4'
    } ${className}`}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 ease-out hover:bg-orange-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        title={getUserDisplayName()}
        aria-label="Open profile menu"
      >
        <span className="select-none">
          {getUserInitials()}
        </span>
      </button>

      {/* Popup Menu */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu popup */}
          <div className="absolute bottom-12 left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getUserInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{getUserDisplayName()}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                  {getUserRole() && (
                    <div className="text-xs text-gray-400">{getUserRole()} Profile</div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-2">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                <span className="text-sm">My profile</span>
              </Link>

              <Link
                href="/help"
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm">Help</span>
              </Link>

              <button
                className="flex items-center gap-3 px-4 py-2 w-full hover:bg-gray-100 transition-colors text-left"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>

              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 w-full hover:bg-gray-100 transition-colors text-left text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Log out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}