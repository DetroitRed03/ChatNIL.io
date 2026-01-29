'use client';

import { UrgentDealCard } from './UrgentDealCard';

interface DimensionData {
  score: number;
  weight: number;
  status: 'good' | 'warning' | 'critical';
  label?: string;
}

interface Issue {
  id: string;
  dimension: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  fixAction: {
    label: string;
    type: 'modal' | 'link' | 'upload' | 'confirm';
    url?: string;
  };
}

interface UrgentDeal {
  id: string;
  brandName: string;
  brandLogo?: string;
  value: number;
  overallScore: number;
  dimensions: {
    policyFit: DimensionData;
    documentHygiene: DimensionData;
    fmvVerification: DimensionData;
    taxReadiness: DimensionData;
    brandSafety: DimensionData;
    guardianConsent: DimensionData;
  };
  issues: Issue[];
  submission?: {
    status: 'not_submitted' | 'pending' | 'approved' | 'flagged';
    deadline: string;
    daysRemaining: number;
  };
}

interface UrgentDealsSectionProps {
  deals: UrgentDeal[];
  onFixIssue: (dealId: string, issue: Issue) => void;
  onViewDetails: (dealId: string) => void;
  onSubmitToCompliance?: (dealId: string) => void;
  className?: string;
}

export function UrgentDealsSection({
  deals,
  onFixIssue,
  onViewDetails,
  onSubmitToCompliance,
  className = ''
}: UrgentDealsSectionProps) {
  if (deals.length === 0) {
    return null;
  }

  // Sort deals by score (lowest first) to show most critical first
  const sortedDeals = [...deals].sort((a, b) => a.overallScore - b.overallScore);

  const criticalCount = deals.filter(d => d.overallScore < 50).length;
  const warningCount = deals.filter(d => d.overallScore >= 50 && d.overallScore < 80).length;

  return (
    <section className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Deals Needing Your Attention
            </h2>
            <p className="text-sm text-gray-500">
              Fix these issues to protect your eligibility
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {criticalCount > 0 && (
            <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full font-medium">
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
              {warningCount} Warning
            </span>
          )}
        </div>
      </div>

      {/* Deal Cards */}
      <div className="space-y-4">
        {sortedDeals.map(deal => (
          <UrgentDealCard
            key={deal.id}
            deal={deal}
            onFixIssue={onFixIssue}
            onViewDetails={onViewDetails}
            onSubmitToCompliance={onSubmitToCompliance}
          />
        ))}
      </div>
    </section>
  );
}
