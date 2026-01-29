'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { HSStudentDashboardV2 } from '@/components/dashboard/hs-student/v2';

/**
 * HS Student Dashboard Page
 *
 * This page checks for minor consent status before showing the full dashboard.
 * If the student is a minor (is_minor=true) and hasn't been approved yet,
 * they are redirected to the pending-approval page.
 */
export default function HSStudentDashboardPage() {
  const { user, isLoading, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [checkingMinorStatus, setCheckingMinorStatus] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const checkMinorStatus = async () => {
      if (!user) {
        setCheckingMinorStatus(false);
        return;
      }

      try {
        // Get auth token for API call
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        // Check minor status from the API
        const response = await fetch('/api/auth/minor-status', {
          credentials: 'include',
          headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
        });
        if (response.ok) {
          const data = await response.json();

          // If user is a minor and not approved, redirect to pending-approval
          if (data.isMinor && data.minorStatus !== 'approved') {
            router.replace('/dashboard/pending-approval');
            return;
          }

          // User is either not a minor or is approved
          setIsApproved(true);
        } else {
          // If API fails, assume approved (fail open for UX)
          setIsApproved(true);
        }
      } catch (error) {
        console.error('Error checking minor status:', error);
        // Fail open - show dashboard if check fails
        setIsApproved(true);
      } finally {
        setCheckingMinorStatus(false);
      }
    };

    // Wait for both auth loading AND profile loading to complete
    if (!isLoading && !isLoadingProfile && user) {
      checkMinorStatus();
    } else if (!isLoading && !isLoadingProfile && !user) {
      setCheckingMinorStatus(false);
    }
  }, [user, isLoading, isLoadingProfile, router]);

  // Show loading while checking auth, profile loading, and minor status
  if (isLoading || isLoadingProfile || checkingMinorStatus) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent" />
          <p className="mt-4 text-gray-600 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, the main dashboard router will handle redirect
  if (!user) {
    return null;
  }

  // Show the full dashboard for approved users
  if (isApproved) {
    return <HSStudentDashboardV2 />;
  }

  // Fallback loading (should redirect before this)
  return (
    <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent" />
        <p className="mt-4 text-gray-600 text-sm font-medium">Redirecting...</p>
      </div>
    </div>
  );
}
