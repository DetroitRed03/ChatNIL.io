'use client';

import { DimensionScoreBar } from './DimensionScoreBar';

interface DimensionData {
  score: number;
  weight: number;
  status: 'good' | 'warning' | 'critical';
  label?: string;
}

interface DimensionBreakdownProps {
  dimensions: {
    policyFit: DimensionData;
    documentHygiene: DimensionData;
    fmvVerification: DimensionData;
    taxReadiness: DimensionData;
    brandSafety: DimensionData;
    guardianConsent: DimensionData;
  };
  compact?: boolean;
  className?: string;
}

export function DimensionBreakdown({
  dimensions,
  compact = false,
  className = ''
}: DimensionBreakdownProps) {
  const dimensionOrder = [
    { key: 'policyFit', label: 'School Rules' },
    { key: 'documentHygiene', label: 'Paperwork' },
    { key: 'fmvVerification', label: 'Deal Value' },
    { key: 'taxReadiness', label: 'Tax Prep' },
    { key: 'brandSafety', label: 'Brand Check' },
    { key: 'guardianConsent', label: 'Approval' }
  ] as const;

  if (compact) {
    // Compact view - just colored dots
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {dimensionOrder.map(({ key }) => {
          const dim = dimensions[key];
          const colorClass = dim.status === 'good' ? 'bg-emerald-500' :
                            dim.status === 'warning' ? 'bg-amber-500' : 'bg-red-500';
          return (
            <div
              key={key}
              className={`w-3 h-3 rounded-full ${colorClass}`}
              title={`${key}: ${dim.score}/100`}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">6-Point Protection Check</h4>
        <span className="text-xs text-gray-400">Hover for details</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {dimensionOrder.map(({ key, label }) => {
          const dim = dimensions[key];
          return (
            <DimensionScoreBar
              key={key}
              dimension={key}
              label={dim.label || label}
              score={dim.score}
              status={dim.status}
              weight={dim.weight}
            />
          );
        })}
      </div>
    </div>
  );
}
