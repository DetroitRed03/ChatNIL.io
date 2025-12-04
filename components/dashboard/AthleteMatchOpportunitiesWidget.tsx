/**
 * Athlete Match Opportunities Widget
 *
 * Dashboard widget that fetches and displays campaign matches for an athlete
 * using the new /api/matches/athlete/[id] endpoint.
 *
 * Features:
 * - Real API integration with the athlete matches endpoint
 * - Match tier visualization (excellent/good/fair)
 * - Recommended offer ranges
 * - Match strengths display
 * - Loading skeletons and error states
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Target,
  TrendingUp,
  DollarSign,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MatchOpportunity {
  campaign_id: string;
  campaign_name: string;
  campaign_description?: string;
  campaign_type?: string;
  brand_name: string;
  match_score: number;
  match_tier: 'excellent' | 'good' | 'fair' | 'low';
  confidence: number;
  recommended_offer_low: number;
  recommended_offer_high: number;
  strengths: string[];
  concerns: string[];
  status: string;
  created_at?: string;
}

interface MatchSummary {
  excellent: number;
  good: number;
  fair: number;
  avgScore: number;
}

interface AthleteMatchOpportunitiesWidgetProps {
  className?: string;
  limit?: number;
  showHeader?: boolean;
}

function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  }
  return `$${dollars.toLocaleString()}`;
}

export function AthleteMatchOpportunitiesWidget({
  className,
  limit = 5,
  showHeader = true,
}: AthleteMatchOpportunitiesWidgetProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchOpportunity[]>([]);
  const [summary, setSummary] = useState<MatchSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMatches = async () => {
    if (!user?.id) return;

    try {
      setError(null);
      // Use the working matchmaking API endpoint
      const response = await fetch(
        `/api/matchmaking/athlete/campaigns?userId=${user.id}&limit=${limit}&minScore=30`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError('Athlete profile not found');
        } else if (response.status === 403) {
          setError('Only athletes can view match opportunities');
        } else {
          setError('Failed to load match opportunities');
        }
        return;
      }

      const data = await response.json();

      // Transform the matchmaking API response to expected format
      const transformedMatches = (data.campaigns || []).map((campaign: any) => ({
        campaign_id: campaign.campaign_id,
        campaign_name: campaign.campaign_name,
        campaign_description: campaign.campaign_description,
        campaign_type: campaign.campaign_type,
        brand_name: campaign.brand_name,
        match_score: campaign.match_score,
        match_tier: campaign.match_score >= 80 ? 'excellent' :
                    campaign.match_score >= 60 ? 'good' :
                    campaign.match_score >= 40 ? 'fair' : 'low',
        confidence: campaign.confidence_level === 'high' ? 100 :
                    campaign.confidence_level === 'medium' ? 70 : 40,
        recommended_offer_low: campaign.recommended_offer_low || 0,
        recommended_offer_high: campaign.recommended_offer_high || 0,
        strengths: campaign.strengths || [],
        concerns: campaign.concerns || [],
        status: 'pending',
      }));

      setMatches(transformedMatches);
      setSummary(data.summary ? {
        excellent: transformedMatches.filter((m: any) => m.match_tier === 'excellent').length,
        good: transformedMatches.filter((m: any) => m.match_tier === 'good').length,
        fair: transformedMatches.filter((m: any) => m.match_tier === 'fair').length,
        avgScore: data.summary.avgMatchScore || 0,
      } : null);
    } catch (err) {
      console.error('Error fetching athlete matches:', err);
      setError('Failed to load opportunities. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id && user.role === 'athlete') {
      fetchMatches();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMatches();
  };

  const handleMatchClick = (match: MatchOpportunity) => {
    router.push(`/opportunities?campaign=${match.campaign_id}`);
  };

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'excellent':
        return {
          gradient: 'from-green-500 to-emerald-500',
          bg: 'bg-green-50',
          border: 'border-green-300',
          text: 'text-green-700',
          label: 'Excellent Match',
          glow: 'shadow-green-300/50',
        };
      case 'good':
        return {
          gradient: 'from-orange-500 to-amber-500',
          bg: 'bg-orange-50',
          border: 'border-orange-300',
          text: 'text-orange-700',
          label: 'Good Match',
          glow: 'shadow-orange-300/50',
        };
      case 'fair':
        return {
          gradient: 'from-blue-500 to-cyan-500',
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          text: 'text-blue-700',
          label: 'Fair Match',
          glow: 'shadow-blue-300/50',
        };
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          label: 'Potential',
          glow: 'shadow-gray-300/50',
        };
    }
  };

  // Don't show for non-athletes
  if (user && user.role !== 'athlete') {
    return null;
  }

  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden border border-orange-100/40', className)}>
        {showHeader && (
          <div className="px-6 py-4 border-b border-orange-100/30">
            <Skeleton className="h-6 w-48" />
          </div>
        )}
        <div className="p-6 space-y-4">
          {[...Array(limit)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('overflow-hidden border border-orange-100/40', className)}>
        {showHeader && (
          <div className="px-6 py-4 border-b border-orange-100/30">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Match Opportunities
            </h2>
          </div>
        )}
        <div className="p-12">
          <EmptyState
            icon={AlertCircle}
            title="Unable to Load Matches"
            description={error}
          />
          <div className="text-center mt-4">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className={cn('overflow-hidden border border-orange-100/40', className)}>
        {showHeader && (
          <div className="px-6 py-4 border-b border-orange-100/30">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Match Opportunities
            </h2>
          </div>
        )}
        <div className="p-12">
          <EmptyState
            icon={Target}
            title="No Matches Yet"
            description="Complete your profile and add social media stats to unlock campaign opportunities matched to you!"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'overflow-hidden shadow-sm shadow-orange-100/30 bg-gradient-to-br from-orange-50/20 via-white to-amber-50/15 border border-orange-100/40',
        className
      )}
    >
      {/* Header */}
      {showHeader && (
        <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 px-6 py-5 overflow-hidden">
          {/* Animated shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />

          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Your Top Matches
              </h3>
              <p className="text-white/90 text-sm font-medium mt-1">
                Campaigns matched to your profile
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
                title="Refresh matches"
              >
                <RefreshCw
                  className={cn('h-4 w-4 text-white', isRefreshing && 'animate-spin')}
                />
              </button>

              {/* Summary Stats */}
              {summary && (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                    <span className="text-white font-bold">{matches.length}</span>
                  </div>
                  {summary.avgScore > 0 && (
                    <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-white" />
                      <span className="text-white font-bold">{summary.avgScore}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tier Summary Pills */}
          {summary && (summary.excellent > 0 || summary.good > 0) && (
            <div className="relative flex items-center gap-2 mt-3">
              {summary.excellent > 0 && (
                <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-500/30 text-white">
                  {summary.excellent} Excellent
                </span>
              )}
              {summary.good > 0 && (
                <span className="px-2 py-1 text-xs font-bold rounded-full bg-amber-500/30 text-white">
                  {summary.good} Good
                </span>
              )}
              {summary.fair > 0 && (
                <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-500/30 text-white">
                  {summary.fair} Fair
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Matches List */}
      <div className="divide-y divide-orange-100/30">
        {matches.map((match, index) => {
          const tierConfig = getTierConfig(match.match_tier);
          const isTopMatch = match.match_score >= 80;

          return (
            <motion.div
              key={match.campaign_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              whileHover={{ scale: 1.01, x: 4 }}
              onClick={() => handleMatchClick(match)}
              className={cn(
                'p-5 cursor-pointer transition-all',
                isTopMatch
                  ? `bg-gradient-to-r ${tierConfig.bg} ${tierConfig.border} border-l-4 shadow-md ${tierConfig.glow}`
                  : 'hover:bg-orange-50/30'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Match Score */}
                <div
                  className={cn(
                    'flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center bg-gradient-to-br shadow-lg',
                    tierConfig.gradient,
                    isTopMatch && 'ring-2 ring-offset-2 ring-green-300'
                  )}
                >
                  <span className="text-white font-extrabold text-xl">
                    {match.match_score}%
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={cn(
                        'text-xs font-bold px-2.5 py-1 rounded-full text-white bg-gradient-to-r',
                        tierConfig.gradient
                      )}
                    >
                      {tierConfig.label}
                    </span>
                    {match.campaign_type && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {match.campaign_type}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-lg text-gray-900 truncate">
                    {match.campaign_name}
                  </h4>

                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{match.brand_name}</span>
                  </div>

                  {/* Offer Range */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-bold text-yellow-700">
                        {formatCurrency(match.recommended_offer_low)} -{' '}
                        {formatCurrency(match.recommended_offer_high)}
                      </span>
                    </div>
                  </div>

                  {/* Strengths */}
                  {match.strengths && match.strengths.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {match.strengths.slice(0, 3).map((strength, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full"
                        >
                          ✓ {strength}
                        </span>
                      ))}
                      {match.strengths.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{match.strengths.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-2" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-orange-100/30 px-6 py-4 bg-gradient-to-br from-orange-50/20 to-amber-50/15">
        <button
          onClick={() => router.push('/opportunities')}
          className="w-full py-3 text-base font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          View All Opportunities →
        </button>
      </div>
    </Card>
  );
}

export default AthleteMatchOpportunitiesWidget;
