'use client';

import { useMemo } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ComplianceScore {
  total_score: number;
  status: 'green' | 'yellow' | 'red';
  policy_fit_score: number;
  document_score: number;
  fmv_score: number;
  tax_score: number;
  brand_safety_score: number;
  guardian_consent_score: number;
  reason_codes?: string[];
  critical_issues?: string[];
  warnings?: string[];
  fix_recommendations?: string[];
  policy_fit_notes?: string;
  document_notes?: string;
  fmv_notes?: string;
  tax_notes?: string;
  brand_safety_notes?: string;
  guardian_consent_notes?: string;
}

interface ScoreExplanationProps {
  score: ComplianceScore;
  showImprovement?: boolean;
  compact?: boolean;
}

const DIMENSIONS: Record<string, {
  name: string;
  weight: string;
  noteKey: keyof ComplianceScore;
  getFallback: (score: number) => string;
}> = {
  policy_fit_score: {
    name: 'School Policy',
    weight: '30%',
    noteKey: 'policy_fit_notes',
    getFallback: (score: number) => {
      if (score >= 80) return 'Deal complies with all school policies';
      if (score >= 60) return 'Minor policy concerns to review';
      return 'Policy violations detected';
    },
  },
  document_score: {
    name: 'Documentation',
    weight: '20%',
    noteKey: 'document_notes',
    getFallback: (score: number) => {
      if (score >= 80) return 'All required documents uploaded';
      if (score >= 60) return 'Some documentation missing';
      return 'Missing required documentation';
    },
  },
  fmv_score: {
    name: 'Fair Market Value',
    weight: '15%',
    noteKey: 'fmv_notes',
    getFallback: (score: number) => {
      if (score >= 80) return 'Compensation within expected market range';
      if (score >= 60) return 'Compensation slightly above typical rates';
      return 'Compensation significantly above market rate';
    },
  },
  tax_score: {
    name: 'Tax Readiness',
    weight: '15%',
    noteKey: 'tax_notes',
    getFallback: (score: number) => {
      if (score >= 80) return 'Tax documentation and planning in order';
      if (score >= 60) return 'Some tax planning recommended';
      return 'High earnings require tax planning attention';
    },
  },
  brand_safety_score: {
    name: 'Brand Safety',
    weight: '10%',
    noteKey: 'brand_safety_notes',
    getFallback: (score: number) => {
      if (score >= 80) return 'Brand is appropriate and approved';
      if (score >= 60) return 'Brand requires additional review';
      return 'Brand in restricted or prohibited category';
    },
  },
  guardian_consent_score: {
    name: 'Guardian Consent',
    weight: '10%',
    noteKey: 'guardian_consent_notes',
    getFallback: (score: number) => {
      if (score >= 80) return 'Not required or consent obtained';
      if (score >= 60) return 'Consent pending';
      return 'Guardian consent required but not obtained';
    },
  },
};

function getScoreIcon(score: number) {
  if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (score >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  return <XCircle className="w-4 h-4 text-red-500" />;
}

function getBarColor(score: number) {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getOverallExplanation(total: number): string {
  if (total >= 80) return 'This deal meets compliance requirements and is ready for approval.';
  if (total >= 60) return 'This deal has some concerns that should be reviewed before approval.';
  return 'This deal has significant compliance issues that must be addressed.';
}

export function ScoreExplanation({ score, showImprovement = true, compact = false }: ScoreExplanationProps) {
  const dimensions = useMemo(() => [
    { key: 'policy_fit_score', value: score.policy_fit_score },
    { key: 'document_score', value: score.document_score },
    { key: 'fmv_score', value: score.fmv_score },
    { key: 'tax_score', value: score.tax_score },
    { key: 'brand_safety_score', value: score.brand_safety_score },
    { key: 'guardian_consent_score', value: score.guardian_consent_score },
  ], [score]);

  const recommendations = score.fix_recommendations || [];
  const criticalIssues = score.critical_issues || [];

  if (compact) {
    const problemAreas = dimensions.filter(d => d.value < 60);
    if (problemAreas.length === 0) return null;
    return (
      <div className="text-xs text-gray-500 mt-1">
        Issues: {problemAreas.map(d => DIMENSIONS[d.key].name).join(', ')}
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* Overall Score Header */}
      <div className={`p-6 text-center ${
        score.status === 'green' ? 'bg-green-50' :
        score.status === 'yellow' ? 'bg-yellow-50' : 'bg-red-50'
      }`}>
        <div className={`text-5xl font-bold ${
          score.status === 'green' ? 'text-green-600' :
          score.status === 'yellow' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {score.total_score}
        </div>
        <div className="text-gray-500 mt-1">out of 100</div>
        <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          score.status === 'green' ? 'bg-green-100 text-green-700' :
          score.status === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {score.status === 'green' ? <CheckCircle className="w-4 h-4" /> :
           score.status === 'yellow' ? <AlertTriangle className="w-4 h-4" /> :
           <XCircle className="w-4 h-4" />}
          {score.status === 'green' ? 'Compliant' :
           score.status === 'yellow' ? 'Needs Review' : 'Critical Issues'}
        </div>
      </div>

      {/* Why This Score */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600">
            {getOverallExplanation(score.total_score)}
          </p>
        </div>
      </div>

      {/* Dimension Breakdown */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Score Breakdown
        </h4>
        <div className="space-y-4">
          {dimensions.map(({ key, value }) => {
            const dim = DIMENSIONS[key];
            const note = score[dim.noteKey as keyof ComplianceScore] as string | undefined;
            const explanation = note || dim.getFallback(value);
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {dim.name}
                    <span className="text-xs text-gray-400 ml-1">({dim.weight})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{value}/100</span>
                    {getScoreIcon(value)}
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full ${getBarColor(value)} transition-all`}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{explanation}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <div className="p-4 border-t bg-red-50">
          <h4 className="text-sm font-semibold text-red-800 mb-2">Flagged Issues</h4>
          <ul className="space-y-1">
            {criticalIssues.map((issue, i) => (
              <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement Suggestions */}
      {showImprovement && recommendations.length > 0 && score.total_score < 80 && (
        <div className="p-4 border-t bg-blue-50">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">To Improve This Score</h4>
          <ul className="space-y-1">
            {recommendations.map((suggestion, i) => (
              <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                <span className="text-blue-400">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
