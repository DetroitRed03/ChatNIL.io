'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';

interface SlideOutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

export function SlideOutPanel({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = 'md',
}: SlideOutPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Swipe to dismiss
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => onClose(),
    trackMouse: false,
    trackTouch: true,
    delta: 50,
  });

  const widthClasses = {
    sm: 'w-[280px] max-w-[75vw]',
    md: 'w-[360px] max-w-[85vw]',
    lg: 'w-[480px] max-w-[90vw]',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        {...swipeHandlers}
        className={`
          absolute top-0 right-0 bottom-0 bg-white shadow-2xl
          flex flex-col
          ${widthClasses[width]}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer - Sticky at bottom */}
        {footer && (
          <div className="p-4 border-t bg-white sticky bottom-0 safe-area-bottom">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
