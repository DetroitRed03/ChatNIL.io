/**
 * Budget Tracker Widget - Agency Dashboard
 *
 * Business-focused budget monitoring with visual indicators.
 * Professional warm aesthetic with data-driven focus.
 *
 * Features:
 * - Total budget vs spend visualization
 * - Campaign-by-campaign breakdown
 * - Budget utilization percentage
 * - Spend velocity indicator
 * - Warm professional design
 */

'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/Progress';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CampaignBudget {
  id: string;
  name: string;
  budget: number;
  spent: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface DashboardData {
  campaigns: Array<{
    id: string;
    name: string;
    budget: number;
    spent: number;
    status: string;
  }>;
  savedAthletes: { count: number };
  stats: {
    totalBudget: number;
    totalSpent: number;
    activeDeals: number;
    budgetUtilization: number;
  };
}

const statusConfig = {
  healthy: {
    label: 'On Track',
    color: 'text-green-700',
    bg: 'bg-green-50',
    progressColor: 'bg-green-500',
  },
  warning: {
    label: 'Monitor',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    progressColor: 'bg-amber-500',
  },
  critical: {
    label: 'Critical',
    color: 'text-red-700',
    bg: 'bg-red-50',
    progressColor: 'bg-red-500',
  },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BudgetTracker() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle campaign card click
  const handleCampaignClick = (campaignId: string) => {
    router.push(`/agency/campaigns/${campaignId}`);
  };

  useEffect(() => {
    async function fetchDashboard() {
      if (!user?.id) {
        // Don't set loading false - wait for user to be available
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/agency/dashboard', {
          credentials: 'include',
          headers: {
            'X-User-ID': user.id,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, [user?.id]);

  // Calculate campaign statuses
  const campaigns: CampaignBudget[] = (data?.campaigns.map(c => {
    const utilization = (c.spent / c.budget) * 100;
    const status: 'healthy' | 'warning' | 'critical' =
      utilization > 90 ? 'critical' :
      utilization > 75 ? 'warning' :
      'healthy';

    return {
      id: c.id,
      name: c.name,
      budget: c.budget,
      spent: c.spent,
      status,
    };
  })) || [];

  const TOTAL_BUDGET = data?.stats.totalBudget || 0;
  const TOTAL_SPENT = data?.stats.totalSpent || 0;
  const TOTAL_REMAINING = TOTAL_BUDGET - TOTAL_SPENT;
  const UTILIZATION_PCT = data?.stats.budgetUtilization || 0;

  return (
    <Card className="bg-gradient-to-br from-orange-50/15 via-white to-amber-50/10 border border-orange-100/30 overflow-hidden shadow-sm shadow-orange-100/20">
      {/* Professional Header */}
      <div className="relative bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 px-6 py-5 overflow-hidden">
        {/* Subtle shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />

        {/* Header Content */}
        <div className="relative">
          <h3 className="font-bold text-xl text-white">Budget Tracker</h3>
          <p className="text-white/85 text-sm font-medium mt-0.5">Overall budget utilization</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            Failed to load budget data: {error}
          </div>
        )}

        {/* Data Display */}
        {!isLoading && !error && data && (<>
        {/* Total Budget Overview */}
        <div className="mb-6 p-4 bg-gradient-to-br from-orange-50/40 to-amber-50/30 border border-orange-100/50 rounded-xl">
          <div className="flex justify-between items-center gap-2 mb-4">
            {/* Total Budget */}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Budget</div>
              <div className="text-sm font-bold text-gray-900 tabular-nums truncate">{formatCurrency(TOTAL_BUDGET)}</div>
            </div>

            {/* Spent */}
            <div className="flex-1 min-w-0 text-center px-2 border-x border-orange-200/50">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Spent</div>
              <div className="text-sm font-bold text-orange-600 tabular-nums truncate">{formatCurrency(TOTAL_SPENT)}</div>
            </div>

            {/* Remaining */}
            <div className="flex-1 min-w-0 text-right">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Remaining</div>
              <div className="text-sm font-bold text-green-600 tabular-nums truncate">{formatCurrency(TOTAL_REMAINING)}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <Progress value={UTILIZATION_PCT} className="h-3 bg-orange-100">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  UTILIZATION_PCT > 90 ? 'bg-red-500' : UTILIZATION_PCT > 75 ? 'bg-amber-500' : 'bg-green-500'
                )}
                style={{ width: `${UTILIZATION_PCT}%` }}
              />
            </Progress>
          </div>

          {/* Utilization Percentage */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700">{UTILIZATION_PCT.toFixed(1)}% Utilized</span>
            {UTILIZATION_PCT > 90 ? (
              <div className="flex items-center gap-1.5 text-sm font-bold text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span>High Utilization</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm font-bold text-green-700">
                <TrendingUp className="w-4 h-4" />
                <span>On Track</span>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Breakdown */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-gray-700 mb-3">Campaign Breakdown</h4>
          {campaigns.map((campaign, index) => {
            const config = statusConfig[campaign.status];
            const utilization = (campaign.spent / campaign.budget) * 100;

            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleCampaignClick(campaign.id)}
                className="p-4 bg-white border border-orange-100/40 rounded-lg hover:shadow-md hover:shadow-orange-100/30 transition-all cursor-pointer"
              >
                {/* Campaign Name and Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-bold text-sm text-gray-900 mb-1">{campaign.name}</h5>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-600 font-semibold">
                        {formatCurrency(campaign.spent)} of {formatCurrency(campaign.budget)}
                      </span>
                      <span className={cn('font-bold', config.color)}>({utilization.toFixed(0)}%)</span>
                    </div>
                  </div>
                  <div className={cn('px-2.5 py-1 rounded-full text-xs font-bold', config.bg, config.color)}>
                    {config.label}
                  </div>
                </div>

                {/* Progress Bar */}
                <Progress value={utilization} className="h-2 bg-gray-100">
                  <div
                    className={cn('h-full rounded-full transition-all', config.progressColor)}
                    style={{ width: `${utilization}%` }}
                  />
                </Progress>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/30 border border-green-100/40 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">
                Budget Health: {UTILIZATION_PCT > 90 ? 'Critical' : UTILIZATION_PCT > 75 ? 'Warning' : 'Good'}
              </h4>
              <p className="text-sm text-gray-700">
                {formatCurrency(TOTAL_REMAINING)} remaining across all campaigns.
                {campaigns.filter(c => c.status !== 'healthy').length > 0 &&
                  ` ${campaigns.filter(c => c.status !== 'healthy').length} campaign${campaigns.filter(c => c.status !== 'healthy').length !== 1 ? 's' : ''} need${campaigns.filter(c => c.status !== 'healthy').length === 1 ? 's' : ''} monitoring.`}
              </p>
            </div>
          </div>
        </motion.div>
        </>)}
      </div>
    </Card>
  );
}
