'use client';

import { useState } from 'react';
import { ProtectedDealCard } from './ProtectedDealCard';

interface DimensionData {
  score: number;
  weight: number;
  status: 'good' | 'warning' | 'critical';
  label?: string;
}

interface ProtectedDeal {
  id: string;
  brandName: string;
  brandLogo?: string;
  value: number;
  overallScore: number;
  dealType: string;
  startDate?: string;
  endDate?: string;
  dimensions?: {
    policyFit: DimensionData;
    documentHygiene: DimensionData;
    fmvVerification: DimensionData;
    taxReadiness: DimensionData;
    brandSafety: DimensionData;
    guardianConsent: DimensionData;
  };
  submissionStatus?: 'submitted' | 'approved';
}

interface ProtectedDealsSectionProps {
  deals: ProtectedDeal[];
  onViewDetails: (dealId: string) => void;
  className?: string;
}

export function ProtectedDealsSection({
  deals,
  onViewDetails,
  className = ''
}: ProtectedDealsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);

  const displayDeals = showAll ? deals : deals.slice(0, 3);
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <section className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Your Protected Deals
            </h2>
            <p className="text-sm text-gray-500">
              {deals.length} deal{deals.length !== 1 ? 's' : ''} • {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(totalValue)} total
            </p>
          </div>
        </div>
        {deals.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            {showAll ? 'Show Less' : `View All ${deals.length}`}
          </button>
        )}
      </div>

      {/* Deal Cards */}
      {deals.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-medium text-gray-900 mb-1">No Protected Deals Yet</h3>
          <p className="text-sm text-gray-500">
            When you validate deals with good scores, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayDeals.map(deal => (
            <ProtectedDealCard
              key={deal.id}
              deal={deal}
              onViewDetails={onViewDetails}
              compact={expandedDeal !== deal.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
