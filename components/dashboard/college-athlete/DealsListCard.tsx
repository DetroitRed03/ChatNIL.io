'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Deal {
  id: string;
  brandName: string;
  dealType: string;
  compensation: number;
  complianceScore: number;
  status: 'active' | 'completed' | 'pending' | 'review';
  issues?: string[];
}

interface DealsListCardProps {
  deals: Deal[];
  onDealClick: (dealId: string) => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

function getStatusBadge(status: Deal['status']) {
  const styles = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    pending: 'bg-blue-100 text-blue-700',
    review: 'bg-yellow-100 text-yellow-700',
  };
  const labels = {
    active: 'Active',
    completed: 'Completed',
    pending: 'Pending',
    review: 'Review',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DealsListCard({ deals, onDealClick }: DealsListCardProps) {
  if (deals.length === 0) {
    return (
      <div data-testid="deals-list-card" className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-3">📋</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Deals Yet</h3>
        <p className="text-gray-500 text-sm">
          Validate your first deal to see it here
        </p>
      </div>
    );
  }

  return (
    <div data-testid="deals-list-card" className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-xl">📋</span>
          Your Deals
        </h3>
        <Link
          href="/deals"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          View All →
        </Link>
      </div>
      <div className="divide-y divide-gray-100">
        {deals.map((deal, index) => (
          <motion.button
            key={deal.id}
            onClick={() => onDealClick(deal.id)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center gap-4">
              {/* Score indicator dot */}
              <div className={`w-3 h-3 rounded-full ${getScoreColor(deal.complianceScore)}`} />

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{deal.brandName}</span>
                  {deal.status === 'review' && (
                    <span className="text-yellow-600">⚠️</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 capitalize">
                  {deal.dealType.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Compensation */}
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(deal.compensation)}</p>
              </div>

              {/* Compliance Score */}
              <div className="text-right min-w-[60px]">
                <p className={`font-bold ${getScoreTextColor(deal.complianceScore)}`}>
                  {deal.complianceScore}/100
                </p>
              </div>

              {/* Status Badge */}
              <div className="min-w-[80px]">
                {getStatusBadge(deal.status)}
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
