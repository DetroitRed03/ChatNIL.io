'use client';

import { ProtectionStatusRing } from './ProtectionStatusRing';
import { ProtectionStatusLabel } from './ProtectionStatusLabel';
import { QuickStats } from './QuickStats';

interface ProtectionHeroProps {
  protectionStatus: {
    overall: 'protected' | 'attention_needed' | 'at_risk';
    score: number;
    summary: string;
    issueCount: number;
    criticalCount: number;
  };
  quickStats: {
    activeDeals: number;
    totalValue: number;
    pendingIssues: number;
    submissionsDue: number;
  };
  userName: string;
  className?: string;
  onCheckNewDeal?: () => void;
  onStatClick?: (type: 'deals' | 'value' | 'issues' | 'submissions') => void;
}

export function ProtectionHero({
  protectionStatus,
  quickStats,
  userName,
  className = '',
  onCheckNewDeal,
  onStatClick,
}: ProtectionHeroProps) {
  const firstName = userName.split(' ')[0];

  return (
    <section className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hey {firstName} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here's your NIL protection status
          </p>
        </div>
        <button
          onClick={onCheckNewDeal}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Check New Deal
        </button>
      </div>

      {/* Main Content - Ring + Status */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
        <ProtectionStatusRing
          score={protectionStatus.score}
          status={protectionStatus.overall}
        />
        <div className="flex-grow">
          <ProtectionStatusLabel
            status={protectionStatus.overall}
            summary={protectionStatus.summary}
          />

          {/* Issue counts if any */}
          {protectionStatus.issueCount > 0 && (
            <div className="mt-3 flex items-center gap-4 text-sm">
              {protectionStatus.criticalCount > 0 && (
                <span className="flex items-center gap-1.5 text-red-600">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  {protectionStatus.criticalCount} critical
                </span>
              )}
              {protectionStatus.issueCount - protectionStatus.criticalCount > 0 && (
                <span className="flex items-center gap-1.5 text-amber-600">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" />
                  {protectionStatus.issueCount - protectionStatus.criticalCount} warning{(protectionStatus.issueCount - protectionStatus.criticalCount) !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats
        activeDeals={quickStats.activeDeals}
        totalValue={quickStats.totalValue}
        pendingIssues={quickStats.pendingIssues}
        submissionsDue={quickStats.submissionsDue}
        onStatClick={onStatClick}
      />
    </section>
  );
}
