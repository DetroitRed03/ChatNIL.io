'use client';

import { ReactNode } from 'react';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Navigation/Breadcrumbs';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface MainLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
  className?: string;
  showBreadcrumbs?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  full: 'max-w-full'
};

export default function MainLayout({
  children,
  breadcrumbs = [],
  maxWidth = '4xl',
  className = '',
  showBreadcrumbs = true
}: MainLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Main Navigation Header */}
      <Header />

      {/* Main Content Area */}
      <main className={`${maxWidthClasses[maxWidth]} mx-auto px-4 py-6`}>
        {/* Breadcrumbs */}
        {showBreadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}