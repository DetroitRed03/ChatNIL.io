'use client';

import { useAuth } from '@/contexts/AuthContext';
import HeaderLogo from './HeaderLogo';
import HeaderAuthButtons from './HeaderAuthButtons';
import HeaderUserMenu from './HeaderUserMenu';
import HeaderMobileMenu from './HeaderMobileMenu';

/**
 * Header Component
 *
 * Top navigation bar that's always visible.
 * Displays logo, auth buttons (when logged out), or user menu (when logged in).
 * Includes mobile menu for smaller screens.
 *
 * This is a refactored version using compound component pattern.
 */

export default function HeaderNew() {
  const { user } = useAuth();

  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-100 px-3 sm:px-4 py-3 sm:py-4 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-end">
        {/* Right Side - Auth Buttons or User Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Menu Button (only show when logged in) */}
          <HeaderMobileMenu />

          {!user ? (
            <HeaderAuthButtons />
          ) : (
            <HeaderUserMenu />
          )}
        </div>
      </div>
    </header>
  );
}
