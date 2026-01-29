'use client';

import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Calendar, DollarSign } from 'lucide-react';

interface Deadline {
  id: string;
  athleteId: string;
  athleteName: string;
  thirdPartyName: string;
  dueInDays: number;
  compensation: number;
}

interface DeadlineTrackerProps {
  urgent: number;
  upcoming: number;
  deals: Deadline[];
  onViewDeal: (dealId: string, athleteId: string) => void;
}

export function DeadlineTracker({ urgent, upcoming, deals, onViewDeal }: DeadlineTrackerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDueBadge = (days: number) => {
    if (days <= 1) {
      return (
        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          {days === 0 ? 'TODAY' : 'TOMORROW'}
        </span>
      );
    }
    if (days <= 2) {
      return (
        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
          {days} DAYS
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
        {days} DAYS
      </span>
    );
  };

  return (
    <motion.div
      data-testid="deadline-tracker"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Reporting Deadlines</h2>
              <p className="text-sm text-gray-500">NCAA disclosure requirements</p>
            </div>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex gap-3 mt-4">
          {urgent > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">{urgent} urgent</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">{upcoming} upcoming</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {deals.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No upcoming deadlines</p>
          </div>
        ) : (
          deals.map((deal, index) => (
            <motion.button
              key={deal.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onViewDeal(deal.id, deal.athleteId)}
              className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 truncate">{deal.athleteName}</span>
                  {getDueBadge(deal.dueInDays)}
                </div>
                <p className="text-sm text-gray-500 truncate">{deal.thirdPartyName}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-gray-700">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">{formatCurrency(deal.compensation)}</span>
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  );
}
