'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Navigation/Sidebar';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isScrollablePage, setIsScrollablePage] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default: 256px (w-64)
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Determine if current page needs scrolling
    const scrollablePages = [
      '/profile',
      '/settings',
      '/quizzes',
      '/library',
      '/messages',
      '/opportunities',
      '/dashboard'
    ];

    const needsScrolling = scrollablePages.some(page => pathname.includes(page));
    setIsScrollablePage(needsScrolling);

    // Set body overflow based on page type
    if (needsScrolling) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [pathname]);

  // Listen for sidebar collapse state from localStorage
  useEffect(() => {
    const checkSidebarState = () => {
      try {
        const stored = localStorage.getItem('chatnil-chat-history-v3');
        if (stored) {
          const state = JSON.parse(stored);
          const collapsed = state.state?.sidebarCollapsed ?? false;
          setSidebarWidth(collapsed ? 48 : 256); // w-12 = 48px, w-64 = 256px
        }
      } catch (e) {
        // Silently ignore parse errors - localStorage may have corrupted data
        // Just use default state
        setSidebarWidth(256); // Default to expanded
      }
    };

    checkSidebarState();

    // Listen for storage changes
    const handleStorage = () => checkSidebarState();
    window.addEventListener('storage', handleStorage);

    // Poll for changes (since localStorage events don't fire in same window)
    const interval = setInterval(checkSidebarState, 100);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // On mobile, no sidebar margin needed (sidebar is hidden)
  const effectiveSidebarWidth = isMobile ? 0 : sidebarWidth;

  // Chat interface: fixed height, no scrolling on container
  // Other pages: allow scrolling by removing height constraint
  const containerClasses = isScrollablePage
    ? "min-h-screen bg-white" // Allow natural scrolling
    : "h-[100dvh] bg-white overflow-hidden"; // Chat: fixed viewport height

  const mainContentClasses = isScrollablePage
    ? "flex flex-col min-w-0" // Natural height, pages handle their own scrolling
    : "flex-1 flex flex-col min-w-0 min-h-0"; // Chat: fixed height

  return (
    <>
      {/* Collapsible Sidebar - now fixed */}
      <Sidebar />

      {/* Main Content Area - offset by sidebar width (not on mobile) */}
      <div
        className={containerClasses}
        style={isScrollablePage ? {
          marginLeft: `${effectiveSidebarWidth}px`
        } : {
          height: '100svh',
          marginLeft: `${effectiveSidebarWidth}px`
        }}
      >
        <div className={mainContentClasses}>
          {children}
        </div>
      </div>
    </>
  );
}