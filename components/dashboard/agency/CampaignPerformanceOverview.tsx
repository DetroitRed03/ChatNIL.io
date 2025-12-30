'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown, Eye, Heart, DollarSign, Users, Target } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface MetricData {
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  icon: any;
  color: 'orange' | 'amber' | 'yellow' | 'green';
}

interface DashboardData {
  campaigns: any[];
  savedAthletes: { count: number };
  stats: {
    totalBudget: number;
    totalSpent: number;
    activeDeals: number;
    budgetUtilization: number;
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const colorConfig = {
  orange: {
    bg: 'bg-orange-50/80',
    border: 'border-orange-200/40',
    iconBg: 'bg-gradient-to-br from-orange-100 to-orange-200/80',
    iconColor: 'text-orange-600',
    hover: 'hover:border-orange-300/60 hover:shadow-orange-200/40',
  },
  amber: {
    bg: 'bg-amber-50/80',
    border: 'border-amber-200/40',
    iconBg: 'bg-gradient-to-br from-amber-100 to-amber-200/80',
    iconColor: 'text-amber-600',
    hover: 'hover:border-amber-300/60 hover:shadow-amber-200/40',
  },
  yellow: {
    bg: 'bg-yellow-50/80',
    border: 'border-yellow-200/40',
    iconBg: 'bg-gradient-to-br from-yellow-100 to-yellow-200/80',
    iconColor: 'text-yellow-600',
    hover: 'hover:border-yellow-300/60 hover:shadow-yellow-200/40',
  },
  green: {
    bg: 'bg-green-50/80',
    border: 'border-green-200/40',
    iconBg: 'bg-gradient-to-br from-green-100 to-green-200/80',
    iconColor: 'text-green-600',
    hover: 'hover:border-green-300/60 hover:shadow-green-200/40',
  },
};

function buildMetrics(data: DashboardData | null): MetricData[] {
  if (!data) return [];

  return [
    {
      label: 'Total Budget',
      value: formatCurrency(data.stats.totalBudget),
      icon: DollarSign,
      color: 'orange',
    },
    {
      label: 'Total Spend',
      value: formatCurrency(data.stats.totalSpent),
      icon: DollarSign,
      color: 'green',
    },
    {
      label: 'Budget Utilization',
      value: `${data.stats.budgetUtilization.toFixed(1)}%`,
      icon: Target,
      color: 'amber',
    },
    {
      label: 'Saved Athletes',
      value: data.savedAthletes.count,
      icon: Users,
      color: 'yellow',
    },
    {
      label: 'Active Campaigns',
      value: data.stats.activeDeals,
      icon: Target,
      color: 'orange',
    },
  ];
}

export function CampaignPerformanceOverview() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle metric card click
  const handleMetricClick = () => {
    router.push('/agency/campaigns');
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

  const metrics = buildMetrics(data);

  return (
    <Card className="bg-gradient-to-br from-orange-50/15 via-white to-amber-50/10 border border-orange-100/30 overflow-hidden shadow-sm shadow-orange-100/20">
      <div className="relative bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 px-6 py-5 overflow-hidden">
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

        <div className="relative">
          <h3 className="font-bold text-xl text-white">Campaign Performance</h3>
          <p className="text-white/85 text-sm font-medium mt-0.5">
            Real-time metrics across all campaigns
          </p>
        </div>
      </div>

      <div className="p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            Failed to load dashboard data: {error}
          </div>
        )}

        {!isLoading && !error && data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                const config = colorConfig[metric.color];
                const TrendIcon = metric.trend?.direction === 'up' ? TrendingUp : TrendingDown;

                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    onClick={handleMetricClick}
                    className={cn(
                      'relative bg-white border-2 rounded-xl p-4 transition-all cursor-pointer shadow-sm',
                      config.border,
                      config.hover
                    )}
                  >
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', config.iconBg)}>
                      <Icon className={cn('w-5 h-5', config.iconColor)} />
                    </div>

                    <div className="mb-1">
                      <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
                    </div>

                    <div className="text-sm font-semibold text-gray-600 mb-2">{metric.label}</div>

                    {metric.trend && (
                      <div
                        className={cn(
                          'flex items-center gap-1 text-xs font-bold',
                          metric.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        <TrendIcon className="w-3.5 h-3.5" />
                        <span>{metric.trend.value}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 p-4 bg-gradient-to-r from-orange-50/50 to-amber-50/30 border border-orange-100/40 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 mb-1">
                    {data.stats.budgetUtilization < 50 ? 'Good Budget Health' :
                     data.stats.budgetUtilization < 75 ? 'Moderate Spending' :
                     'High Budget Utilization'}
                  </h4>
                  <p className="text-sm text-gray-700">
                    {data.stats.activeDeals} active campaign{data.stats.activeDeals !== 1 ? 's' : ''} with {formatCurrency(data.stats.totalBudget - data.stats.totalSpent)} remaining budget.
                    {data.savedAthletes.count > 0 && ` ${data.savedAthletes.count} athlete${data.savedAthletes.count !== 1 ? 's' : ''} saved for review.`}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </Card>
  );
}
