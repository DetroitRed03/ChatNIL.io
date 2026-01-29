'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Users } from 'lucide-react';

interface ComplianceStatsProps {
  green: number;
  yellow: number;
  red: number;
  noDeals: number;
  greenPercent: number;
  yellowPercent: number;
  redPercent: number;
}

export function ComplianceStats({
  green,
  yellow,
  red,
  noDeals,
  greenPercent,
  yellowPercent,
  redPercent
}: ComplianceStatsProps) {
  const total = green + yellow + red + noDeals;

  return (
    <motion.div
      data-testid="compliance-stats"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Overview</h2>

      {/* Total Athletes */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
          <Users className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-sm text-gray-500">Total Athletes</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="space-y-4">
        {/* Green */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Compliant</span>
              <span className="text-sm font-semibold text-green-600">{green} ({greenPercent}%)</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${greenPercent}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-green-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Yellow */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Needs Review</span>
              <span className="text-sm font-semibold text-amber-600">{yellow} ({yellowPercent}%)</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${yellowPercent}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="h-full bg-amber-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Red */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Critical Issues</span>
              <span className="text-sm font-semibold text-red-600">{red} ({redPercent}%)</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${redPercent}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full bg-red-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* No Deals */}
        {noDeals > 0 && (
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <span className="text-sm text-gray-500">{noDeals} athletes with no deals</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
