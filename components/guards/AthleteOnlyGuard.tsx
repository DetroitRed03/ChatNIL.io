'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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

    // If no user, redirect to login
    if (!user) {
      router.replace('/login');
      return;
    }

    // If user is not an athlete, redirect to appropriate dashboard
    if (user.role !== 'athlete') {
      const redirectPath = user.role === 'agency'
        ? '/agencies/dashboard'
        : '/dashboard';
      router.replace(redirectPath);
    }
  }, [user, isLoading, router]);

  // Show nothing while loading or if not an athlete
  if (isLoading || !user || user.role !== 'athlete') {
    return null;
  }

  // User is an athlete, render the protected content
  return <>{children}</>;
}
