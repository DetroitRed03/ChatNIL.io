'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PendingApprovalDashboard from '@/components/dashboard/hs-student/v2/PendingApprovalDashboard';

/**
 * Pending Parent Approval Page
 *
 * This page is shown to HS students (minors) who have not yet received
 * parent/guardian approval for their account.
 *
 * Redirects:
 * - Non-authenticated users → /?auth=login
 * - Non-minor users → /dashboard
 * - Approved minors → /dashboard/hs-student
 */
export default function PendingApprovalPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in
        router.replace('/?auth=login');
      } else if (user.role !== 'hs_student') {
        // Not an HS student - redirect to main dashboard
        router.replace('/dashboard');
      } else if ((user as any).minor_status === 'approved') {
        // Already approved - redirect to full dashboard
        router.replace('/dashboard/hs-student');
      }
      // Otherwise, show the pending approval dashboard
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent" />
          <p className="mt-4 text-gray-600 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show the pending approval dashboard for HS students awaiting approval
  if (user && user.role === 'hs_student') {
    return <PendingApprovalDashboard />;
  }

  // Fallback loading while redirecting
  return (
    <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent" />
        <p className="mt-4 text-gray-600 text-sm font-medium">Redirecting...</p>
      </div>
    </div>
  );
}
