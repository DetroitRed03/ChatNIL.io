'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AthletesPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  // Public athlete profiles should not have the app sidebar/navigation
  // This is a clean, standalone layout for public viewing

  // Show back navigation for all authenticated users
  const showBackButton = !!user;

  // Determine dashboard route based on role
  const dashboardRoute = user?.role === 'agency' ? '/agency/dashboard' : '/dashboard';
  const dashboardLabel = 'Dashboard';

  return (
    <div className="min-h-screen bg-background">
      {showBackButton && (
        <div className="fixed top-4 left-4 z-50">
          {/* Breadcrumb-style navigation */}
          <nav className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Link
              href={dashboardRoute}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">{dashboardLabel}</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">Public Profile</span>
          </nav>
        </div>
      )}
      {children}
    </div>
  );
}
