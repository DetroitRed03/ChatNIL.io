'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import HeaderNew from '@/components/Navigation/Header';
import Sidebar from '@/components/Navigation/Sidebar';
import SearchModal from '@/components/SearchModal';
import KeyboardShortcutsModal from '@/components/Navigation/KeyboardShortcutsModal';
import { useNavigation } from '@/lib/stores/navigation';
import { useKeyboardShortcuts, createShortcut } from '@/hooks/useKeyboardShortcuts';
import { useState } from 'react';

/**
 * NavigationShell Component
 *
 * Orchestrates the layout of Header + Sidebar navigation.
 * Handles:
 * - Public vs authenticated routes
 * - Responsive behavior
 * - Layout composition
 * - Conditional navigation rendering
 */

// Routes that should NOT show navigation (public pages)
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/auth/callback',
  '/auth/confirm',
  '/reset-password',
  '/forgot-password'
];

// Routes that should show ONLY header (no sidebar)
const HEADER_ONLY_ROUTES = [
  '/onboarding',
  '/welcome',
  '/athletes',  // Public athlete profiles - show header for navigation, but no sidebar
  '/assessment' // Assessment pages - cleaner layout without sidebar
];

// Routes that should NOT show navigation (they have their own layout)
const NO_NAV_ROUTES = [
  '/agencies', // Agency routes have their own AgencyTopNav (legacy plural)
  '/agency'    // Agency routes have their own AgencyTopNav (singular)
];

interface NavigationShellProps {
  children: React.ReactNode;
}

export default function NavigationShell({ children }: NavigationShellProps) {
  const { user, isLoading: loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, sidebarWidth, toggleSidebar } = useNavigation();
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Check if current route is public (never shows navigation)
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

  // Check if current route should show header only
  const isHeaderOnlyRoute = HEADER_ONLY_ROUTES.some(route => pathname?.startsWith(route));

  // Check if current route should NOT show navigation (has its own layout)
  const isNoNavRoute = NO_NAV_ROUTES.some(route => pathname?.startsWith(route));

  // Agency users on /messages should be redirected - don't show athlete sidebar
  const isAgencyOnMessagesRoute = (user?.role === 'agency' || user?.role === 'business') && pathname === '/messages';

  // Homepage special handling: no nav when not authenticated, full nav when authenticated
  const isHomepage = pathname === '/';
  const showHomepageNav = isHomepage && user;

  // Determine what navigation to show
  const showHeader = !isPublicRoute && (!isHomepage || showHomepageNav);
  const showSidebar = user && !isPublicRoute && !isHeaderOnlyRoute && !isAgencyOnMessagesRoute && (!isHomepage || showHomepageNav);

  // Role-aware quick navigation shortcuts
  const getRoleSpecificShortcuts = () => {
    const baseShortcuts = [
      createShortcut('k', () => setShowSearch(true), 'Open search'),
      createShortcut('b', () => toggleSidebar(), 'Toggle sidebar'),
      createShortcut('n', () => router.push('/'), 'New chat'),
      createShortcut('/', () => setShowShortcutsHelp(prev => !prev), 'Show keyboard shortcuts'),
      { key: '1', meta: true, description: 'Go to Dashboard', category: 'navigation' as const, action: () => router.push(user?.role === 'agency' ? '/agency/dashboard' : '/dashboard') },
      { key: '2', meta: true, description: 'Go to Profile', category: 'navigation' as const, action: () => router.push('/profile') },
      { key: 'Escape', description: 'Close search', category: 'general' as const, action: () => setShowSearch(false), disabled: !showSearch },
    ];

    // Add athlete-specific shortcuts
    if (user?.role === 'athlete') {
      return [
        ...baseShortcuts,
        { key: '3', meta: true, description: 'Go to Badges', category: 'navigation' as const, action: () => router.push('/badges') },
        { key: '4', meta: true, description: 'Go to Quizzes', category: 'navigation' as const, action: () => router.push('/quizzes') },
        { key: '5', meta: true, description: 'Go to Library', category: 'navigation' as const, action: () => router.push('/library') },
        { key: '6', meta: true, description: 'Go to Messages', category: 'navigation' as const, action: () => router.push('/messages') },
        { key: '7', meta: true, description: 'Go to Settings', category: 'navigation' as const, action: () => router.push('/settings') },
      ];
    }

    // Add agency-specific shortcuts
    if (user?.role === 'agency') {
      return [
        ...baseShortcuts,
        { key: '3', meta: true, description: 'Go to Discover', category: 'navigation' as const, action: () => router.push('/agency/discover') },
        { key: '4', meta: true, description: 'Go to Campaigns', category: 'navigation' as const, action: () => router.push('/agency/campaigns') },
        { key: '5', meta: true, description: 'Go to Athletes', category: 'navigation' as const, action: () => router.push('/agency/athletes') },
        { key: '6', meta: true, description: 'Go to Messages', category: 'navigation' as const, action: () => router.push('/agency/messages') },
        { key: '7', meta: true, description: 'Go to Settings', category: 'navigation' as const, action: () => router.push('/settings') },
      ];
    }

    // Default shortcuts for other roles
    return [
      ...baseShortcuts,
      { key: '6', meta: true, description: 'Go to Messages', category: 'navigation' as const, action: () => router.push('/messages') },
      { key: '7', meta: true, description: 'Go to Settings', category: 'navigation' as const, action: () => router.push('/settings') },
    ];
  };

  // Keyboard shortcuts - only enabled when not on public routes
  useKeyboardShortcuts(
    getRoleSpecificShortcuts(),
    {
      enabled: !isPublicRoute, // Only enable shortcuts when not on public routes
      disableInInputs: true,
    }
  );

  // Don't render navigation while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Public route - no navigation
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // No nav route (like agency routes with their own layout) - just render children
  if (isNoNavRoute) {
    return <>{children}</>;
  }

  // Header only route (like onboarding)
  if (isHeaderOnlyRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {showHeader && <HeaderNew />}
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // Full navigation layout (Header + Sidebar)
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {showHeader && <HeaderNew />}

        <div className="flex-1 flex overflow-hidden">
          {showSidebar && <Sidebar />}

          <main
            style={{
              marginLeft: showSidebar ? (sidebarCollapsed ? '48px' : `${sidebarWidth}px`) : '0'
            }}
            className={`
              flex-1 overflow-auto
              transition-none
            `}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectChat={(chatId) => {
          router.push('/');
          setShowSearch(false);
        }}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
    </>
  );
}
