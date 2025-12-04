'use client';

import { Sun, Moon, Monitor, Clock } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useState, useRef, useEffect } from 'react';

/**
 * ThemeToggle Component
 *
 * Provides a dropdown menu to toggle between light, dark, system, and auto themes
 */
export default function ThemeToggle() {
  const { theme, resolvedTheme, setLightMode, setDarkMode, setSystemMode, setAutoMode } = useDarkMode();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Get current icon based on resolved theme
  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        aria-label="Toggle theme"
      >
        <CurrentIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <button
            onClick={() => {
              setLightMode();
              setIsOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-2 text-sm text-left
              hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
              ${theme === 'light' ? 'bg-gray-50 dark:bg-gray-750 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}
            `}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
            {theme === 'light' && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </button>

          <button
            onClick={() => {
              setDarkMode();
              setIsOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-2 text-sm text-left
              hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
              ${theme === 'dark' ? 'bg-gray-50 dark:bg-gray-750 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}
            `}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
            {theme === 'dark' && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </button>

          <button
            onClick={() => {
              setSystemMode();
              setIsOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-2 text-sm text-left
              hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
              ${theme === 'system' ? 'bg-gray-50 dark:bg-gray-750 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}
            `}
          >
            <Monitor className="w-4 h-4" />
            <span>System</span>
            {theme === 'system' && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </button>

          <button
            onClick={() => {
              setAutoMode();
              setIsOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-2 text-sm text-left
              hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
              ${theme === 'auto' ? 'bg-gray-50 dark:bg-gray-750 text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}
            `}
          >
            <Clock className="w-4 h-4" />
            <span>Auto</span>
            {theme === 'auto' && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
