'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCcw, MessageSquare } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * ChatErrorBoundary - Production-grade error boundary for chat components
 *
 * Features:
 * - Catches React errors in chat UI to prevent full app crash
 * - Displays user-friendly error UI with recovery options
 * - Logs errors to console for debugging
 * - Supports custom error callbacks
 * - Tracks error count for repeated failures
 * - Provides manual recovery actions
 */
export default class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('🚨 ChatErrorBoundary caught an error:');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In development, you might want to send to error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  handleReset = () => {
    console.log('🔄 ChatErrorBoundary: User requested error reset');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
      // Keep errorCount to track repeated failures
    });
  };

  handleReload = () => {
    console.log('🔄 ChatErrorBoundary: User requested page reload');
    window.location.reload();
  };

  handleClearStorage = () => {
    console.log('🧹 ChatErrorBoundary: User requested storage clear');
    if (typeof window !== 'undefined') {
      try {
        // Clear chat-related localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('chat') || key.includes('nil')) {
            localStorage.removeItem(key);
            console.log('🗑️ Cleared:', key);
          }
        });
        console.log('✅ Storage cleared successfully');
        // Reload after clearing
        window.location.reload();
      } catch (error) {
        console.error('❌ Failed to clear storage:', error);
      }
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>

            {/* Error Title */}
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Oops! Something went wrong
            </h2>

            {/* Error Description */}
            <p className="text-gray-600 mb-6">
              The chat encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {/* Error Details (collapsed by default) */}
            {this.state.error && (
              <details className="mb-6 text-left bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Technical Details
                </summary>
                <div className="mt-3 space-y-2">
                  <div className="text-xs">
                    <span className="font-semibold text-gray-700">Error:</span>
                    <code className="block mt-1 p-2 bg-white rounded border border-gray-200 text-red-600 overflow-x-auto">
                      {this.state.error.message}
                    </code>
                  </div>
                  {this.state.errorInfo && (
                    <div className="text-xs">
                      <span className="font-semibold text-gray-700">Stack:</span>
                      <code className="block mt-1 p-2 bg-white rounded border border-gray-200 text-gray-600 overflow-x-auto whitespace-pre-wrap text-[10px]">
                        {this.state.errorInfo.componentStack}
                      </code>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Repeated Error Warning */}
            {this.state.errorCount > 2 && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Repeated Error Detected</strong><br />
                  This error has occurred {this.state.errorCount} times. Try clearing your browser data below.
                </p>
              </div>
            )}

            {/* Recovery Actions */}
            <div className="space-y-3">
              {/* Try Again */}
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors shadow-sm"
              >
                <RefreshCcw className="h-5 w-5" />
                Try Again
              </button>

              {/* Reload Page */}
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                <RefreshCcw className="h-5 w-5" />
                Reload Page
              </button>

              {/* Clear Storage (only show after repeated errors) */}
              {this.state.errorCount > 1 && (
                <button
                  onClick={this.handleClearStorage}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-medium transition-colors border border-red-200"
                >
                  <MessageSquare className="h-5 w-5" />
                  Clear Chat Data & Reload
                </button>
              )}
            </div>

            {/* Help Text */}
            <p className="mt-6 text-xs text-gray-500">
              If this problem persists, try clearing your browser cache or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
