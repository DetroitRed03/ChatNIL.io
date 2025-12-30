/**
 * Agency Activity Feed Widget - Agency Dashboard
 *
 * Business-focused activity stream showing recent events.
 * Professional warm aesthetic with chronological organization.
 *
 * Features:
 * - Campaign launches, athlete signings, content submissions
 * - Payment milestones, contract completions
 * - Chronological timeline with timestamps
 * - Event-specific icons and colors
 * - Warm professional design
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Rocket,
  UserPlus,
  FileCheck,
  DollarSign,
  ImageIcon,
  TrendingUp,
  Award,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface ActivityEvent {
  id: string;
  type: 'campaign_created' | 'campaign_launch' | 'athlete_signed' | 'content_submitted' | 'payment_processed' | 'contract_signed' | 'milestone_reached';
  title: string;
  description: string;
  timestamp: Date;
  campaignName?: string;
  metadata?: {
    athleteName?: string;
    campaignName?: string;
    amount?: number;
  };
}

interface DashboardData {
  recentActivity: Array<{
    id: string;
    type: 'campaign_created';
    title: string;
    description: string;
    timestamp: string;
    campaignName: string;
  }>;
}

const eventTypeConfig = {
  campaign_created: {
    icon: Rocket,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    iconBg: 'bg-gradient-to-br from-orange-100 to-orange-200',
  },
  campaign_launch: {
    icon: Rocket,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    iconBg: 'bg-gradient-to-br from-orange-100 to-orange-200',
  },
  athlete_signed: {
    icon: UserPlus,
    color: 'text-green-600',
    bg: 'bg-green-50',
    iconBg: 'bg-gradient-to-br from-green-100 to-green-200',
  },
  content_submitted: {
    icon: ImageIcon,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    iconBg: 'bg-gradient-to-br from-amber-100 to-amber-200',
  },
  payment_processed: {
    icon: DollarSign,
    color: 'text-green-600',
    bg: 'bg-green-50',
    iconBg: 'bg-gradient-to-br from-green-100 to-green-200',
  },
  contract_signed: {
    icon: FileCheck,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200',
  },
  milestone_reached: {
    icon: Award,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    iconBg: 'bg-gradient-to-br from-purple-100 to-purple-200',
  },
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Map event types to navigation destinations
const getEventDestination = (event: ActivityEvent): string => {
  switch (event.type) {
    case 'athlete_signed':
      return event.metadata?.athleteName ? '/agency/athletes' : '/agency/campaigns';
    case 'campaign_created':
    case 'campaign_launch':
    case 'content_submitted':
    case 'payment_processed':
    case 'contract_signed':
    case 'milestone_reached':
    default:
      return '/agency/campaigns';
  }
};

export function AgencyActivityFeed() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, [user?.id]);

  // Transform API data into component format
  const events: ActivityEvent[] = data?.recentActivity.map(activity => ({
    id: activity.id,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    timestamp: new Date(activity.timestamp),
    campaignName: activity.campaignName,
    metadata: {
      campaignName: activity.campaignName,
    },
  })) || [];

  // Handle event card click
  const handleEventClick = (event: ActivityEvent) => {
    router.push(getEventDestination(event));
  };

  // Handle campaign tag click
  const handleCampaignTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push('/agency/campaigns');
  };

  // Handle "View full activity log" click
  const handleViewActivityLog = () => {
    router.push('/agency/campaigns');
  };

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
          <h3 className="font-bold text-xl text-white">Recent Activity</h3>
          <p className="text-white/85 text-sm font-medium mt-0.5">
            {isLoading ? 'Loading...' : `Latest updates across your campaigns`}
          </p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 font-semibold mb-2">Error loading activity</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 font-semibold">No recent activity</p>
            <p className="text-sm text-gray-500 mt-1">Activity will appear here as you work with campaigns</p>
          </div>
        ) : (
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-[21px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-200 via-amber-200 to-transparent" />

            {events.map((event, index) => {
            const config = eventTypeConfig[event.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative pl-14 pb-2"
              >
                {/* Timeline dot with icon */}
                <div className="absolute left-0 top-1">
                  <div className={cn('w-[42px] h-[42px] rounded-full flex items-center justify-center', config.iconBg)}>
                    <Icon className={cn('w-5 h-5', config.color)} />
                  </div>
                </div>

                {/* Event Content */}
                <div
                  onClick={() => handleEventClick(event)}
                  className={cn(
                    'group p-4 bg-white border-2 border-orange-100/40 rounded-xl hover:border-orange-200/60 hover:shadow-md hover:shadow-orange-100/40 transition-all cursor-pointer'
                  )}
                >
                  {/* Title and Timestamp */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-sm text-gray-900">{event.title}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold flex-shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimestamp(event.timestamp)}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 font-medium mb-2">{event.description}</p>

                  {/* Metadata Tags */}
                  {event.metadata && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {event.metadata.campaignName && (
                        <div
                          onClick={handleCampaignTagClick}
                          className="px-2.5 py-1 bg-orange-50 border border-orange-200/50 rounded-md text-xs font-bold text-orange-700 hover:bg-orange-100 transition-colors cursor-pointer"
                        >
                          {event.metadata.campaignName}
                        </div>
                      )}
                      {event.metadata.athleteName && (
                        <div className="px-2.5 py-1 bg-amber-50 border border-amber-200/50 rounded-md text-xs font-bold text-amber-700">
                          {event.metadata.athleteName}
                        </div>
                      )}
                      {event.metadata.amount && (
                        <div className="px-2.5 py-1 bg-green-50 border border-green-200/50 rounded-md text-xs font-bold text-green-700">
                          ${event.metadata.amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          </div>
        )}

        {/* Footer */}
        {!isLoading && !error && events.length > 0 && (
          <div className="mt-6 pt-4 border-t border-orange-100/40 text-center">
            <button
              onClick={handleViewActivityLog}
              className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              View full activity log →
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
