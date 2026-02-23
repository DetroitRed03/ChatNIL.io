'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  className,
}: ResponsiveModalProps) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — full screen on mobile, centered on desktop */}
      <div className="absolute inset-0 md:flex md:items-center md:justify-center md:p-4">
        <div
          className={cn(
            'relative bg-white w-full h-full',
            'md:h-auto md:max-h-[90vh] md:rounded-2xl md:shadow-xl',
            sizeClasses[size],
            'overflow-hidden flex flex-col',
            className
          )}
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
          )}

          {/* Content — scrollable */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
