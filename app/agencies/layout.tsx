'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AgencyTopNav } from '@/components/agencies/AgencyTopNav';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AgenciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect non-agency users
  useEffect(() => {
    if (!isLoading && user && user.role !== 'agency') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if user is not an agency (will redirect)
  if (!user || user.role !== 'agency') {
    return null;
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <AgencyTopNav />
      {/* Add top padding to account for fixed nav */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
