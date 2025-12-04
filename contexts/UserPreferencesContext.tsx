/**
 * User Preferences Context
 *
 * Manages user-specific preferences with localStorage persistence:
 * - Theme preferences (light/dark mode)
 * - Dashboard layout preferences
 * - Notification settings
 * - Display preferences
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserPreferences {
  // Theme
  theme: 'light' | 'dark' | 'system';

  // Dashboard layout
  dashboardLayout: 'grid' | 'list';
  compactMode: boolean;

  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationSound: boolean;

  // Display
  showProfileCompletionBanner: boolean;
  showOnboardingHints: boolean;

  // Data refresh
  autoRefreshData: boolean;
  refreshInterval: number; // in seconds
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  dashboardLayout: 'grid',
  compactMode: false,
  emailNotifications: true,
  pushNotifications: true,
  notificationSound: true,
  showProfileCompletionBanner: true,
  showOnboardingHints: true,
  autoRefreshData: true,
  refreshInterval: 30,
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const STORAGE_KEY = 'chatnil-user-preferences';

/**
 * Provider component for user preferences
 */
export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.error('Error saving user preferences:', error);
      }
    }
  }, [preferences, isHydrated]);

  // Apply theme to document
  useEffect(() => {
    if (!isHydrated) return;

    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

    const activeTheme = preferences.theme === 'system' ? systemTheme : preferences.theme;

    root.classList.remove('light', 'dark');
    root.classList.add(activeTheme);
  }, [preferences.theme, isHydrated]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: UserPreferencesContextType = {
    preferences,
    updatePreferences,
    resetPreferences,
  };

  // Don't render children until preferences are loaded to avoid hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

/**
 * Hook to access user preferences
 */
export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);

  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }

  return context;
}

/**
 * Hook to quickly access and update a specific preference
 */
export function usePreference<K extends keyof UserPreferences>(
  key: K
): [UserPreferences[K], (value: UserPreferences[K]) => void] {
  const { preferences, updatePreferences } = useUserPreferences();

  const setValue = (value: UserPreferences[K]) => {
    updatePreferences({ [key]: value });
  };

  return [preferences[key], setValue];
}
