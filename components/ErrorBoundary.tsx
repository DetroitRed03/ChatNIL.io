'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  showErrorDetails?: boolean;
}

interface ErrorFallbackProps {
  error: Error | null;
  errorId: string;
  onRetry: () => void;
  onGoHome: () => void;
  showDetails: boolean;
}

function ErrorFallback({ error, errorId, onRetry, onGoHome, showDetails }: ErrorFallbackProps) {
  const [showFullError, setShowFullError] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        {/* Error Icon */}
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        {/* Error Title */}
        <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Something went wrong
        </h1>

        {/* Error Description */}
        <p className="text-gray-600 text-center mb-6">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>

        {/* Error ID for support */}
        <div className="bg-gray-100 rounded-lg p-3 mb-6">
          <p className="text-sm text-gray-700 text-center">
            <span className="font-medium">Error ID:</span> {errorId}
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            Please provide this ID when contacting support
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Go to Homepage</span>
          </button>

          {showDetails && error && (
            <button
              onClick={() => setShowFullError(!showFullError)}
              className="w-full text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
            >
              {showFullError ? 'Hide' : 'Show'} Error Details
            </button>
          )}
        </div>

        {/* Error Details (Development) */}
        {showDetails && showFullError && error && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg border">
            <h3 className="font-medium text-sm text-gray-900 mb-2">Error Details:</h3>
            <div className="text-xs text-gray-700 font-mono bg-white p-2 rounded border overflow-auto max-h-32">
              <div className="mb-2">
                <strong>Message:</strong> {error.message}
              </div>
              <div className="mb-2">
                <strong>Stack:</strong>
                <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate a unique error ID for tracking
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error details
    console.error('🚨 Error caught by ErrorBoundary:', {
      error,
      errorInfo,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    });

    // Store error details for debugging
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In a real app, you would send this to your error tracking service
    // Example: Sentry.captureException(error, { contexts: { errorInfo } });
  }

  handleRetry = () => {
    // Clear error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  handleGoHome = () => {
    // Navigate to homepage
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render default error fallback
      return (
        <ErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          showDetails={this.props.showErrorDetails ?? process.env.NODE_ENV === 'development'}
        />
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default ErrorBoundary;