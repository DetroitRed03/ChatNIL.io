'use client';

import { useState } from 'react';
import { ScoreCircle } from '../shared/ScoreCircle';
import { MoneyDisplay } from '../shared/MoneyDisplay';
import { DateCountdown } from '../shared/DateCountdown';
import { DimensionBreakdown } from './DimensionBreakdown';
import { IssuesList } from './IssuesList';

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

interface UrgentDealCardProps {
  deal: {
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
  };
  onFixIssue: (dealId: string, issue: Issue) => void;
  onViewDetails: (dealId: string) => void;
  onSubmitToCompliance?: (dealId: string) => void;
  className?: string;
}

export function UrgentDealCard({
  deal,
  onFixIssue,
  onViewDetails,
  onSubmitToCompliance,
  className = ''
}: UrgentDealCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const isRed = deal.overallScore < 50;
  const borderColor = isRed ? 'border-red-300' : 'border-amber-300';
  const headerBg = isRed ? 'bg-red-50' : 'bg-amber-50';

  const criticalIssues = deal.issues.filter(i => i.severity === 'critical').length;
  const warningIssues = deal.issues.filter(i => i.severity === 'warning').length;

  return (
    <div className={`bg-white rounded-xl border-2 ${borderColor} overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`${headerBg} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          {deal.brandLogo ? (
            <img
              src={deal.brandLogo}
              alt={deal.brandName}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
              {deal.brandName.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{deal.brandName}</h3>
            <MoneyDisplay amount={deal.value} size="sm" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ScoreCircle score={deal.overallScore} size="sm" />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Issue Count Banner */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          {criticalIssues > 0 && (
            <span className="flex items-center gap-1 text-red-600 font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {criticalIssues} critical
            </span>
          )}
          {warningIssues > 0 && (
            <span className="flex items-center gap-1 text-amber-600">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              {warningIssues} warning
            </span>
          )}
        </div>
        {deal.submission && deal.submission.status === 'not_submitted' && (
          <DateCountdown date={deal.submission.deadline} urgentThresholdDays={3} />
        )}
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* 6-Dimension Breakdown */}
          <DimensionBreakdown dimensions={deal.dimensions} />

          {/* Issues to Fix */}
          <IssuesList
            issues={deal.issues}
            onFixClick={(issue) => onFixIssue(deal.id, issue)}
          />

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => onViewDetails(deal.id)}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              View Full Details
            </button>
            {deal.submission?.status === 'not_submitted' && (
              <button
                onClick={() => onSubmitToCompliance?.(deal.id)}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Submit to Compliance
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
