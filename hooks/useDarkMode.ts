'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'chatnil-dark-mode';
const AUTO_SCHEDULE_KEY = 'chatnil-auto-schedule';
const DARK_CLASS = 'dark';
const TIME_CHECK_INTERVAL = 60 * 1000; // Check every 60 seconds

type Theme = 'light' | 'dark' | 'system' | 'auto';

interface TimeConfig {
  hour: number;   // 0-23
  minute: number; // 0-59
}

interface AutoSchedule {
  lightModeStart: TimeConfig;
  darkModeStart: TimeConfig;
}

/**
 * Default auto-schedule: 7 AM light, 7 PM dark
 */
const DEFAULT_AUTO_SCHEDULE: AutoSchedule = {
  lightModeStart: { hour: 7, minute: 0 },
  darkModeStart: { hour: 19, minute: 0 }
};

/**
 * Gets the system preference for dark mode
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Loads custom auto schedule from localStorage, or returns default
 */
function loadAutoSchedule(): AutoSchedule {
  if (typeof window === 'undefined') return DEFAULT_AUTO_SCHEDULE;

  try {
    const stored = localStorage.getItem(AUTO_SCHEDULE_KEY);
    if (!stored) return DEFAULT_AUTO_SCHEDULE;

    const parsed = JSON.parse(stored) as AutoSchedule;

    // Validate the schedule
    if (
      parsed.lightModeStart &&
      parsed.darkModeStart &&
      typeof parsed.lightModeStart.hour === 'number' &&
      typeof parsed.lightModeStart.minute === 'number' &&
      typeof parsed.darkModeStart.hour === 'number' &&
      typeof parsed.darkModeStart.minute === 'number' &&
      parsed.lightModeStart.hour >= 0 && parsed.lightModeStart.hour <= 23 &&
      parsed.darkModeStart.hour >= 0 && parsed.darkModeStart.hour <= 23 &&
      parsed.lightModeStart.minute >= 0 && parsed.lightModeStart.minute <= 59 &&
      parsed.darkModeStart.minute >= 0 && parsed.darkModeStart.minute <= 59
    ) {
      return parsed;
    }

    return DEFAULT_AUTO_SCHEDULE;
  } catch (error) {
    console.error('Failed to load auto schedule:', error);
    return DEFAULT_AUTO_SCHEDULE;
  }
}

/**
 * Determines if dark mode should be active based on current time
 */
function shouldBeInDarkMode(schedule: AutoSchedule): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const lightStart = schedule.lightModeStart.hour * 60 + schedule.lightModeStart.minute;
  const darkStart = schedule.darkModeStart.hour * 60 + schedule.darkModeStart.minute;

  // If dark mode starts later in the day than light mode (normal case: light at 7 AM, dark at 7 PM)
  // Then we're in dark mode if current time is >= dark start OR < light start
  if (darkStart > lightStart) {
    return currentMinutes >= darkStart || currentMinutes < lightStart;
  }
  // If light mode starts later than dark mode (unusual case)
  // Then we're in dark mode if current time is >= dark start AND < light start
  else {
    return currentMinutes >= darkStart && currentMinutes < lightStart;
  }
}

/**
 * Calculates the resolved theme for 'auto' mode
 */
function getAutoTheme(schedule: AutoSchedule): 'light' | 'dark' {
  return shouldBeInDarkMode(schedule) ? 'dark' : 'light';
}

/**
 * Loads saved theme from localStorage
 */
function loadTheme(): Theme {
  if (typeof window === 'undefined') return 'system';

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return 'system';

    const parsed = stored as Theme;
    if (['light', 'dark', 'system', 'auto'].includes(parsed)) {
      return parsed;
    }
    return 'system';
  } catch (error) {
    console.error('Failed to load theme:', error);
    return 'system';
  }
}

/**
 * Saves theme to localStorage
 */
function saveTheme(theme: Theme) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.error('Failed to save theme:', error);
  }
}

/**
 * Applies theme to document
 */
function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return;

  if (theme === 'dark') {
    document.documentElement.classList.add(DARK_CLASS);
  } else {
    document.documentElement.classList.remove(DARK_CLASS);
  }
}

/**
 * Hook for dark mode functionality
 */
export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [autoSchedule, setAutoSchedule] = useState<AutoSchedule>(DEFAULT_AUTO_SCHEDULE);

  // Load theme on mount
  useEffect(() => {
    const savedTheme = loadTheme();
    const savedSchedule = loadAutoSchedule();
    setTheme(savedTheme);
    setAutoSchedule(savedSchedule);

    // Determine resolved theme
    let resolved: 'light' | 'dark';
    if (savedTheme === 'system') {
      resolved = getSystemTheme();
    } else if (savedTheme === 'auto') {
      resolved = getAutoTheme(savedSchedule);
    } else {
      resolved = savedTheme;
    }
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newTheme);
      applyTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Auto mode: Check time periodically and switch themes
  useEffect(() => {
    if (theme !== 'auto') return;

    // Immediately check and apply correct theme
    const resolved = getAutoTheme(autoSchedule);
    if (resolved !== resolvedTheme) {
      setResolvedTheme(resolved);
      applyTheme(resolved);
    }

    // Check every minute for theme transitions
    const intervalId = setInterval(() => {
      const newResolved = getAutoTheme(autoSchedule);
      if (newResolved !== resolvedTheme) {
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      }
    }, TIME_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [theme, autoSchedule, resolvedTheme]);

  /**
   * Sets theme to light
   */
  const setLightMode = useCallback(() => {
    setTheme('light');
    setResolvedTheme('light');
    applyTheme('light');
    saveTheme('light');
  }, []);

  /**
   * Sets theme to dark
   */
  const setDarkMode = useCallback(() => {
    setTheme('dark');
    setResolvedTheme('dark');
    applyTheme('dark');
    saveTheme('dark');
  }, []);

  /**
   * Sets theme to system preference
   */
  const setSystemMode = useCallback(() => {
    setTheme('system');
    const systemTheme = getSystemTheme();
    setResolvedTheme(systemTheme);
    applyTheme(systemTheme);
    saveTheme('system');
  }, []);

  /**
   * Sets theme to auto (time-based)
   */
  const setAutoMode = useCallback(() => {
    const schedule = loadAutoSchedule();
    setAutoSchedule(schedule);
    setTheme('auto');
    const resolved = getAutoTheme(schedule);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    saveTheme('auto');
  }, []);

  /**
   * Toggles between light and dark (skips system and auto)
   */
  const toggleTheme = useCallback(() => {
    if (resolvedTheme === 'dark') {
      setLightMode();
    } else {
      setDarkMode();
    }
  }, [resolvedTheme, setLightMode, setDarkMode]);

  return {
    theme, // Current theme setting ('light', 'dark', 'system', 'auto')
    resolvedTheme, // Actual applied theme ('light' or 'dark')
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
    isAuto: theme === 'auto',
    setLightMode,
    setDarkMode,
    setSystemMode,
    setAutoMode,
    toggleTheme,
  };
}
