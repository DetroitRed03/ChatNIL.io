'use client';

import { useState, useEffect } from 'react';

interface FMVData {
  dealAmount: number;
  marketRange: {
    low: number;
    high: number;
  };
  factors: {
    social: number;
    athletic: number;
    market: number;
    brand: number;
  };
  isAboveMarket: boolean;
  percentageAbove?: number;
  sources: string[];
}

interface FMVExplanationModalProps {
  dealId: string;
  brandName: string;
  onClose: () => void;
}

export function FMVExplanationModal({ dealId, brandName, onClose }: FMVExplanationModalProps) {
  const [data, setData] = useState<FMVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFMV() {
      try {
        const res = await fetch(`/api/deals/${dealId}/fmv-breakdown`);
        if (!res.ok) throw new Error('Failed to load FMV data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchFMV();
  }, [dealId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-2/3" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-6 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading FMV</h2>
          <p className="text-gray-600 mb-4">{error || 'Data not available'}</p>
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

  const factorInfo = [
    { key: 'social', label: 'Social Media Score', max: 30, description: 'Based on followers and engagement rate' },
    { key: 'athletic', label: 'Athletic Score', max: 30, description: 'Based on rankings and school prestige' },
    { key: 'market', label: 'Market Score', max: 20, description: 'Based on location and state rules' },
    { key: 'brand', label: 'Brand Score', max: 20, description: 'Based on profile and professionalism' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Fair Market Value Check</h2>
            <p className="text-sm text-gray-500">{brandName}</p>
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
          {/* Deal Amount vs Market Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-500 mb-1">Your Deal Value</div>
              <div className="text-2xl font-bold text-gray-900">
                ${data.dealAmount.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-500 mb-1">Market Range</div>
              <div className="text-xl font-semibold text-gray-900">
                ${data.marketRange.low.toLocaleString()} - ${data.marketRange.high.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Alert if above market */}
          {data.isAboveMarket && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-amber-800">Above Market Rate</div>
                  <div className="text-sm text-amber-700">
                    Your deal is <strong>{data.percentageAbove}%</strong> above typical market rates.
                    This may trigger additional compliance review.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Within market */}
          {!data.isAboveMarket && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-emerald-800">Within Market Range</div>
                  <div className="text-sm text-emerald-700">
                    Your deal value aligns with typical market rates for your profile.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* How FMV is Calculated */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">How We Calculate FMV</h3>
            <div className="space-y-3">
              {factorInfo.map((factor) => {
                const score = data.factors[factor.key as keyof typeof data.factors];
                const percentage = (score / factor.max) * 100;

                return (
                  <div key={factor.key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{factor.label}</span>
                      <span className="text-gray-500">{score}/{factor.max}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{factor.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Sources */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Data Sources</h4>
            <div className="flex flex-wrap gap-2">
              {data.sources.map((source, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-600"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>
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
