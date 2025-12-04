/**
 * ErrorMessage Component
 *
 * User-friendly error display with retry action.
 * Use this instead of alert() or raw error messages.
 */

'use client';

import { useState } from 'react';
import { AlertCircle, RefreshCcw, WifiOff, ServerCrash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'inline' | 'card' | 'toast';
  type?: 'network' | 'server' | 'generic';
  className?: string;
}

export function ErrorMessage({
  title,
  message,
  onRetry,
  variant = 'card',
  type = 'generic',
  className = ''
}: ErrorMessageProps) {
  const Icon = type === 'network' ? WifiOff : type === 'server' ? ServerCrash : AlertCircle;

  const defaultTitle = type === 'network'
    ? 'Connection Error'
    : type === 'server'
    ? 'Server Error'
    : 'Something went wrong';

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm">{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-2 text-sm font-medium hover:underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (variant === 'toast') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-red-100 rounded-full">
            <Icon className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{title || defaultTitle}</p>
            <p className="text-sm text-red-600 mt-0.5">{message}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Retry
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Default: card variant
  return (
    <div className={`bg-red-50 border border-red-200 rounded-xl p-6 text-center ${className}`}>
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        {title || defaultTitle}
      </h3>
      <p className="text-sm text-red-600 mb-4">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

/**
 * Hook for managing error state
 */
export function useErrorState() {
  const [error, setError] = useState<{
    message: string;
    type?: 'network' | 'server' | 'generic';
  } | null>(null);

  const clearError = () => setError(null);

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      if (err.message.includes('fetch') || err.message.includes('network')) {
        setError({ message: 'Please check your internet connection and try again.', type: 'network' });
      } else if (err.message.includes('500') || err.message.includes('server')) {
        setError({ message: 'Our servers are having trouble. Please try again in a moment.', type: 'server' });
      } else {
        setError({ message: err.message, type: 'generic' });
      }
    } else {
      setError({ message: 'An unexpected error occurred. Please try again.', type: 'generic' });
    }
  };

  return { error, setError, clearError, handleError };
}
