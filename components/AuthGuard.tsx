'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, AlertCircle, Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallbackComponent?: React.ReactNode;
}

export default function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/',
  fallbackComponent
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        // User is not authenticated but auth is required
        console.log('🚫 AuthGuard: User not authenticated, redirecting to:', redirectTo);

        // Show fallback after a brief moment to give user feedback
        const fallbackTimer = setTimeout(() => {
          setShowFallback(true);
        }, 300);

        // Add a small delay to prevent flash, then redirect
        const timer = setTimeout(() => {
          router.push(redirectTo);
        }, 800);

        return () => {
          clearTimeout(timer);
          clearTimeout(fallbackTimer);
        };
      } else if (!requireAuth && user) {
        // User is authenticated but shouldn't be (e.g., login page when already logged in)
        console.log('🔄 AuthGuard: User already authenticated, redirecting away from auth page');
        router.push('/profile');
      }
    }
  }, [user, isLoading, requireAuth, redirectTo, router]);

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // User needs to be authenticated but isn't
  if (requireAuth && !user) {
    if (showFallback && fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    if (showFallback) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">
              You need to be logged in to access this page. Redirecting you to login...
            </p>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
              <span className="text-sm text-gray-500">Redirecting...</span>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Go Now
            </button>
          </div>
        </div>
      );
    }

    // Return null while redirect is happening
    return null;
  }

  // User shouldn't be authenticated but is (redirect already handled in useEffect)
  if (!requireAuth && user) {
    return null;
  }

  // Authentication state is good, render children
  return <>{children}</>;
}

// Convenience wrapper for protected routes
export function ProtectedRoute({ children, ...props }: Omit<AuthGuardProps, 'requireAuth'>) {
  return (
    <AuthGuard requireAuth={true} {...props}>
      {children}
    </AuthGuard>
  );
}

// Convenience wrapper for public routes (redirect away if already authenticated)
export function PublicRoute({ children, ...props }: Omit<AuthGuardProps, 'requireAuth'>) {
  return (
    <AuthGuard requireAuth={false} {...props}>
      {children}
    </AuthGuard>
  );
}