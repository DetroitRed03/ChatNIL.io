'use client';

import { X, Command } from 'lucide-react';
import { useKeyboardShortcutsContext } from '@/contexts/KeyboardShortcutsContext';
import { isMac, type KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Formats a keyboard shortcut for display
 */
function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.meta) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');

  // Format the key
  const key = shortcut.key.length === 1
    ? shortcut.key.toUpperCase()
    : shortcut.key === 'Escape'
      ? 'Esc'
      : shortcut.key;

  parts.push(key);

  return parts.join(isMac ? '' : '+');
}

/**
 * Groups shortcuts by category
 */
function groupShortcutsByCategory(shortcuts: KeyboardShortcut[]) {
  const groups: Record<string, KeyboardShortcut[]> = {
    navigation: [],
    chat: [],
    general: [],
    editing: [],
  };

  shortcuts.forEach(shortcut => {
    const category = shortcut.category || 'general';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(shortcut);
  });

  // Remove empty categories
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}

/**
 * Gets a user-friendly category name
 */
function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    navigation: 'Navigation',
    chat: 'Chat',
    general: 'General',
    editing: 'Editing',
  };
  return names[category] || category;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const { shortcuts } = useKeyboardShortcutsContext();

  if (!isOpen) return null;

  const groupedShortcuts = groupShortcutsByCategory(shortcuts);
  const categories = Object.keys(groupedShortcuts);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Command className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-sm text-gray-500">
                    Quick access to common actions
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Close shortcuts"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Command className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="text-lg font-medium mb-2">
                  No shortcuts available
                </div>
                <div className="text-sm">
                  Shortcuts will appear here when they are registered
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map(category => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      {getCategoryName(category)}
                    </h3>
                    <div className="space-y-2">
                      {groupedShortcuts[category].map((shortcut, index) => (
                        <div
                          key={`${category}-${index}`}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm text-gray-700">
                            {shortcut.description}
                          </span>
                          <kbd className="px-3 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md shadow-sm">
                            {formatShortcut(shortcut)}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded">
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded">
                  /
                </kbd>
                <span className="ml-2">to toggle this window</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded">
                  Esc
                </kbd>
                <span>to close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
