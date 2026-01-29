'use client';

import { motion } from 'framer-motion';

interface ComplianceStatusBannerProps {
  status: 'green' | 'yellow' | 'red';
  activeDeals: number;
  totalEarnings: number;
  issueCount: number;
}

const statusConfig = {
  green: {
    bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
    icon: '✓',
    label: 'All Clear',
    description: 'Your deals are compliant',
  },
  yellow: {
    bg: 'bg-gradient-to-r from-yellow-500 to-amber-600',
    icon: '⚠',
    label: 'Review Required',
    description: 'Some deals need attention',
  },
  red: {
    bg: 'bg-gradient-to-r from-red-500 to-rose-600',
    icon: '✕',
    label: 'Issues Detected',
    description: 'Action required on your deals',
  },
};

export function ComplianceStatusBanner({
  status,
  activeDeals,
  totalEarnings,
  issueCount,
}: ComplianceStatusBannerProps) {
  const config = statusConfig[status];
  const formattedEarnings = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalEarnings);

  return (
    <motion.div
      data-testid="compliance-status-banner"
      className={`${config.bg} rounded-2xl p-6 text-white shadow-lg`}
      whileHover={{ scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-3xl">{config.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium text-white/80 uppercase tracking-wider">
                Compliance Status
              </h2>
            </div>
            <p className="text-2xl font-bold">
              {status === 'green' ? '🟢' : status === 'yellow' ? '🟡' : '🔴'} {config.label}
            </p>
            <p className="text-white/80 text-sm">{config.description}</p>
          </div>
        </div>

        <div className="flex gap-6 text-right">
          <div>
            <p className="text-white/70 text-xs uppercase tracking-wider">Active Deals</p>
            <p className="text-2xl font-bold">{activeDeals}</p>
          </div>
          <div>
            <p className="text-white/70 text-xs uppercase tracking-wider">Total Earnings</p>
            <p className="text-2xl font-bold">{formattedEarnings}</p>
          </div>
          {issueCount > 0 && (
            <div>
              <p className="text-white/70 text-xs uppercase tracking-wider">Issues</p>
              <p className="text-2xl font-bold text-red-200">{issueCount}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
