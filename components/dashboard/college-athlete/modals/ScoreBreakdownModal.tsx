'use client';

import { useState, useEffect } from 'react';

interface DimensionData {
  score: number;
  weight: number;
  status: 'good' | 'warning' | 'critical';
  issues?: string[];
}

interface DealDetails {
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
  issues?: Array<{
    id: string;
    title: string;
    description: string;
    severity: string;
  }>;
}

interface ScoreBreakdownModalProps {
  dealId: string;
  deal?: DealDetails; // Optional: pass directly if already have data
  onClose: () => void;
}

const dimensionInfo = [
  { key: 'policyFit', name: 'School Rules', max: 30, description: 'NCAA rules + state law compliance' },
  { key: 'documentHygiene', name: 'Paperwork', max: 20, description: 'Contract quality and completeness' },
  { key: 'fmvVerification', name: 'Deal Value', max: 15, description: 'Fair market value assessment' },
  { key: 'taxReadiness', name: 'Tax Prep', max: 15, description: 'Tax obligation awareness' },
  { key: 'brandSafety', name: 'Brand Check', max: 10, description: 'Appropriate brand categories' },
  { key: 'guardianConsent', name: 'Approval', max: 10, description: 'Parent approval (if minor)' },
];

export function ScoreBreakdownModal({ dealId, deal: initialDeal, onClose }: ScoreBreakdownModalProps) {
  const [deal, setDeal] = useState<DealDetails | null>(initialDeal || null);
  const [loading, setLoading] = useState(!initialDeal);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialDeal) {
      const fetchDeal = async () => {
        try {
          const res = await fetch(`/api/deals/${dealId}`);
          if (!res.ok) throw new Error('Failed to load deal');
          const data = await res.json();
          setDeal(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load deal');
        } finally {
          setLoading(false);
        }
      };
      fetchDeal();
    }
  }, [dealId, initialDeal]);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getOverallStatus = (score: number) => {
    if (score >= 80) return { color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Protected' };
    if (score >= 50) return { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Needs Attention' };
    return { color: 'text-red-600', bg: 'bg-red-100', label: 'At Risk' };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-20 bg-gray-200 rounded-full w-20 mx-auto" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-10 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Deal</h2>
          <p className="text-gray-600 mb-4">{error || 'Deal not found'}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const status = getOverallStatus(deal.overallScore);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Score Breakdown</h2>
            <p className="text-sm text-gray-500">{deal.brandName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${status.bg} mb-3`}>
              <span className={`text-3xl font-bold ${status.color}`}>{deal.overallScore}</span>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
              {status.label}
            </div>
          </div>

          {/* Dimension Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">6-Point Protection Check</h3>
            {dimensionInfo.map((dim) => {
              const dimData = deal.dimensions[dim.key as keyof typeof deal.dimensions];
              const percentage = (dimData.score / dim.max) * 100;
              const scoreColor = getScoreColor(percentage);

              return (
                <div key={dim.key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{dim.name}</span>
                    <span className="text-gray-500">{dimData.score}/{dim.max}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${scoreColor} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{dim.description}</p>
                </div>
              );
            })}
          </div>

          {/* Issues */}
          {deal.issues && deal.issues.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Issues Found</h3>
              <ul className="space-y-2">
                {deal.issues.map((issue) => (
                  <li key={issue.id} className="flex items-start gap-2 text-sm">
                    <span className={`flex-shrink-0 ${
                      issue.severity === 'critical' ? 'text-red-500' : 'text-amber-500'
                    }`}>
                      {issue.severity === 'critical' ? '🔴' : '🟡'}
                    </span>
                    <div>
                      <span className="font-medium">{issue.title}</span>
                      <p className="text-gray-500">{issue.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
