'use client';

import { AthleteTooltip } from '../shared/AthleteTooltip';

interface DimensionScoreBarProps {
  dimension: string;
  label: string;
  score: number;
  status: 'good' | 'warning' | 'critical';
  description?: string;
  weight: number;
  className?: string;
}

// Human-readable dimension names
const dimensionLabels: Record<string, string> = {
  policy_fit: 'School Rules',
  policyFit: 'School Rules',
  document_hygiene: 'Paperwork',
  documentHygiene: 'Paperwork',
  fmv_verification: 'Deal Value',
  fmvVerification: 'Deal Value',
  tax_readiness: 'Tax Prep',
  taxReadiness: 'Tax Prep',
  brand_safety: 'Brand Check',
  brandSafety: 'Brand Check',
  guardian_consent: 'Approval',
  guardianConsent: 'Approval'
};

const dimensionDescriptions: Record<string, string> = {
  policy_fit: 'Checks if the deal follows NCAA rules and your school\'s policies',
  policyFit: 'Checks if the deal follows NCAA rules and your school\'s policies',
  document_hygiene: 'Makes sure your contract is complete and has no risky terms',
  documentHygiene: 'Makes sure your contract is complete and has no risky terms',
  fmv_verification: 'Verifies you\'re being paid a fair market rate - not too high (red flag) or too low',
  fmvVerification: 'Verifies you\'re being paid a fair market rate - not too high (red flag) or too low',
  tax_readiness: 'Confirms you understand your tax obligations for this income',
  taxReadiness: 'Confirms you understand your tax obligations for this income',
  brand_safety: 'Checks if the brand is appropriate and won\'t hurt your image',
  brandSafety: 'Checks if the brand is appropriate and won\'t hurt your image',
  guardian_consent: 'Verifies parent/guardian approval if required',
  guardianConsent: 'Verifies parent/guardian approval if required'
};

export function DimensionScoreBar({
  dimension,
  label,
  score,
  status,
  description,
  weight,
  className = ''
}: DimensionScoreBarProps) {
  const displayLabel = label || dimensionLabels[dimension] || dimension;
  const tooltipContent = description || dimensionDescriptions[dimension];

  const statusColors = {
    good: {
      bar: 'bg-emerald-500',
      text: 'text-emerald-600',
      bg: 'bg-emerald-100'
    },
    warning: {
      bar: 'bg-amber-500',
      text: 'text-amber-600',
      bg: 'bg-amber-100'
    },
    critical: {
      bar: 'bg-red-500',
      text: 'text-red-600',
      bg: 'bg-red-100'
    }
  };

  const colors = statusColors[status];

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-1">
        <AthleteTooltip content={tooltipContent} position="top">
          <span className="text-sm font-medium text-gray-700 cursor-help flex items-center gap-1">
            {displayLabel}
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </AthleteTooltip>
        <span className={`text-sm font-semibold ${colors.text}`}>
          {score}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-0.5">
        {Math.round(weight * 100)}% of your score
      </p>
    </div>
  );
}
