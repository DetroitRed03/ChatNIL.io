'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * AgencyOnlyGuard Component
 *
 * Protects agency-only pages from being accessed by non-agency users.
 * Redirects non-agencies to their appropriate dashboard based on role.
 *
 * Usage:
 * ```tsx
 * export default function AgencyDashboardPage() {
 *   return (
 *     <AgencyOnlyGuard>
 *       <AgencyDashboardContent />
 *     </AgencyOnlyGuard>
 *   );
 * }
 * ```
 */

interface AgencyOnlyGuardProps {
  children: React.ReactNode;
}

export function AgencyOnlyGuard({ children }: AgencyOnlyGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // If no user, redirect to homepage (which has the login)
    if (!user) {
      router.replace('/');
      return;
    }

    // If user is not an agency, redirect to appropriate dashboard
    if (user.role !== 'agency') {
      const redirectPath = user.role === 'athlete'
        ? '/dashboard'
        : user.role === 'parent'
        ? '/parent/dashboard'
        : '/dashboard';
      router.replace(redirectPath);
    }
  }, [user, isLoading, router]);

  // Show loading spinner while auth is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user or not an agency, show loading while redirect happens
  if (!user || user.role !== 'agency') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // User is an agency, render the protected content
  return <>{children}</>;
}
