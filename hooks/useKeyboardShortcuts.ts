import { useEffect, useCallback, useRef } from 'react';

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;  // Cmd on Mac
  shift?: boolean;
  alt?: boolean;
  description: string;
  category?: 'navigation' | 'chat' | 'general' | 'editing';
  action: () => void;
  preventDefault?: boolean;
  disabled?: boolean;
}

/**
 * Platform detection
 */
export const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

/**
 * Get modifier key name based on platform
 */
export const getModifierKey = () => (isMac ? 'Cmd' : 'Ctrl');

/**
 * Format shortcut for display
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(getModifierKey());
  }
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());

  return parts.join(' + ');
};

/**
 * Check if an element is an input field
 */
const isInputElement = (element: Element | null): boolean => {
  if (!element) return false;

  const tagName = element.tagName.toLowerCase();
  const isContentEditable = element.getAttribute('contenteditable') === 'true';

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    isContentEditable
  );
};

/**
 * Check if event matches shortcut
 */
const matchesShortcut = (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
  const key = event.key.toLowerCase();
  const targetKey = shortcut.key.toLowerCase();

  // Check if key matches
  if (key !== targetKey) return false;

  // Check modifiers
  const ctrlPressed = event.ctrlKey;
  const metaPressed = event.metaKey;
  const shiftPressed = event.shiftKey;
  const altPressed = event.altKey;

  // On Mac, Cmd (meta) is primary, on Windows/Linux, Ctrl is primary
  const primaryModifier = isMac ? metaPressed : ctrlPressed;

  // If shortcut requires ctrl/meta
  if (shortcut.ctrl || shortcut.meta) {
    if (!primaryModifier) return false;
  } else {
    // If shortcut doesn't require ctrl/meta, neither should be pressed
    if (ctrlPressed || metaPressed) return false;
  }

  // Check other modifiers
  if (shortcut.shift !== undefined && shiftPressed !== shortcut.shift) return false;
  if (shortcut.alt !== undefined && altPressed !== shortcut.alt) return false;

  return true;
};

/**
 * Custom hook for managing keyboard shortcuts
 *
 * @param shortcuts Array of keyboard shortcuts to register
 * @param options Configuration options
 *
 * @example
 * useKeyboardShortcuts([
 *   {
 *     key: 'k',
 *     meta: true,
 *     description: 'Open search',
 *     action: () => setSearchOpen(true)
 *   }
 * ]);
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: {
    enabled?: boolean;
    disableInInputs?: boolean;
  } = {}
) {
  const {
    enabled = true,
    disableInInputs = true,
  } = options;

  const shortcutsRef = useRef(shortcuts);

  // Update shortcuts ref when they change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if shortcuts are disabled
    if (!enabled) return;

    // Skip if in input field (unless explicitly allowed)
    if (disableInInputs && isInputElement(event.target as Element)) {
      // Allow Escape in input fields
      if (event.key !== 'Escape') return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcutsRef.current.find(
      shortcut => !shortcut.disabled && matchesShortcut(event, shortcut)
    );

    if (matchingShortcut) {
      // Prevent default if specified
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }

      // Execute action
      matchingShortcut.action();
    }
  }, [enabled, disableInInputs]);

  useEffect(() => {
    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Hook to get all registered shortcuts (for help modal)
 */
export function useRegisteredShortcuts() {
  // This will be enhanced with KeyboardShortcutsContext later
  // For now, return static shortcuts
  return [];
}

/**
 * Utility: Create a shortcut for cross-platform compatibility
 */
export function createShortcut(
  key: string,
  action: () => void,
  description: string,
  options?: Partial<KeyboardShortcut>
): KeyboardShortcut {
  return {
    key,
    meta: true, // Use meta for Cmd on Mac, Ctrl on Windows/Linux
    description,
    category: 'general',
    preventDefault: true,
    ...options,
    action,
  };
}
