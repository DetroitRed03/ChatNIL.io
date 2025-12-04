'use client';

import { DollarSign, Image, Award, Calendar, Video, Package } from 'lucide-react';

interface DealEstimate {
  low: number;
  mid: number;
  high: number;
}

interface DealValueEstimates {
  sponsored_post: DealEstimate;
  brand_ambassador: DealEstimate;
  event_appearance: DealEstimate;
  product_endorsement: DealEstimate;
  content_creation: DealEstimate;
}

interface DealValueEstimatorProps {
  estimates: DealValueEstimates;
}

const DEAL_TYPES = [
  {
    key: 'sponsored_post' as const,
    label: 'Sponsored Post',
    icon: Image,
    description: 'Single social media post promoting a product or service',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    key: 'brand_ambassador' as const,
    label: 'Brand Ambassador',
    icon: Award,
    description: 'Ongoing partnership representing a brand',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    key: 'event_appearance' as const,
    label: 'Event Appearance',
    icon: Calendar,
    description: 'Attending and promoting an event',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    key: 'product_endorsement' as const,
    label: 'Product Endorsement',
    icon: Package,
    description: 'Endorsing a specific product or product line',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    key: 'content_creation' as const,
    label: 'Content Creation',
    icon: Video,
    description: 'Creating original content for a brand',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
];

function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount}`;
}

export function DealValueEstimator({ estimates }: DealValueEstimatorProps) {
  return (
    <div className="space-y-4">
      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Note:</strong> These are estimated values based on your FMV score and social reach.
            Actual deal values may vary based on market conditions, negotiation, and specific brand requirements.
          </div>
        </div>
      </div>

      {/* Deal Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEAL_TYPES.map((dealType) => {
          const estimate = estimates[dealType.key];
          const Icon = dealType.icon;

          return (
            <div
              key={dealType.key}
              className={`border-2 ${dealType.borderColor} ${dealType.bgColor} rounded-lg p-5 hover:shadow-md transition-shadow`}
            >
              {/* Icon and Title */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-white border ${dealType.borderColor}`}>
                  <Icon className={`w-5 h-5 ${dealType.color}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${dealType.color}`}>{dealType.label}</h4>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 mb-4">{dealType.description}</p>

              {/* Price Range */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-600">Low</span>
                  <span className="text-lg font-bold text-gray-700">{formatCurrency(estimate.low)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-600">Mid</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(estimate.mid)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-600">High</span>
                  <span className="text-lg font-bold text-gray-700">{formatCurrency(estimate.high)}</span>
                </div>
              </div>

              {/* Range Bar */}
              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${dealType.color.replace('text', 'bg')} opacity-50`} style={{ width: '100%' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
        <h4 className="font-semibold text-gray-900 mb-4">Potential Annual Value</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Conservative</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                Object.values(estimates).reduce((sum, est) => sum + est.low, 0)
              )}
            </div>
            <div className="text-xs text-gray-500">If you do 1 of each deal type</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Expected</div>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(
                Object.values(estimates).reduce((sum, est) => sum + est.mid, 0)
              )}
            </div>
            <div className="text-xs text-gray-500">Mid-range estimate</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Optimistic</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                Object.values(estimates).reduce((sum, est) => sum + est.high, 0)
              )}
            </div>
            <div className="text-xs text-gray-500">High-end potential</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 text-sm">💡 Tips to Maximize Your NIL Value</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Build authentic relationships with brands that align with your values</li>
          <li>• Maintain consistent engagement with your audience across platforms</li>
          <li>• Create high-quality content that showcases your personality and athleticism</li>
          <li>• Be professional and deliver on your commitments to build long-term partnerships</li>
          <li>• Stay compliant with your state's NIL rules and school policies</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Compact single deal type estimator
 */
export function SingleDealEstimate({
  type,
  estimate
}: {
  type: keyof DealValueEstimates;
  estimate: DealEstimate;
}) {
  const dealType = DEAL_TYPES.find(dt => dt.key === type);
  if (!dealType) return null;

  const Icon = dealType.icon;

  return (
    <div className={`border ${dealType.borderColor} ${dealType.bgColor} rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-5 h-5 ${dealType.color}`} />
        <span className={`font-semibold ${dealType.color}`}>{dealType.label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{formatCurrency(estimate.mid)}</span>
        <span className="text-sm text-gray-600">typical value</span>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Range: {formatCurrency(estimate.low)} - {formatCurrency(estimate.high)}
      </div>
    </div>
  );
}
