'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import HeaderNew from '@/components/Navigation/Header';
import Sidebar from '@/components/Navigation/Sidebar';
import { ComplianceOfficerSidebar } from '@/components/Navigation/Sidebar/ComplianceOfficerSidebar';
import SearchModal from '@/components/SearchModal';
import { AICoachButton } from '@/components/AICoachButton';
import KeyboardShortcutsModal from '@/components/Navigation/KeyboardShortcutsModal';
import Breadcrumbs from '@/components/Navigation/Breadcrumbs';
import { useNavigation } from '@/lib/stores/navigation';
import { useKeyboardShortcuts, createShortcut } from '@/hooks/useKeyboardShortcuts';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { buildBreadcrumbs } from '@/lib/breadcrumb-config';
import { useState, useEffect, useMemo } from 'react';

/**
 * NavigationShell Component
 *
 * Orchestrates the layout of Header + Sidebar navigation.
 * Handles:
 * - Public vs authenticated routes
 * - Responsive behavior
 * - Layout composition
 * - Conditional navigation rendering
 *
 * PAUSED FEATURES (Marketplace/Messaging) - Intentionally removed:
 * - Agency-specific shortcuts (agency routes are paused)
 * - Messages shortcuts (messaging is paused)
 *
 * These can be re-enabled when marketplace features are activated.
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
// NOTE: Agency routes are PAUSED - keeping this for when they're re-enabled
const NO_NAV_ROUTES = [
  '/agencies', // Agency routes have their own AgencyTopNav (legacy plural)
  '/agency'    // Agency routes have their own AgencyTopNav (singular)
];

interface NavigationShellProps {
  children: React.ReactNode;
}

export default function NavigationShell({ children }: NavigationShellProps) {
  const { user, isLoading: loading, isLoadingProfile } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, sidebarWidth, toggleSidebar } = useNavigation();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: 0 });
  }, [pathname]);

  // Check if current route is public (never shows navigation)
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

  // Check if current route should show header only
  const isHeaderOnlyRoute = HEADER_ONLY_ROUTES.some(route => pathname?.startsWith(route));

  // Check if current route should NOT show navigation (has its own layout)
  const isNoNavRoute = NO_NAV_ROUTES.some(route => pathname?.startsWith(route));

  // Homepage special handling: no nav when not authenticated, full nav when authenticated
  const isHomepage = pathname === '/';
  const showHomepageNav = isHomepage && user;

  // Determine what navigation to show
  const showHeader = !isPublicRoute && (!isHomepage || showHomepageNav);
  const showSidebar = user && !isPublicRoute && !isHeaderOnlyRoute && (!isHomepage || showHomepageNav);

  // Build breadcrumbs for current route
  const breadcrumbItems = useMemo(() => {
    if (!pathname || !user) return [];
    return buildBreadcrumbs(pathname, user.role);
  }, [pathname, user]);

  const showBreadcrumbs = user && breadcrumbItems.length > 0 && !isPublicRoute && !isHomepage;

  // Determine if user is a compliance officer or on compliance routes
  const isComplianceOfficer = user?.role === 'compliance_officer';
  const isComplianceRoute = pathname?.startsWith('/compliance');
  const showComplianceSidebar = isComplianceOfficer || isComplianceRoute;

  // Role-aware quick navigation shortcuts (compliance-focused, no paused features)
  const getRoleSpecificShortcuts = () => {
    const baseShortcuts = [
      createShortcut('k', () => setShowSearch(true), 'Open search'),
      createShortcut('b', () => toggleSidebar(), 'Toggle sidebar'),
      createShortcut('n', () => router.push('/'), 'New chat'),
      createShortcut('/', () => setShowShortcutsHelp(prev => !prev), 'Show keyboard shortcuts'),
      { key: '1', meta: true, description: 'Go to Dashboard', category: 'navigation' as const, action: () => router.push('/dashboard') },
      { key: '2', meta: true, description: 'Go to Profile', category: 'navigation' as const, action: () => router.push('/profile') },
      { key: 'Escape', description: 'Close search', category: 'general' as const, action: () => setShowSearch(false), disabled: !showSearch },
    ];

    // HS Student shortcuts
    if (user?.role === 'hs_student') {
      return [
        ...baseShortcuts,
        { key: '3', meta: true, description: 'Go to Discovery', category: 'navigation' as const, action: () => router.push('/discovery') },
        { key: '4', meta: true, description: 'Go to Quizzes', category: 'navigation' as const, action: () => router.push('/quizzes') },
        { key: '5', meta: true, description: 'Go to Library', category: 'navigation' as const, action: () => router.push('/library') },
        { key: '6', meta: true, description: 'Go to Settings', category: 'navigation' as const, action: () => router.push('/settings') },
      ];
    }

    // College athlete shortcuts
    if (user?.role === 'athlete' || user?.role === 'college_athlete') {
      return [
        ...baseShortcuts,
        { key: '3', meta: true, description: 'Validate Deal', category: 'navigation' as const, action: () => router.push('/deals/validate') },
        { key: '4', meta: true, description: 'Go to Settings', category: 'navigation' as const, action: () => router.push('/settings') },
      ];
    }

    // Compliance officer shortcuts
    if (user?.role === 'compliance_officer') {
      return [
        ...baseShortcuts,
        { key: '3', meta: true, description: 'View Athletes', category: 'navigation' as const, action: () => router.push('/compliance/athletes') },
        { key: '4', meta: true, description: 'Go to Reports', category: 'navigation' as const, action: () => router.push('/compliance/reports') },
        { key: '5', meta: true, description: 'Go to Settings', category: 'navigation' as const, action: () => router.push('/settings') },
      ];
    }

    // Parent shortcuts
    if (user?.role === 'parent') {
      return [
        ...baseShortcuts,
        { key: '3', meta: true, description: 'Go to Settings', category: 'navigation' as const, action: () => router.push('/settings') },
      ];
    }

    // Default shortcuts for other roles
    return [
      ...baseShortcuts,
      { key: '3', meta: true, description: 'Go to Settings', category: 'navigation' as const, action: () => router.push('/settings') },
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

  // Only block rendering during initial auth load — NOT during profile refreshes.
  // Blocking on isLoadingProfile causes full-page flash on tab switches/navigation
  // because onAuthStateChange fires visibility events that re-trigger profile loads.
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
      <div className="h-screen bg-gray-50 flex flex-col overflow-y-hidden overflow-x-auto">
        {showHeader && <HeaderNew />}

        <div className="flex-1 flex overflow-y-hidden overflow-x-auto">
          {showSidebar && (
            showComplianceSidebar ? <ComplianceOfficerSidebar /> : <Sidebar />
          )}

          <main
            style={{
              marginLeft: (showSidebar && isDesktop)
                ? (showComplianceSidebar
                    ? (sidebarCollapsed ? '48px' : '256px')  // Fixed width for compliance sidebar
                    : (sidebarCollapsed ? '48px' : `${sidebarWidth}px`))
                : '0'
            }}
            className={`
              flex-1 overflow-auto relative
              transition-none
            `}
          >
            {/* Breadcrumb Navigation */}
            {showBreadcrumbs && (
              <div className="bg-gray-50/60 border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-2.5">
                <div className="max-w-7xl mx-auto">
                  <Breadcrumbs items={breadcrumbItems} showHomeIcon={true} />
                </div>
              </div>
            )}
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

      {/* AI Coach Floating Button - All authenticated users */}
      {user && <AICoachButton />}

    </>
  );
}
