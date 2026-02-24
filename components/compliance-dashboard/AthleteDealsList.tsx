'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, CheckCircle, ChevronDown, ChevronUp, DollarSign, Calendar, Shield, Sparkles, Info } from 'lucide-react';

function safe(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && 'name' in val) return String((val as Record<string, unknown>).name);
  return String(val);
}
import { ScoreBadge } from '@/components/compliance/ScoreBadge';

interface AIAnalysisResult {
  enabled: boolean;
  analyzed: boolean;
  contractDetected: boolean;
  confidence: number;
  redFlags: Array<{
    issue: string;
    severity: 'critical' | 'warning' | 'info';
    excerpt?: string;
    recommendation: string;
  }>;
  keyTerms: Array<{
    term: string;
    value: string;
    importance: 'high' | 'medium' | 'low';
  }>;
  summary: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  analyzedAt: string;
}

interface AthleteDeal {
  id: string;
  thirdPartyName: string;
  compensation: number;
  score: number | null;
  status: 'green' | 'yellow' | 'red' | 'pending';
  dealStatus: 'active' | 'completed' | 'review';
  topIssue: string | null;
  submittedAt: string;
  hasOverride: boolean;
  aiAnalysis?: AIAnalysisResult | null;
  aiAnalysisEnabled?: boolean;
}

interface AthleteDealsListProps {
  deals: AthleteDeal[];
  onViewDeal?: (dealId: string) => void;
  onReviewDeal?: (dealId: string) => void;
}

export function AthleteDealsList({ deals, onViewDeal, onReviewDeal }: AthleteDealsListProps) {
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'red':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'yellow':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'green':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'red':
        return (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            RED
          </span>
        );
      case 'yellow':
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            YELLOW
          </span>
        );
      case 'green':
        return (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            GREEN
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            PENDING
          </span>
        );
    }
  };

  const getDealStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            Active
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            Completed
          </span>
        );
      case 'review':
        return (
          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
            Under Review
          </span>
        );
      default:
        return null;
    }
  };

  if (deals.length === 0) {
    return (
      <motion.div
        data-testid="athlete-deals-list"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center"
      >
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No Deals Submitted</p>
        <p className="text-sm text-gray-500 mt-1">This athlete has not submitted any NIL deals yet</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      data-testid="athlete-deals-list"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm"
    >
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">NIL Deals ({deals.length})</h2>
        <p className="text-sm text-gray-500">Sorted by compliance severity</p>
      </div>

      <div className="divide-y divide-gray-100">
        {deals.map((deal, index) => (
          <div key={deal.id}>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setExpandedDeal(expandedDeal === deal.id ? null : deal.id)}
              className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
            >
              {getStatusIcon(deal.status)}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">{safe(deal.thirdPartyName)}</span>
                  {getStatusBadge(deal.status)}
                  {getDealStatusBadge(deal.dealStatus)}
                  {deal.hasOverride && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                      Overridden
                    </span>
                  )}
                  {deal.aiAnalysis?.analyzed && deal.aiAnalysis.redFlags.length > 0 && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI: {deal.aiAnalysis.redFlags.filter(f => f.severity === 'critical').length > 0 ? 'Issues' : 'Review'}
                    </span>
                  )}
                </div>
                {deal.topIssue && (deal.status === 'red' || deal.status === 'yellow') && (
                  <p className="text-sm text-gray-500 mt-1 truncate">{safe(deal.topIssue)}</p>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  {formatCurrency(deal.compensation)}
                </p>
                {deal.score !== null && deal.status !== 'pending' && (
                  <ScoreBadge
                    totalScore={deal.score}
                    status={deal.status as 'green' | 'yellow' | 'red'}
                    issues={deal.topIssue ? [safe(deal.topIssue)] : []}
                  />
                )}
              </div>

              {expandedDeal === deal.id ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </motion.button>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedDeal === deal.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Submitted</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(deal.submittedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Compliance Score</p>
                          <p className="text-sm font-medium text-gray-900">
                            {deal.score !== null ? `${deal.score}/100` : 'Pending'}
                          </p>
                        </div>
                      </div>

                      {deal.topIssue && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Top Issue</p>
                          <p className="text-sm text-gray-700">{safe(deal.topIssue)}</p>
                        </div>
                      )}

                      {/* AI Analysis Section */}
                      {deal.aiAnalysisEnabled && deal.aiAnalysis && deal.aiAnalysis.analyzed && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-orange-600" />
                            <p className="text-xs font-semibold text-purple-700">AI Contract Analysis</p>
                            {deal.aiAnalysis.riskLevel === 'critical' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">Critical</span>
                            )}
                            {deal.aiAnalysis.riskLevel === 'high' && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">High</span>
                            )}
                            {deal.aiAnalysis.riskLevel === 'medium' && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Medium</span>
                            )}
                            {deal.aiAnalysis.riskLevel === 'low' && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Low</span>
                            )}
                          </div>

                          {deal.aiAnalysis.redFlags.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {deal.aiAnalysis.redFlags.slice(0, 2).map((flag, idx) => (
                                <div key={idx} className={`text-xs p-2 rounded-lg flex items-start gap-2 ${
                                  flag.severity === 'critical' ? 'bg-red-50 text-red-700' :
                                  flag.severity === 'warning' ? 'bg-amber-50 text-amber-700' :
                                  'bg-blue-50 text-blue-700'
                                }`}>
                                  {flag.severity === 'critical' ? <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" /> :
                                   flag.severity === 'warning' ? <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" /> :
                                   <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                                  <span>{flag.issue}</span>
                                </div>
                              ))}
                              {deal.aiAnalysis.redFlags.length > 2 && (
                                <p className="text-xs text-gray-500">
                                  +{deal.aiAnalysis.redFlags.length - 2} more issues
                                </p>
                              )}
                            </div>
                          )}

                          {deal.aiAnalysis.redFlags.length === 0 && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              No contract issues detected
                            </p>
                          )}
                        </div>
                      )}

                      {deal.aiAnalysisEnabled && (!deal.aiAnalysis || !deal.aiAnalysis.analyzed) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Sparkles className="w-4 h-4" />
                            <p className="text-xs">AI analysis pending - no contract text available</p>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        {onReviewDeal && (deal.status === 'red' || deal.status === 'yellow' || deal.status === 'pending') && (
                          <button
                            onClick={() => onReviewDeal(deal.id)}
                            className="flex-1 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                          >
                            Review Deal
                          </button>
                        )}
                        {onViewDeal && (
                          <button
                            onClick={() => onViewDeal(deal.id)}
                            className="flex-1 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
