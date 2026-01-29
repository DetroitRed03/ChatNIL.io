'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Save, RefreshCw, Loader2, ChevronLeft } from 'lucide-react';
import { ComplianceResult } from '@/lib/compliance/types';
import { ScoreBreakdown } from '../ScoreBreakdown';
import { IssueCard } from '../IssueCard';
import { RecommendationList } from '../RecommendationList';

interface ResultsStepProps {
  result: ComplianceResult;
  onSave: () => void;
  onStartOver: () => void;
  isSaving: boolean;
  isSaved: boolean;
}

function getStatusConfig(status: 'green' | 'yellow' | 'red') {
  switch (status) {
    case 'green':
      return {
        icon: CheckCircle,
        label: 'Compliant',
        emoji: '🟢',
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        borderColor: 'border-green-200',
        description: 'This deal passes all compliance checks. You can proceed with confidence.',
      };
    case 'yellow':
      return {
        icon: AlertTriangle,
        label: 'Review Required',
        emoji: '🟡',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-600',
        borderColor: 'border-yellow-200',
        description: 'This deal has some issues that should be addressed before proceeding.',
      };
    case 'red':
      return {
        icon: XCircle,
        label: 'Issues Detected',
        emoji: '🔴',
        bgColor: 'bg-red-100',
        textColor: 'text-red-600',
        borderColor: 'border-red-200',
        description: 'This deal has significant compliance issues. Do not proceed without resolving them.',
      };
  }
}

function getRiskIssues(result: ComplianceResult) {
  const issues: { type: 'warning' | 'error' | 'critical'; title: string; description: string }[] = [];

  // Check for high pay-for-play risk
  if (result.payForPlayRisk === 'high') {
    issues.push({
      type: 'critical',
      title: 'High Pay-for-Play Risk',
      description: 'This deal shows indicators of disguised pay-for-play which is prohibited under NCAA rules.',
    });
  } else if (result.payForPlayRisk === 'medium') {
    issues.push({
      type: 'error',
      title: 'Medium Pay-for-Play Risk',
      description: 'Some aspects of this deal raise concerns about legitimacy. Proceed with caution.',
    });
  }

  // Check for third-party verification
  if (!result.isThirdPartyVerified) {
    issues.push({
      type: 'error',
      title: 'Third-Party Not Verified',
      description: 'This deal may not be from a legitimate third-party source.',
    });
  }

  // Check individual dimension scores
  Object.entries(result.dimensions).forEach(([key, dimension]) => {
    if (dimension.score < 50) {
      const names: Record<string, string> = {
        policyFit: 'Policy Compliance',
        documentHygiene: 'Documentation',
        fmvVerification: 'Fair Market Value',
        taxReadiness: 'Tax Preparation',
        brandSafety: 'Brand Verification',
        guardianConsent: 'Consent Status',
      };

      issues.push({
        type: dimension.score < 30 ? 'critical' : 'error',
        title: `Low ${names[key] || key} Score`,
        description: dimension.notes || dimension.recommendations[0] || 'This area needs attention.',
      });
    }
  });

  return issues;
}

export function ResultsStep({ result, onSave, onStartOver, isSaving, isSaved }: ResultsStepProps) {
  const statusConfig = getStatusConfig(result.status);
  const StatusIcon = statusConfig.icon;
  const issues = getRiskIssues(result);
  const canSave = result.status !== 'red';

  return (
    <div data-testid="results-step" className="space-y-6">
      {/* Score Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`text-center p-8 rounded-2xl ${statusConfig.bgColor} border ${statusConfig.borderColor}`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-6xl mb-4"
        >
          {statusConfig.emoji}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-600 mb-2"
        >
          Compliance Score
        </motion.p>

        <motion.p
          data-testid="compliance-score"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`text-6xl font-bold ${statusConfig.textColor}`}
        >
          {result.totalScore}<span className="text-3xl text-gray-400">/100</span>
        </motion.p>

        <motion.div
          data-testid="compliance-status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 mt-3"
        >
          <StatusIcon className={`w-5 h-5 ${statusConfig.textColor}`} />
          <span className={`text-lg font-semibold ${statusConfig.textColor}`}>
            {statusConfig.label}
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-gray-600 mt-3 max-w-md mx-auto"
        >
          {statusConfig.description}
        </motion.p>
      </motion.div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Issues Found</h3>
          {issues.map((issue, index) => (
            <IssueCard
              key={index}
              type={issue.type}
              title={issue.title}
              description={issue.description}
              delay={0.1 * index}
            />
          ))}
        </div>
      )}

      {/* Score Breakdown */}
      <ScoreBreakdown result={result} />

      {/* Recommendations */}
      <RecommendationList recommendations={result.overallRecommendations} />

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-between pt-4 border-t border-gray-200"
      >
        <button
          onClick={onStartOver}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-5 h-5" />
          Start Over
        </button>

        {isSaved ? (
          <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-xl">
            <CheckCircle className="w-5 h-5" />
            Deal Saved!
          </div>
        ) : canSave ? (
          <button
            data-testid="save-deal-button"
            onClick={onSave}
            disabled={isSaving}
            className={`
              flex items-center gap-2 px-8 py-3 font-semibold rounded-xl transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              ${result.status === 'green'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }
            `}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {result.status === 'green' ? 'Save Deal' : 'Save Anyway'}
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-xl text-sm">
            <XCircle className="w-4 h-4" />
            Cannot save - address issues first
          </div>
        )}
      </motion.div>
    </div>
  );
}
