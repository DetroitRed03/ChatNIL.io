'use client';

import { motion } from 'framer-motion';
import { Calendar, DollarSign, FileCheck, ArrowRight } from 'lucide-react';
import type { DealAnalysis } from '@/lib/types/deal-analysis';
import ComplianceScoreRing from './ComplianceScoreRing';

interface AnalysisCardProps {
  analysis: DealAnalysis;
  onClick: () => void;
  index?: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCompensation(amount: number | null) {
  if (!amount) return 'TBD';
  return `$${amount.toLocaleString()}`;
}

function getDealTypeLabel(type: string | null) {
  const labels: Record<string, string> = {
    social_post: 'Social Post',
    appearance: 'Appearance',
    endorsement: 'Endorsement',
    brand_ambassador: 'Ambassador',
    merchandise: 'Merchandise',
    other: 'Other',
  };
  return labels[type || ''] || 'Deal';
}

export default function AnalysisCard({ analysis, onClick, index = 0 }: AnalysisCardProps) {
  const hasImage = analysis.imageUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
      whileHover={{ y: -4, shadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer overflow-hidden group"
    >
      {/* Image thumbnail */}
      <div className="relative h-36 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
        {hasImage ? (
          <img
            src={analysis.imageUrl}
            alt={analysis.imageFilename}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileCheck className="w-12 h-12 text-orange-200" />
          </div>
        )}
        {/* Deal type badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-gray-700 shadow-sm">
            {getDealTypeLabel(analysis.extractedDealType)}
          </span>
        </div>
        {/* Converted badge */}
        {analysis.convertedToDealId && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-green-500/90 backdrop-blur-sm rounded-md text-xs font-medium text-white shadow-sm">
              Converted
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {analysis.extractedBrand || 'Unknown Brand'}
            </h3>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {formatCompensation(analysis.extractedCompensation)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(analysis.createdAt)}
              </span>
            </div>
          </div>
          {/* Mini score ring */}
          {analysis.complianceScore != null && analysis.complianceStatus && (
            <ComplianceScoreRing
              score={analysis.complianceScore}
              status={analysis.complianceStatus}
              size={48}
              strokeWidth={4}
              animated={false}
            />
          )}
        </div>

        {/* Red flags indicator */}
        {analysis.extractedRedFlags.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {analysis.extractedRedFlags.length} red flag{analysis.extractedRedFlags.length !== 1 ? 's' : ''} detected
          </div>
        )}

        {/* View details link */}
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
          View Details <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
}
