'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export interface PageHistoryEntry {
  path: string;
  title: string;
  timestamp: number;
  icon?: string;
}

const MAX_HISTORY_ITEMS = 10;
const STORAGE_KEY = 'chatnil-page-history';

// Page metadata mapping
const PAGE_METADATA: Record<string, { title: string; icon: string }> = {
  '/': { title: 'Home', icon: '💬' },
  '/dashboard': { title: 'Dashboard', icon: '📊' },
  '/profile': { title: 'Profile', icon: '👤' },
  '/badges': { title: 'Badges', icon: '🏆' },
  '/quizzes': { title: 'Quizzes', icon: '📝' },
  '/library': { title: 'Library', icon: '📚' },
  '/messages': { title: 'Messages', icon: '✉️' },
  '/settings': { title: 'Settings', icon: '⚙️' },
  '/opportunities': { title: 'Opportunities', icon: '💼' },
};

/**
 * Gets metadata for a given path
 */
function getPageMetadata(path: string): { title: string; icon: string } {
  // Direct match
  if (PAGE_METADATA[path]) {
    return PAGE_METADATA[path];
  }

  // Check for dynamic routes
  if (path.startsWith('/profile/')) {
    return { title: 'Profile', icon: '👤' };
  }

  // Default fallback
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || 'page';
  const title = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  return { title, icon: '📄' };
}

/**
 * Loads page history from localStorage
 */
function loadHistory(): PageHistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load page history:', error);
    return [];
  }
}

/**
 * Saves page history to localStorage
 */
function saveHistory(history: PageHistoryEntry[]) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save page history:', error);
  }
}

/**
 * Hook for tracking page navigation history
 */
export function usePageHistory() {
  const pathname = usePathname();
  const [history, setHistory] = useState<PageHistoryEntry[]>([]);

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Track page visits
  useEffect(() => {
    if (!pathname) return;

    // Skip public routes
    const publicRoutes = ['/login', '/signup', '/auth/callback', '/auth/confirm', '/reset-password', '/forgot-password'];
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return;
    }

    const { title, icon } = getPageMetadata(pathname);

    setHistory(prevHistory => {
      // Remove any existing entry for this path
      const filtered = prevHistory.filter(entry => entry.path !== pathname);

      // Add new entry at the beginning
      const newEntry: PageHistoryEntry = {
        path: pathname,
        title,
        icon,
        timestamp: Date.now(),
      };

      // Keep only the most recent MAX_HISTORY_ITEMS
      const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY_ITEMS);

      // Save to localStorage
      saveHistory(updated);

      return updated;
    });
  }, [pathname]);

  /**
   * Clears all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /**
   * Removes a specific entry from history
   */
  const removeEntry = useCallback((path: string) => {
    setHistory(prevHistory => {
      const updated = prevHistory.filter(entry => entry.path !== path);
      saveHistory(updated);
      return updated;
    });
  }, []);

  /**
   * Gets the most recent pages (excluding current)
   */
  const getRecentPages = useCallback((limit: number = 5): PageHistoryEntry[] => {
    return history
      .filter(entry => entry.path !== pathname) // Exclude current page
      .slice(0, limit);
  }, [history, pathname]);

  return {
    history,
    recentPages: getRecentPages(),
    clearHistory,
    removeEntry,
    getRecentPages,
  };
}
