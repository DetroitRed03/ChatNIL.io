'use client';

import { MoneyDisplay } from '../shared/MoneyDisplay';
import { DimensionBreakdown } from '../urgent-deals/DimensionBreakdown';

interface DimensionData {
  score: number;
  weight: number;
  status: 'good' | 'warning' | 'critical';
  label?: string;
}

interface ProtectedDealCardProps {
  deal: {
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
  };
  onViewDetails: (dealId: string) => void;
  compact?: boolean;
  className?: string;
}

export function ProtectedDealCard({
  deal,
  onViewDetails,
  compact = true,
  className = ''
}: ProtectedDealCardProps) {
  if (compact) {
    const brandInitial = deal.brandLogo ? (
      <img src={deal.brandLogo} alt={deal.brandName} className="w-10 h-10 rounded-lg object-cover" />
    ) : (
      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
        {deal.brandName.charAt(0)}
      </div>
    );

    return (
      <>
        {/* Mobile Card */}
        <button
          onClick={() => onViewDetails(deal.id)}
          className={`md:hidden w-full text-left bg-white rounded-xl border border-gray-200 p-4 active:scale-[0.99] transition-all hover:shadow-md ${className}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0">
              {brandInitial}
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{deal.brandName}</h4>
                <p className="text-sm text-gray-500 capitalize">{deal.dealType}</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="flex items-center justify-between">
            <MoneyDisplay amount={deal.value} size="lg" color="success" />
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-emerald-600 font-medium">Protected</span>
            </div>
          </div>
        </button>

        {/* Desktop Row */}
        <button
          onClick={() => onViewDetails(deal.id)}
          className={`hidden md:flex w-full items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all ${className}`}
        >
          {brandInitial}
          <div className="flex-grow text-left">
            <h4 className="font-medium text-gray-900">{deal.brandName}</h4>
            <p className="text-sm text-gray-500">{deal.dealType}</p>
          </div>
          <div className="text-right">
            <MoneyDisplay amount={deal.value} size="sm" color="success" />
            <div className="flex items-center gap-1 mt-1 justify-end">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-emerald-600 font-medium">Protected</span>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </>
    );
  }

  // Expanded view with dimension breakdown
  return (
    <div className={`bg-white rounded-xl border border-emerald-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-emerald-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {deal.brandLogo ? (
            <img
              src={deal.brandLogo}
              alt={deal.brandName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl font-bold">
              {deal.brandName.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{deal.brandName}</h3>
            <p className="text-sm text-gray-500">{deal.dealType}</p>
          </div>
        </div>
        <div className="text-right">
          <MoneyDisplay amount={deal.value} size="lg" color="success" />
          <div className="flex items-center gap-1 mt-1 justify-end">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-emerald-600 font-medium">
              Score: {deal.overallScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {deal.dimensions && (
          <DimensionBreakdown dimensions={deal.dimensions} />
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {deal.submissionStatus === 'approved' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Submitted to Compliance
              </span>
            )}
          </div>
          <button
            onClick={() => onViewDetails(deal.id)}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}
