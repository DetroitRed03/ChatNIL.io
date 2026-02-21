'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Clock,
  Shield,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import type { DealAnalysis } from '@/lib/types/deal-analysis';
import ComplianceScoreRing from './ComplianceScoreRing';
import { ScoreBreakdown } from '@/components/deal-validation/ScoreBreakdown';
import { IssueCard } from '@/components/deal-validation/IssueCard';

interface DealAnalysisResultProps {
  analysis: DealAnalysis;
  onClose: () => void;
  onConvertToDeal: (analysisId: string) => void;
  onDelete?: (analysisId: string) => void;
}

function getDealTypeLabel(type: string | null) {
  const labels: Record<string, string> = {
    social_post: 'Social Media Post',
    appearance: 'Personal Appearance',
    endorsement: 'Endorsement',
    brand_ambassador: 'Brand Ambassador',
    merchandise: 'Merchandise',
    other: 'Other',
  };
  return labels[type || ''] || 'Deal';
}

export default function DealAnalysisResult({
  analysis,
  onClose,
  onConvertToDeal,
  onDelete,
}: DealAnalysisResultProps) {
  const extraction = analysis.extractionResult;
  const compliance = analysis.complianceResult;
  const isConverted = !!analysis.convertedToDealId;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed inset-4 sm:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-amber-50">
          <h2 className="text-xl font-bold text-gray-900">Deal Analysis</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left column: Image + Extraction */}
            <div className="space-y-6">
              {/* Screenshot */}
              <div className="rounded-xl border overflow-hidden bg-gray-50">
                <img
                  src={analysis.imageUrl}
                  alt={analysis.imageFilename}
                  className="w-full max-h-80 object-contain"
                />
              </div>

              {/* Extracted Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Extracted Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <DetailField
                    icon={<Users className="w-4 h-4" />}
                    label="Brand"
                    value={extraction?.brand || 'Unknown'}
                  />
                  <DetailField
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Compensation"
                    value={extraction?.compensation ? `$${extraction.compensation.toLocaleString()}` : 'Not specified'}
                  />
                  <DetailField
                    icon={<FileText className="w-4 h-4" />}
                    label="Deal Type"
                    value={getDealTypeLabel(analysis.extractedDealType)}
                  />
                  <DetailField
                    icon={<Clock className="w-4 h-4" />}
                    label="Timeline"
                    value={extraction?.timeline || 'Not specified'}
                  />
                  <DetailField
                    icon={<Shield className="w-4 h-4" />}
                    label="Exclusivity"
                    value={extraction?.exclusivity ? 'Yes' : 'No'}
                  />
                  <DetailField
                    icon={<Calendar className="w-4 h-4" />}
                    label="Analyzed"
                    value={new Date(analysis.createdAt).toLocaleDateString()}
                  />
                </div>

                {/* Deliverables */}
                {extraction?.deliverables && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Deliverables</p>
                    <p className="text-sm text-gray-800">{extraction.deliverables}</p>
                  </div>
                )}

                {/* Compensation description */}
                {extraction?.compensationDescription && extraction.compensationDescription !== String(extraction.compensation) && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Compensation Details</p>
                    <p className="text-sm text-gray-800">{extraction.compensationDescription}</p>
                  </div>
                )}

                {/* Confidence indicator */}
                {extraction && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className={`w-2 h-2 rounded-full ${
                      extraction.confidence >= 0.7 ? 'bg-green-400' :
                      extraction.confidence >= 0.4 ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    AI Confidence: {Math.round(extraction.confidence * 100)}%
                  </div>
                )}
              </div>
            </div>

            {/* Right column: Compliance */}
            <div className="space-y-6">
              {/* Score ring */}
              {analysis.complianceScore != null && analysis.complianceStatus && (
                <div className="flex justify-center py-4">
                  <ComplianceScoreRing
                    score={analysis.complianceScore}
                    status={analysis.complianceStatus}
                    size={140}
                    strokeWidth={10}
                  />
                </div>
              )}

              {/* Red flags */}
              {analysis.extractedRedFlags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Red Flags ({analysis.extractedRedFlags.length})
                  </h3>
                  <div className="space-y-2">
                    {analysis.extractedRedFlags.map((flag, i) => (
                      <IssueCard
                        key={i}
                        type="warning"
                        title={flag}
                        description=""
                        delay={i * 0.05}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 6D Score breakdown */}
              {compliance && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Compliance Breakdown</h3>
                  <ScoreBreakdown result={compliance} />
                </div>
              )}

              {/* Recommendations */}
              {compliance?.overallRecommendations && compliance.overallRecommendations.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Recommendations
                  </h3>
                  <ul className="space-y-1.5">
                    {compliance.overallRecommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                        <span className="text-blue-400 mt-1">-</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center gap-3">
            {onDelete && !isConverted && (
              <button
                onClick={() => onDelete(analysis.id)}
                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isConverted ? (
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Converted to Deal
              </span>
            ) : (
              <button
                onClick={() => onConvertToDeal(analysis.id)}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-orange-200/50 hover:shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
              >
                Create Deal for Review
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function DetailField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
