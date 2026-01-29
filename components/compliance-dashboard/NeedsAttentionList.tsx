'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, ChevronRight } from 'lucide-react';

interface AlertAthlete {
  id: string;
  name: string;
  sport: string;
  status: 'red' | 'yellow';
  topIssue: string;
  dealId: string;
  score: number;
}

interface NeedsAttentionListProps {
  redCount: number;
  yellowCount: number;
  athletes: AlertAthlete[];
  onViewAthlete: (athleteId: string) => void;
  onViewAll: () => void;
}

export function NeedsAttentionList({
  redCount,
  yellowCount,
  athletes,
  onViewAthlete,
  onViewAll
}: NeedsAttentionListProps) {
  const getStatusIcon = (status: 'red' | 'yellow') => {
    if (status === 'red') {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-amber-500" />;
  };

  const getStatusBadge = (status: 'red' | 'yellow') => {
    if (status === 'red') {
      return (
        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          RED
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
        YELLOW
      </span>
    );
  };

  return (
    <motion.div
      data-testid="needs-attention-list"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Needs Attention</h2>
            <p className="text-sm text-gray-500 mt-1">
              {redCount} critical • {yellowCount} warnings
            </p>
          </div>
          <div className="flex items-center gap-2">
            {redCount > 0 && (
              <span className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-full">
                <AlertTriangle className="w-4 h-4" />
                {redCount}
              </span>
            )}
            {yellowCount > 0 && (
              <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-full">
                <AlertCircle className="w-4 h-4" />
                {yellowCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {athletes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-gray-600 font-medium">All Clear!</p>
            <p className="text-sm text-gray-500 mt-1">No compliance issues detected</p>
          </div>
        ) : (
          athletes.map((athlete, index) => (
            <motion.button
              key={athlete.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onViewAthlete(athlete.id)}
              className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
            >
              {getStatusIcon(athlete.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{athlete.name}</span>
                  {getStatusBadge(athlete.status)}
                </div>
                <p className="text-sm text-gray-500 truncate">{athlete.topIssue}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-gray-900">{athlete.sport}</p>
                <p className="text-xs text-gray-500">Score: {athlete.score}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.button>
          ))
        )}
      </div>

      {/* Footer */}
      {athletes.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onViewAll}
            className="w-full py-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            View All Athletes →
          </button>
        </div>
      )}
    </motion.div>
  );
}
