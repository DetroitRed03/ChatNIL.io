'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  Shield,
  Zap
} from 'lucide-react';

interface AIRedFlag {
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  excerpt?: string;
  recommendation: string;
}

interface AIKeyTerm {
  term: string;
  value: string;
  importance: 'high' | 'medium' | 'low';
}

interface AIAnalysisResult {
  enabled: boolean;
  analyzed: boolean;
  contractDetected: boolean;
  confidence: number;
  redFlags: AIRedFlag[];
  keyTerms: AIKeyTerm[];
  summary: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  analyzedAt: string;
  error?: string;
}

interface AIInsightsCardProps {
  aiAnalysis: AIAnalysisResult | null;
  isEnabled: boolean;
}

export function AIInsightsCard({ aiAnalysis, isEnabled }: AIInsightsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllRedFlags, setShowAllRedFlags] = useState(false);

  // If AI analysis is not enabled, show disabled state
  if (!isEnabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gray-100 rounded-xl">
            <Sparkles className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Deal Analysis</h3>
            <p className="text-xs text-gray-500">Disabled</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          AI analysis is not enabled. Enable it in Settings to get automated contract insights.
        </p>
      </motion.div>
    );
  }

  // If no analysis data
  if (!aiAnalysis) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-100 rounded-xl">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Deal Analysis</h3>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          AI analysis will run when the deal is scored.
        </p>
      </motion.div>
    );
  }

  // Get risk level styling
  const getRiskBadge = () => {
    switch (aiAnalysis.riskLevel) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            Critical Risk
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
            High Risk
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
            Medium Risk
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            Low Risk
          </span>
        );
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-100';
      case 'warning':
        return 'bg-amber-50 border-amber-100';
      default:
        return 'bg-blue-50 border-blue-100';
    }
  };

  const criticalFlags = aiAnalysis.redFlags.filter(f => f.severity === 'critical');
  const warningFlags = aiAnalysis.redFlags.filter(f => f.severity === 'warning');
  const infoFlags = aiAnalysis.redFlags.filter(f => f.severity === 'info');

  const displayedFlags = showAllRedFlags
    ? aiAnalysis.redFlags
    : aiAnalysis.redFlags.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Contract Analysis</h3>
              <p className="text-xs text-gray-500">
                {aiAnalysis.analyzed
                  ? `Confidence: ${Math.round(aiAnalysis.confidence * 100)}%`
                  : 'Analysis pending'}
              </p>
            </div>
          </div>
          {aiAnalysis.analyzed && getRiskBadge()}
        </div>
      </div>

      {/* Summary */}
      {aiAnalysis.analyzed && aiAnalysis.contractDetected && (
        <div className="p-5 border-b border-gray-100">
          <p className="text-sm text-gray-700">{aiAnalysis.summary}</p>

          {/* Quick Stats */}
          <div className="mt-4 flex gap-4">
            {criticalFlags.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="font-medium text-red-700">{criticalFlags.length} Critical</span>
              </div>
            )}
            {warningFlags.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="font-medium text-amber-700">{warningFlags.length} Warning</span>
              </div>
            )}
            {infoFlags.length > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-700">{infoFlags.length} Info</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Not Analyzed State */}
      {!aiAnalysis.analyzed && (
        <div className="p-5">
          <div className="flex items-center gap-3 text-gray-500">
            <FileText className="w-5 h-5" />
            <span className="text-sm">{aiAnalysis.summary}</span>
          </div>
        </div>
      )}

      {/* Red Flags Section */}
      {aiAnalysis.analyzed && aiAnalysis.redFlags.length > 0 && (
        <div className="p-5 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Contract Issues ({aiAnalysis.redFlags.length})
          </h4>

          <div className="space-y-3">
            {displayedFlags.map((flag, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border ${getSeverityBg(flag.severity)}`}
              >
                <div className="flex items-start gap-2">
                  {getSeverityIcon(flag.severity)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{flag.issue}</p>
                    {flag.excerpt && (
                      <p className="text-xs text-gray-500 mt-1 italic truncate">
                        "{flag.excerpt}"
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-2">{flag.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {aiAnalysis.redFlags.length > 3 && (
            <button
              onClick={() => setShowAllRedFlags(!showAllRedFlags)}
              className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              {showAllRedFlags ? (
                <>Show Less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Show All ({aiAnalysis.redFlags.length}) <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
      )}

      {/* Key Terms */}
      {aiAnalysis.analyzed && aiAnalysis.keyTerms.length > 0 && (
        <div className="p-5 border-b border-gray-100">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between"
          >
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Key Terms Detected ({aiAnalysis.keyTerms.length})
            </h4>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 grid gap-2">
                  {aiAnalysis.keyTerms.map((term, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-600">{term.term}</span>
                      <span className={`text-sm font-medium ${
                        term.importance === 'high'
                          ? 'text-purple-700'
                          : term.importance === 'medium'
                            ? 'text-gray-700'
                            : 'text-gray-500'
                      }`}>
                        {term.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* AI Recommendations */}
      {aiAnalysis.recommendations.length > 0 && (
        <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            AI Recommendations
          </h4>
          <ul className="space-y-2">
            {aiAnalysis.recommendations.slice(0, 4).map((rec, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Analysis Timestamp */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Analyzed: {new Date(aiAnalysis.analyzedAt).toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}
