/**
 * Dashboard Router Page
 *
 * This page serves as a redirect hub that routes users to their role-specific dashboards.
 * It shows only a loading spinner while determining the user's role and redirecting.
 *
 * Role Routing:
 * - compliance_officer → /compliance/dashboard
 * - agency → /agency/dashboard
 * - parent → /parent/dashboard
 * - hs_student → /dashboard/hs-student
 * - athlete/college_athlete → /dashboard/college-athlete
 * - unauthenticated → /?auth=login
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, isLoading, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Wait for mount, auth loading, and profile loading to complete
    if (!mounted || isLoading || isLoadingProfile) return;

    if (!user) {
      router.replace('/?auth=login');
    } else if (user.role === 'compliance_officer') {
      router.replace('/compliance/dashboard');
    } else if (user.role === 'agency') {
      router.replace('/agency/dashboard');
    } else if (user.role === 'parent') {
      router.replace('/parent/dashboard');
    } else if (user.role === 'hs_student') {
      router.replace('/dashboard/hs-student');
    } else if (user.role === 'athlete' || user.role === 'college_athlete') {
      router.replace('/dashboard/college-athlete');
    }
  }, [user, isLoading, isLoadingProfile, router, mounted]);

  // Only show loading spinner - never render dashboard content here
  // Each role has their own dedicated dashboard page
  return (
    <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
