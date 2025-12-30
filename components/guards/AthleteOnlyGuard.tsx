'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * AthleteOnlyGuard Component
 *
 * Protects athlete-only pages from being accessed by non-athlete users.
 * Redirects non-athletes to their appropriate dashboard based on role.
 *
 * Usage:
 * ```tsx
 * export default function BadgesPage() {
 *   return (
 *     <AthleteOnlyGuard>
 *       <BadgesContent />
 *     </AthleteOnlyGuard>
 *   );
 * }
 * ```
 */

interface AthleteOnlyGuardProps {
  children: React.ReactNode;
}

export function AthleteOnlyGuard({ children }: AthleteOnlyGuardProps) {
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

    // If user is not an athlete, redirect to appropriate dashboard
    if (user.role !== 'athlete') {
      const redirectPath = user.role === 'agency'
        ? '/agency/dashboard'
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

  // If no user or not an athlete, show loading while redirect happens
  if (!user || user.role !== 'athlete') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // User is an athlete, render the protected content
  return <>{children}</>;
}
