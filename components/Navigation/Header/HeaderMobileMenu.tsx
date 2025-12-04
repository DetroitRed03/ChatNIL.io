'use client';

import { Menu, X, LayoutDashboard, Target, Mail, User, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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

  const handleLogout = async () => {
    await logout();
    setShowMobileMenu(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Mobile menu"
        aria-expanded={showMobileMenu}
      >
        {showMobileMenu ? (
          <X className="h-5 w-5 text-gray-600" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600" />
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
                  router.push('/messages');
                  setShowMobileMenu(false);
                }}
                className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Mail className="h-5 w-5 mr-3" />
                Messages
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
