'use client';

import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, XCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Deal {
  id: string;
  brandName: string;
  compensationAmount: number | null;
  status: string;
  complianceStatus: string | null;
  createdAt: string;
}

interface DealHistoryProps {
  deals: Deal[];
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Approved' },
  active: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Active' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Completed' },
  pending: { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Pending' },
  pending_review: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', label: 'In Review' },
  under_review: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', label: 'In Review' },
  draft: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Draft' },
  rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Rejected' },
  denied: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Denied' },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || { icon: AlertTriangle, color: 'text-gray-500', bg: 'bg-gray-50', label: status };
}

export default function DealHistory({ deals }: DealHistoryProps) {
  if (deals.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
          <FileText className="w-5 h-5 text-orange-500" />
          Deal History
        </h2>
        <Link
          href="/deals"
          className="text-sm text-orange-500 hover:text-orange-600 flex items-center font-medium"
        >
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="text-center py-3 mb-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
        <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
        <p className="text-sm text-gray-500">Deal{deals.length !== 1 ? 's' : ''} Submitted</p>
      </div>

      <div className="space-y-2">
        {deals.slice(0, 5).map((deal, i) => {
          const config = getStatusConfig(deal.status);
          const Icon = config.icon;

          return (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-full ${config.bg}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{deal.brandName}</p>
                  {deal.compensationAmount != null && (
                    <p className="text-xs text-gray-500">
                      ${deal.compensationAmount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <span className={`text-xs font-medium ${config.color} whitespace-nowrap`}>
                {config.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
