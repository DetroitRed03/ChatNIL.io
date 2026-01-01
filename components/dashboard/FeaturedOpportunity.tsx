/**
 * Featured Opportunity Component
 *
 * Hero card showing the single best-matched campaign opportunity.
 * Designed for maximum visual impact and clear CTA.
 *
 * Features:
 * - Single prominent opportunity card
 * - Match score visualization
 * - Offer range display
 * - Key strengths
 * - Clear action button
 * - Link to view all opportunities
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  DollarSign,
  ChevronRight,
  Building2,
  Clock,
  TrendingUp,
  Target,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
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
  deadline?: string;
}

interface FeaturedOpportunityProps {
  className?: string;
}

function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  }
  return `$${dollars.toLocaleString()}`;
}

export function FeaturedOpportunity({ className }: FeaturedOpportunityProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<MatchOpportunity | null>(null);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedOpportunity = async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const response = await fetch(
        `/api/matchmaking/athlete/campaigns?userId=${user.id}&limit=5&minScore=30`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError('Complete your profile to see matches');
        } else {
          setError('Unable to load opportunities');
        }
        return;
      }

      const data = await response.json();
      const campaigns = data.campaigns || [];

      if (campaigns.length > 0) {
        // Get the highest-scoring match
        const best = campaigns[0];
        setOpportunity({
          campaign_id: best.campaign_id,
          campaign_name: best.campaign_name,
          campaign_description: best.campaign_description,
          campaign_type: best.campaign_type,
          brand_name: best.brand_name,
          match_score: best.match_score,
          match_tier: best.match_score >= 80 ? 'excellent' :
                      best.match_score >= 60 ? 'good' :
                      best.match_score >= 40 ? 'fair' : 'low',
          confidence: best.confidence_level === 'high' ? 100 :
                      best.confidence_level === 'medium' ? 70 : 40,
          recommended_offer_low: best.recommended_offer_low || 0,
          recommended_offer_high: best.recommended_offer_high || 0,
          strengths: best.strengths || [],
          concerns: best.concerns || [],
        });
        setTotalMatches(campaigns.length);
      }
    } catch (err) {
      console.error('Error fetching featured opportunity:', err);
      setError('Failed to load opportunities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && user.role === 'athlete') {
      fetchFeaturedOpportunity();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Don't render for non-athletes
  if (user && user.role !== 'athlete') {
    return null;
  }

  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <div className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </Card>
    );
  }

  if (error || !opportunity) {
    return (
      <Card className={cn('overflow-hidden bg-gradient-to-br from-gray-50 to-white', className)}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error || 'No Matches Yet'}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Complete your profile to get matched with brand opportunities.
          </p>
          <button
            onClick={() => router.push('/profile')}
            className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
          >
            Complete Profile
          </button>
        </div>
      </Card>
    );
  }

  const tierConfig = {
    excellent: {
      gradient: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      label: 'Excellent Match',
    },
    good: {
      gradient: 'from-orange-500 to-amber-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      label: 'Good Match',
    },
    fair: {
      gradient: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      label: 'Fair Match',
    },
    low: {
      gradient: 'from-gray-500 to-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      label: 'Potential',
    },
  };

  const config = tierConfig[opportunity.match_tier];

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900">Featured Opportunity</h3>
        </div>
        {totalMatches > 1 && (
          <span className="text-sm text-gray-500">
            +{totalMatches - 1} more matches
          </span>
        )}
      </div>

      {/* Featured Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => router.push(`/opportunities?campaign=${opportunity.campaign_id}`)}
        className="p-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex gap-5">
          {/* Match Score Circle */}
          <div className="flex-shrink-0">
            <div
              className={cn(
                'w-20 h-20 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br shadow-lg',
                config.gradient
              )}
            >
              <span className="text-white font-extrabold text-2xl">
                {opportunity.match_score}%
              </span>
              <span className="text-white/80 text-xs font-medium">match</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Tier Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-full text-white bg-gradient-to-r',
                  config.gradient
                )}
              >
                {config.label}
              </span>
              {opportunity.campaign_type && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {opportunity.campaign_type}
                </span>
              )}
            </div>

            {/* Campaign Name */}
            <h4 className="font-bold text-xl text-gray-900 mb-1 truncate">
              {opportunity.campaign_name}
            </h4>

            {/* Brand */}
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{opportunity.brand_name}</span>
            </div>

            {/* Offer Range */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 mb-4">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <span className="text-base font-bold text-amber-700">
                {formatCurrency(opportunity.recommended_offer_low)} - {formatCurrency(opportunity.recommended_offer_high)}
              </span>
              <span className="text-xs text-amber-600 font-medium">estimated</span>
            </div>

            {/* Strengths */}
            {opportunity.strengths.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {opportunity.strengths.slice(0, 3).map((strength, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="flex items-center">
            <ChevronRight className="w-6 h-6 text-gray-300" />
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={() => router.push('/opportunities')}
          className="w-full py-3 text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
        >
          View All Opportunities
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </Card>
  );
}

export default FeaturedOpportunity;
