'use client';

import { Info, AlertTriangle } from 'lucide-react';

interface FMVWarningBannerProps {
  fmvAnalysis: {
    estimatedFMV: number;
    actualAmount: number;
    ratio: number;
    severity: 'none' | 'low' | 'medium' | 'high';
    flag?: string;
  };
}

export function FMVWarningBanner({ fmvAnalysis }: FMVWarningBannerProps) {
  if (fmvAnalysis.severity === 'none' || !fmvAnalysis.flag) {
    return null;
  }

  const severityStyles = {
    low: 'bg-blue-50 border-blue-200 text-blue-800',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    high: 'bg-orange-50 border-orange-200 text-orange-800',
  };

  const Icon = fmvAnalysis.severity === 'low' ? Info : AlertTriangle;

  return (
    <div className={`p-4 rounded-lg border ${severityStyles[fmvAnalysis.severity]}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold mb-1">FMV Advisory</h4>
          <p className="text-sm">{fmvAnalysis.flag}</p>
          <div className="mt-2 text-sm flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <span className="font-medium">Estimated FMV:</span> ${fmvAnalysis.estimatedFMV.toLocaleString()}
            </span>
            <span>
              <span className="font-medium">Deal Amount:</span> ${fmvAnalysis.actualAmount.toLocaleString()}
            </span>
            <span>
              <span className="font-medium">Ratio:</span> {fmvAnalysis.ratio.toFixed(1)}x
            </span>
          </div>
          <p className="mt-2 text-xs opacity-75">
            This is an advisory flag. Reviewers can still approve this deal if the amount is justified.
          </p>
        </div>
      </div>
    </div>
  );
}
