'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { TrendingUp, DollarSign, Target, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CampaignOpportunity {
  campaign_id: string;
  campaign_name: string;
  brand_name: string;
  match_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  recommended_offer_low: number;
  recommended_offer_high: number;
  strengths: string[];
  concerns: string[];
  match_breakdown: {
    brand_values: number;
    interests: number;
    campaign_fit: number;
    budget: number;
    geography: number;
    demographics: number;
    engagement: number;
  };
}

interface CampaignOpportunitiesProps {
  limit?: number;
  showHeader?: boolean;
  onCampaignClick?: (campaign: CampaignOpportunity) => void;
}

function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  }
  return `$${dollars.toLocaleString()}`;
}

function getConfidenceBadgeVariant(level: string): 'success' | 'warning' | 'gray' {
  switch (level) {
    case 'high':
      return 'success';
    case 'medium':
      return 'warning';
    default:
      return 'gray';
  }
}

function getConfidenceLabel(level: string): string {
  switch (level) {
    case 'high':
      return 'Great Match';
    case 'medium':
      return 'Good Match';
    default:
      return 'Potential Match';
  }
}

export function CampaignOpportunities({
  limit = 5,
  showHeader = true,
  onCampaignClick
}: CampaignOpportunitiesProps) {
  const [campaigns, setCampaigns] = useState<CampaignOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
    avgMatchScore: number;
  } | null>(null);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/matchmaking/athlete/campaigns', {
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Please log in to see campaign opportunities');
          } else if (response.status === 403) {
            setError('Only athletes can view campaign opportunities');
          } else {
            setError('Failed to load campaign opportunities');
          }
          return;
        }

        const data = await response.json();
        setCampaigns(data.campaigns || []);
        setSummary(data.summary || null);
      } catch (err) {
        console.error('Error fetching campaign opportunities:', err);
        setError('Failed to load opportunities. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCampaigns();
  }, []);

  const displayedCampaigns = limit ? campaigns.slice(0, limit) : campaigns;

  if (isLoading) {
    return (
      <Card variant="elevated" className="overflow-hidden bg-gradient-to-br from-orange-50/20 via-white to-amber-50/15 border border-orange-100/40">
        {showHeader && (
          <div className="px-6 py-4 border-b border-orange-100/30">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        )}
        <div className="p-6 space-y-4">
          {[...Array(limit)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="elevated" className="bg-gradient-to-br from-orange-50/20 via-white to-amber-50/15 border border-orange-100/40">
        {showHeader && (
          <div className="px-6 py-4 border-b border-orange-100/30">
            <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              NIL Opportunities
            </h2>
          </div>
        )}
        <div className="p-12">
          <EmptyState
            icon={AlertCircle}
            title="Unable to Load Opportunities"
            description={error}
          />
        </div>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card variant="elevated" className="bg-gradient-to-br from-orange-50/20 via-white to-amber-50/15 border border-orange-100/40">
        {showHeader && (
          <div className="px-6 py-4 border-b border-orange-100/30">
            <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              NIL Opportunities
            </h2>
          </div>
        )}
        <div className="p-12">
          <EmptyState
            icon={Target}
            title="No Opportunities Yet"
            description="Complete your profile and add social media stats to unlock campaign opportunities matched to you!"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="overflow-hidden shadow-sm shadow-orange-100/30 bg-gradient-to-br from-orange-50/20 via-white to-amber-50/15 border border-orange-100/40">
      {showHeader && (
        <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 px-6 py-6 overflow-hidden">
          {/* Animated shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />

          {/* Header Content */}
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="font-bold text-2xl text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Brands Want You 🔥
              </h3>
              <p className="text-white/90 text-sm font-medium mt-1">Hot opportunities matched to you</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                <span className="text-white font-bold text-lg">{campaigns.length}</span>
              </div>
              {summary && summary.avgMatchScore > 0 && (
                <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="text-white font-bold text-lg">{summary.avgMatchScore}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-orange-100/30">
        {displayedCampaigns.map((campaign, index) => {
          const isHighMatch = campaign.match_score >= 90;

          return (
            <motion.div
              key={campaign.campaign_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => onCampaignClick?.(campaign)}
              className={`p-6 transition-all bg-gradient-to-br from-white to-orange-50/20 border border-orange-100/40 ${
                onCampaignClick ? 'hover:border-orange-200/60 hover:shadow-lg hover:shadow-orange-200/30 cursor-pointer' : ''
              } ${isHighMatch ? 'shadow-lg shadow-orange-300/50 border-2 border-orange-300/60 bg-gradient-to-br from-orange-50/40 to-amber-50/30' : ''}`}
            >
              {/* Campaign Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold ${isHighMatch ? 'text-2xl' : 'text-xl'} text-gray-900 mb-2 truncate`}>
                    {campaign.campaign_name}
                  </h3>
                  <p className="text-base font-medium text-gray-600">{campaign.brand_name}</p>
                </div>

                {/* HUGE Match Score */}
                <div className={`relative flex flex-col items-center ${isHighMatch ? 'animate-pulse' : ''}`}>
                  <div className={`text-5xl font-extrabold bg-gradient-to-r ${
                    isHighMatch
                      ? 'from-yellow-500 to-orange-500'
                      : campaign.confidence_level === 'high'
                      ? 'from-green-500 to-emerald-500'
                      : 'from-blue-500 to-cyan-500'
                  } bg-clip-text text-transparent`}>
                    {campaign.match_score}%
                  </div>
                  <span className={`text-xs font-bold text-white px-3 py-1 rounded-full mt-2 ${
                    isHighMatch
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg shadow-orange-500/50'
                      : campaign.confidence_level === 'high'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}>
                    {getConfidenceLabel(campaign.confidence_level)}
                  </span>
                </div>
              </div>

              {/* Match Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Confidence */}
                <div className={`flex items-center gap-2 rounded-lg p-3 border ${
                  campaign.confidence_level === 'high'
                    ? 'bg-orange-100 border-orange-300'
                    : campaign.confidence_level === 'medium'
                    ? 'bg-amber-100 border-amber-300'
                    : 'bg-yellow-100 border-yellow-300'
                }`}>
                  <TrendingUp className={`h-5 w-5 flex-shrink-0 ${
                    campaign.confidence_level === 'high'
                      ? 'text-orange-700'
                      : campaign.confidence_level === 'medium'
                      ? 'text-amber-700'
                      : 'text-yellow-700'
                  }`} />
                  <span className={`text-base font-bold ${
                    campaign.confidence_level === 'high'
                      ? 'text-orange-700'
                      : campaign.confidence_level === 'medium'
                      ? 'text-amber-700'
                      : 'text-yellow-700'
                  }`}>
                    {getConfidenceLabel(campaign.confidence_level)}
                  </span>
                </div>

                {/* Offer Range - Warm tones */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-3 border border-yellow-300">
                  <DollarSign className="h-6 w-6 text-yellow-700 flex-shrink-0" />
                  <span className="text-lg font-extrabold text-yellow-800">
                    {formatCurrency(campaign.recommended_offer_low)} - {formatCurrency(campaign.recommended_offer_high)}
                  </span>
                </div>
              </div>

              {/* Strengths - Warm colors */}
              {campaign.strengths.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {campaign.strengths.map((strength, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-md"
                    >
                      ✓ {strength}
                    </span>
                  ))}
                </div>
              )}

              {onCampaignClick && (
                <div className="mt-4 flex items-center justify-end">
                  <button className="px-6 py-3 text-base font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                    View Full Details
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Glow effect for high matches */}
              {isHighMatch && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 pointer-events-none rounded-lg" />
              )}
            </motion.div>
          );
        })}
      </div>

      {campaigns.length > limit && (
        <div className="px-6 py-4 border-t border-orange-100/30 bg-gradient-to-br from-orange-50/20 to-amber-50/15 text-center">
          <button className="w-full py-3 text-base font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all hover:shadow-orange-300/50">
            View All {campaigns.length} Opportunities →
          </button>
        </div>
      )}
    </Card>
  );
}
