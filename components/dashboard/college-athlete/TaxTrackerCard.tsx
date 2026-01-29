'use client';

import { motion } from 'framer-motion';
import { DollarSign, Calendar, AlertTriangle } from 'lucide-react';

interface TaxTrackerCardProps {
  ytdEarnings: number;
  estimatedTax: number;
  nextQuarterlyDue: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TaxTrackerCard({
  ytdEarnings,
  estimatedTax,
  nextQuarterlyDue,
}: TaxTrackerCardProps) {
  const w9Threshold = 600;
  const requiresW9 = ytdEarnings >= w9Threshold;

  return (
    <motion.div
      data-testid="tax-tracker-card"
      className="bg-white rounded-xl border border-gray-200 p-5 h-full"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Tax Tracker</h3>
          <p className="text-xs text-gray-500">2024 NIL Income</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* YTD Earnings */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">YTD Earnings</span>
          <span className="text-xl font-bold text-gray-900">
            {formatCurrency(ytdEarnings)}
          </span>
        </div>

        {/* Estimated Tax */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Est. Tax (~25%)</span>
          <span className="text-lg font-semibold text-amber-600">
            {formatCurrency(estimatedTax)}
          </span>
        </div>

        {/* Quarterly Due */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Next Quarterly Due</span>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {nextQuarterlyDue}
          </span>
        </div>

        {/* W9 Warning */}
        {requiresW9 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-medium">1099 Form Expected</p>
              <p className="text-amber-700">
                Earnings exceed $600 threshold. Keep records for tax filing.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
