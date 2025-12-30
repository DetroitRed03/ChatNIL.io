'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AthletesPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  // Public athlete profiles should not have the app sidebar/navigation
  // This is a clean, standalone layout for public viewing

  // If user is logged in as an agency, show a back button to return to their dashboard
  const showBackButton = user?.role === 'agency';

  return (
    <div className="min-h-screen bg-background">
      {showBackButton && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={() => router.push('/agency/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
