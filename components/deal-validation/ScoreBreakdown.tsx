'use client';

import { DimensionScore } from './DimensionScore';
import { ComplianceResult } from '@/lib/compliance/types';

interface ScoreBreakdownProps {
  result: ComplianceResult;
}

const dimensionLabels: Record<string, { name: string; description: string }> = {
  policyFit: {
    name: 'Policy Fit',
    description: 'Compliance with NCAA & state rules',
  },
  documentHygiene: {
    name: 'Document Hygiene',
    description: 'Contract completeness & terms',
  },
  fmvVerification: {
    name: 'FMV Verification',
    description: 'Fair market value assessment',
  },
  taxReadiness: {
    name: 'Tax Readiness',
    description: 'Tax compliance preparation',
  },
  brandSafety: {
    name: 'Brand Safety',
    description: 'Third-party legitimacy check',
  },
  guardianConsent: {
    name: 'Guardian Consent',
    description: 'Parental approval status',
  },
};

export function ScoreBreakdown({ result }: ScoreBreakdownProps) {
  const dimensions = Object.entries(result.dimensions);

  return (
    <div data-testid="score-breakdown" className="space-y-3">
      <h3 className="font-semibold text-gray-900 mb-4">Score Breakdown</h3>

      <div className="grid gap-3">
        {dimensions.map(([key, dimension], index) => {
          const label = dimensionLabels[key] || { name: key, description: '' };
          return (
            <DimensionScore
              key={key}
              dimensionKey={key}
              name={label.name}
              score={dimension.score}
              weight={dimension.weight}
              description={label.description}
              delay={index * 0.1}
            />
          );
        })}
      </div>
    </div>
  );
}
