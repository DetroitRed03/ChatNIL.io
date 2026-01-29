'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy route - redirects to /parent/dashboard
 * The parent dashboard was moved to /parent/dashboard per new spec.
 */
export default function LegacyParentDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/parent/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
