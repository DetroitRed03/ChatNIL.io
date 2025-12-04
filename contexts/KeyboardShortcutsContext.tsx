'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => () => void;
  unregisterShortcut: (shortcut: KeyboardShortcut) => void;
  isHelpModalOpen: boolean;
  openHelpModal: () => void;
  closeHelpModal: () => void;
  toggleHelpModal: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      // Check if shortcut already exists
      const exists = prev.some(
        s => s.key === shortcut.key &&
        s.ctrl === shortcut.ctrl &&
        s.meta === shortcut.meta &&
        s.shift === shortcut.shift &&
        s.alt === shortcut.alt
      );

      if (exists) {
        console.warn('Duplicate shortcut detected:', shortcut);
        return prev;
      }

      return [...prev, shortcut];
    });

    // Return cleanup function
    return () => {
      setShortcuts(prev => prev.filter(s => s !== shortcut));
    };
  }, []);

  const unregisterShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => prev.filter(s => s !== shortcut));
  }, []);

  const openHelpModal = useCallback(() => {
    setIsHelpModalOpen(true);
  }, []);

  const closeHelpModal = useCallback(() => {
    setIsHelpModalOpen(false);
  }, []);

  const toggleHelpModal = useCallback(() => {
    setIsHelpModalOpen(prev => !prev);
  }, []);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        shortcuts,
        registerShortcut,
        unregisterShortcut,
        isHelpModalOpen,
        openHelpModal,
        closeHelpModal,
        toggleHelpModal,
      }}
    >
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);

  if (context === undefined) {
    throw new Error('useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider');
  }

  return context;
}
