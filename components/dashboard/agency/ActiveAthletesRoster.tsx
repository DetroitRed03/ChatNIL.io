/**
 * Active Athletes Roster Widget - Agency Dashboard
 *
 * Business-focused table showing athletes under management with performance metrics.
 * Professional warm aesthetic with data-driven focus.
 *
 * Features:
 * - Athlete name, sport, school
 * - Key metrics: Impressions, engagement, spend
 * - Performance indicators (on target, needs attention)
 * - Quick action buttons (Message, View Profile)
 * - Warm professional design
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageSquare, ExternalLink, TrendingUp, AlertCircle, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface Athlete {
  id: string;
  username?: string;
  name: string;
  sport: string;
  school: string;
  position?: string;
  avatar?: string;
  followers: number;
  engagement: number;
  estimatedFmv?: number;
  status: 'excellent' | 'good' | 'needs-attention';
}

interface DashboardData {
  savedAthletes: {
    count: number;
    athletes: Array<{
      id: string;
      username?: string;
      name: string;
      sport: string;
      school: string;
      position?: string;
      estimatedFmv?: number;
      followers: number;
      engagement: number;
    }>;
  };
}

const statusConfig = {
  excellent: {
    label: 'On Target',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: TrendingUp,
  },
  good: {
    label: 'Good',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: TrendingUp,
  },
  'needs-attention': {
    label: 'Needs Attention',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: AlertCircle,
  },
};

// Calculate status based on engagement and followers
function calculateAthleteStatus(followers: number, engagement: number): 'excellent' | 'good' | 'needs-attention' {
  if (followers >= 100000 && engagement >= 5) return 'excellent';
  if (followers >= 50000 && engagement >= 4) return 'excellent';
  if (followers >= 20000 || engagement >= 3) return 'good';
  return 'needs-attention';
}

// Format numbers for display
function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${Math.floor(count / 1000)}K`;
  return count.toString();
}

export function ActiveAthletesRoster() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageLoading, setMessageLoading] = useState<string | null>(null);

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
  const athletes: Athlete[] = data?.savedAthletes.athletes.map(athlete => ({
    id: athlete.id,
    username: athlete.username,
    name: athlete.name,
    sport: athlete.sport,
    school: athlete.school,
    position: athlete.position,
    avatar: undefined,
    followers: athlete.followers,
    engagement: athlete.engagement,
    estimatedFmv: athlete.estimatedFmv,
    status: calculateAthleteStatus(athlete.followers, athlete.engagement),
  })) || [];

  const athleteCount = data?.savedAthletes.count || 0;

  // Handle row click - navigate to athlete profile using username (preferred) or id fallback
  const handleRowClick = (athlete: Athlete) => {
    const profileIdentifier = athlete.username || athlete.id;
    router.push(`/athletes/${profileIdentifier}`);
  };

  // Handle message button - create thread and navigate to messages
  const handleMessage = async (athleteId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setMessageLoading(athleteId);
    try {
      await fetch('/api/agency/messages/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athlete_user_id: athleteId,
          message_text: "Hi! I'd like to discuss a potential partnership opportunity with you."
        })
      });
      router.push('/agencies/messages');
    } catch (error) {
      console.error('Error creating message thread:', error);
    } finally {
      setMessageLoading(null);
    }
  };

  // Handle view profile button using username (preferred) or id fallback
  const handleViewProfile = (athlete: Athlete, e: React.MouseEvent) => {
    e.stopPropagation();
    const profileIdentifier = athlete.username || athlete.id;
    router.push(`/athletes/${profileIdentifier}`);
  };

  // Handle export report - generate CSV download
  const handleExportReport = () => {
    if (athletes.length === 0) return;

    const csvContent = [
      ['Name', 'Sport', 'School', 'Followers', 'Engagement', 'Est. FMV', 'Status'],
      ...athletes.map(a => [
        a.name,
        a.sport,
        a.school,
        a.followers.toString(),
        `${a.engagement.toFixed(1)}%`,
        a.estimatedFmv ? `$${a.estimatedFmv}` : 'N/A',
        a.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `athlete-roster-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xl text-white">Active Athletes</h3>
            <p className="text-white/85 text-sm font-medium mt-0.5">
              {isLoading ? '...' : `${athleteCount} athletes under management`}
            </p>
          </div>
          <a
            href="/agencies/athletes"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 rounded-lg text-white font-semibold text-sm transition-all inline-block"
          >
            View All
          </a>
        </div>
      </div>

      {/* Athletes Table */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 font-semibold mb-2">Error loading athletes</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : athletes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 font-semibold">No saved athletes yet</p>
            <p className="text-sm text-gray-500 mt-1">Start discovering athletes to add to your roster</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-orange-100/40">
                    <th className="text-left pb-3 px-2 text-sm font-bold text-gray-700">Athlete</th>
                    <th className="text-left pb-3 px-2 text-sm font-bold text-gray-700">Sport</th>
                    <th className="text-right pb-3 px-2 text-sm font-bold text-gray-700">Followers</th>
                    <th className="text-right pb-3 px-2 text-sm font-bold text-gray-700">Engagement</th>
                    <th className="text-right pb-3 px-2 text-sm font-bold text-gray-700">Est. FMV</th>
                    <th className="text-center pb-3 px-2 text-sm font-bold text-gray-700">Status</th>
                    <th className="text-right pb-3 px-2 text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {athletes.map((athlete, index) => {
                const config = statusConfig[athlete.status];
                const StatusIcon = config.icon;

                return (
                  <motion.tr
                    key={athlete.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => handleRowClick(athlete)}
                    className="border-b border-orange-50/50 hover:bg-orange-50/30 transition-colors group cursor-pointer"
                  >
                    {/* Athlete Info */}
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={athlete.avatar}
                          alt={athlete.name}
                          size="md"
                          fallback={athlete.name.substring(0, 2)}
                        />
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{athlete.name}</div>
                          <div className="text-xs text-gray-600 font-medium">{athlete.school}</div>
                        </div>
                      </div>
                    </td>

                    {/* Sport */}
                    <td className="py-4 px-2">
                      <div className="inline-flex px-3 py-1 bg-orange-50 border border-orange-200/50 rounded-full">
                        <span className="text-xs font-bold text-orange-700">{athlete.sport}</span>
                      </div>
                    </td>

                    {/* Followers */}
                    <td className="py-4 px-2 text-right">
                      <span className="font-bold text-gray-900">{formatFollowers(athlete.followers)}</span>
                    </td>

                    {/* Engagement */}
                    <td className="py-4 px-2 text-right">
                      <span className="font-bold text-gray-900">{athlete.engagement.toFixed(1)}%</span>
                    </td>

                    {/* Est. FMV */}
                    <td className="py-4 px-2 text-right">
                      <span className="font-bold text-gray-900">
                        {athlete.estimatedFmv ? `$${(athlete.estimatedFmv / 1000).toFixed(0)}K` : 'N/A'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-2">
                      <div className="flex justify-center">
                        <div
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border',
                            config.bg,
                            config.border
                          )}
                        >
                          <StatusIcon className={cn('w-3.5 h-3.5', config.color)} />
                          <span className={cn('text-xs font-bold', config.color)}>{config.label}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-2">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => handleMessage(athlete.id, e)}
                          disabled={messageLoading === athlete.id}
                          className="p-2 hover:bg-orange-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          title="Message"
                        >
                          <MessageSquare className={cn("w-4 h-4 text-orange-600", messageLoading === athlete.id && "animate-pulse")} />
                        </button>
                        <button
                          onClick={(e) => handleViewProfile(athlete, e)}
                          className="p-2 hover:bg-orange-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="View Profile"
                        >
                          <ExternalLink className="w-4 h-4 text-orange-600" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

            {/* Footer Summary */}
            <div className="mt-4 pt-4 border-t border-orange-100/40 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-semibold text-gray-700">
                    {athletes.filter((a) => a.status === 'excellent').length} On Target
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-semibold text-gray-700">
                    {athletes.filter((a) => a.status === 'needs-attention').length} Need Attention
                  </span>
                </div>
              </div>
              <button
                onClick={handleExportReport}
                className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
