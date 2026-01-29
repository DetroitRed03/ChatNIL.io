'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { category: 'Navigation', items: [
    { keys: ['⌘', 'K'], description: 'Open search' },
    { keys: ['G', 'D'], description: 'Go to Dashboard' },
    { keys: ['G', 'A'], description: 'Go to Athletes' },
    { keys: ['G', 'R'], description: 'Go to Reports' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
  ]},
  { category: 'Selection', items: [
    { keys: ['↑', '↓'], description: 'Navigate items' },
    { keys: ['X'], description: 'Toggle selection' },
    { keys: ['⌘', 'A'], description: 'Select all' },
    { keys: ['Esc'], description: 'Clear selection' },
  ]},
  { category: 'Actions', items: [
    { keys: ['A'], description: 'Approve selected' },
    { keys: ['R'], description: 'Reject selected' },
    { keys: ['S'], description: 'Assign selected' },
    { keys: ['E'], description: 'Export selected' },
    { keys: ['Enter'], description: 'Open item details' },
  ]},
  { category: 'Filters', items: [
    { keys: ['F'], description: 'Focus filter bar' },
    { keys: ['C'], description: 'Clear all filters' },
    { keys: ['1', '2', '3'], description: 'Quick filter presets' },
  ]},
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid="keyboard-shortcuts-modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid grid-cols-2 gap-6">
            {shortcuts.map(category => (
              <div key={category.category}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.items.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-gray-600">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex}>
                            <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-600">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-gray-400 mx-0.5">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">?</kbd> anywhere to show this menu
          </p>
        </div>
      </div>
    </div>
  );
}
