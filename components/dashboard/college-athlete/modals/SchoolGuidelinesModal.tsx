'use client';

import { useState, useEffect } from 'react';

interface SchoolGuidelines {
  schoolName: string;
  state: string;
  stateCode: string;
  disclosureDeadlineDays: number;
  nilAllowed: boolean;
  prohibitedCategories: string[];
  additionalRules?: string[];
  complianceEmail?: string;
  compliancePhone?: string;
  resourceLinks?: Array<{
    title: string;
    url: string;
  }>;
}

interface SchoolGuidelinesModalProps {
  schoolId?: string;
  stateRules?: SchoolGuidelines;
  onClose: () => void;
}

export function SchoolGuidelinesModal({ schoolId, stateRules, onClose }: SchoolGuidelinesModalProps) {
  const [guidelines, setGuidelines] = useState<SchoolGuidelines | null>(stateRules || null);
  const [loading, setLoading] = useState(!stateRules);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stateRules && schoolId) {
      const fetchGuidelines = async () => {
        try {
          const res = await fetch(`/api/schools/${schoolId}/guidelines`);
          if (!res.ok) throw new Error('Failed to load guidelines');
          const data = await res.json();
          setGuidelines(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load guidelines');
        } finally {
          setLoading(false);
        }
      };
      fetchGuidelines();
    }
  }, [schoolId, stateRules]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !guidelines) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Guidelines</h2>
          <p className="text-gray-600 mb-4">{error || 'Guidelines not available'}</p>
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

  const categoryDescriptions: Record<string, string> = {
    alcohol: 'Beer, wine, spirits, and alcohol-related brands',
    tobacco: 'Cigarettes, vapes, and tobacco products',
    gambling: 'Sports betting, casinos, and gambling platforms',
    cannabis: 'Marijuana, CBD, and cannabis-related products',
    adult: 'Adult entertainment and explicit content',
    weapons: 'Firearms, ammunition, and weapon accessories',
    cryptocurrency: 'Crypto exchanges, NFTs, and unregulated tokens',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-xl font-bold">{guidelines.state} NIL Rules</h2>
              <p className="text-sm text-white/80">{guidelines.schoolName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Rules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">NIL Allowed</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                guidelines.nilAllowed
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {guidelines.nilAllowed ? 'Yes' : 'No'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">Reporting Deadline</span>
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                {guidelines.disclosureDeadlineDays} days
              </span>
            </div>
          </div>

          {/* Prohibited Categories */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-red-500">🚫</span>
              Off-Limits Categories
            </h3>
            <div className="space-y-2">
              {guidelines.prohibitedCategories.map((category) => (
                <div
                  key={category}
                  className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-red-800 capitalize">{category.replace('_', ' ')}</span>
                    {categoryDescriptions[category] && (
                      <p className="text-sm text-red-600">{categoryDescriptions[category]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Rules */}
          {guidelines.additionalRules && guidelines.additionalRules.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Additional Requirements</h3>
              <ul className="space-y-2">
                {guidelines.additionalRules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Info */}
          {(guidelines.complianceEmail || guidelines.compliancePhone) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-3">
                Contact your school's compliance office with questions:
              </p>
              <div className="space-y-2">
                {guidelines.complianceEmail && (
                  <a
                    href={`mailto:${guidelines.complianceEmail}`}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {guidelines.complianceEmail}
                  </a>
                )}
                {guidelines.compliancePhone && (
                  <a
                    href={`tel:${guidelines.compliancePhone}`}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {guidelines.compliancePhone}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
