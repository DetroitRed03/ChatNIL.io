'use client';

import { Suspense } from 'react';
import { AthleteListPage } from '@/components/compliance-dashboard';

function AthleteListContent() {
  return <AthleteListPage />;
}

export default function ComplianceAthletesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading athletes...</p>
        </div>
      </div>
    }>
      <AthleteListContent />
    </Suspense>
  );
}
