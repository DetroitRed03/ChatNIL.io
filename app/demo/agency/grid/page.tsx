'use client';

import React, { useState, useEffect } from 'react';
import { DemoShell } from '@/components/demo/DemoShell';
import { CampaignBrowser } from '@/components/demo/browse/CampaignBrowser';
import { MatchResultsTable, type AthleteMatch } from '@/components/demo/matchmaking/MatchResultsTable';
import { MatchDetailModal } from '@/components/demo/matchmaking/MatchDetailModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRouter } from 'next/navigation';
import { Target, Users, DollarSign, MapPin, Grid3x3 } from 'lucide-react';

interface CampaignDetails {
  id: string;
  campaign_name: string;
  brand_name: string;
  budget_min: number;
  budget_max: number;
  sports_targeting: string[];
  states_targeting: string[];
  min_followers: number;
  min_fmv_score: number;
  content_types: string[];
}

function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000000) {
    return `$${(dollars / 1000000).toFixed(1)}M`;
  } else if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  } else {
    return `$${dollars.toLocaleString()}`;
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export default function AgencyGridDemoPage() {
  const router = useRouter();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails | null>(null);
  const [matches, setMatches] = useState<AthleteMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<AthleteMatch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  // Fetch campaign details when campaign is selected
  useEffect(() => {
    if (!selectedCampaignId) return;

    async function fetchCampaignDetails() {
      setIsLoadingCampaign(true);
      try {
        const response = await fetch(`/api/demo/matchmaking/campaign/${selectedCampaignId}`);
        if (response.ok) {
          const data = await response.json();
          setCampaignDetails(data);
        } else {
          console.error('Failed to fetch campaign details');
        }
      } catch (error) {
        console.error('Error fetching campaign details:', error);
      } finally {
        setIsLoadingCampaign(false);
      }
    }

    fetchCampaignDetails();
  }, [selectedCampaignId]);

  // Fetch matched athletes when campaign is selected
  useEffect(() => {
    if (!selectedCampaignId) return;

    async function fetchMatches() {
      setIsLoadingMatches(true);
      try {
        const response = await fetch(`/api/demo/matchmaking/campaign/${selectedCampaignId}/athletes`);
        if (response.ok) {
          const data = await response.json();
          setMatches(data.matches || []);
        } else {
          console.error('Failed to fetch matches');
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setIsLoadingMatches(false);
      }
    }

    fetchMatches();
  }, [selectedCampaignId]);

  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setCampaignDetails(null);
    setMatches([]);
    // Smooth scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById('campaign-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleMatchClick = (match: AthleteMatch) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleViewChange = (view: 'athlete' | 'agency') => {
    if (view === 'athlete') {
      router.push('/demo/athlete/grid');
    }
  };

  return (
    <DemoShell activeView="agency" onViewChange={handleViewChange}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-text-primary">
                Agency Matchmaking Demo
              </h1>
              <Badge variant="accent" size="sm" leftIcon={<Grid3x3 className="h-3 w-3" />}>
                Grid View
              </Badge>
            </div>
            <p className="text-text-secondary">
              Browse campaigns in a card grid and select one to view matched athletes
            </p>
          </div>

          {/* View Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/demo/agency')}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-background-hover transition-colors"
            >
              Dropdown
            </button>
            <button
              className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg shadow-md"
            >
              Grid
            </button>
            <button
              onClick={() => router.push('/demo/agency/feed')}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-background-hover transition-colors"
            >
              Feed
            </button>
          </div>
        </div>

        {/* Campaign Browser */}
        <CampaignBrowser
          onSelect={handleCampaignSelect}
          selectedCampaignId={selectedCampaignId || undefined}
        />

        {/* Campaign Results */}
        {selectedCampaignId && (
          <div id="campaign-results" className="pt-8 border-t-2 border-border space-y-8">
            {/* Campaign Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-primary-500" />
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCampaign ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-20" />
                      ))}
                    </div>
                  </div>
                ) : campaignDetails ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-text-primary mb-1">
                        {campaignDetails.campaign_name}
                      </h3>
                      <p className="text-lg text-text-secondary">{campaignDetails.brand_name}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-background-card rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-success-500" />
                          <span className="text-sm text-text-secondary">Budget Range</span>
                        </div>
                        <p className="text-lg font-semibold text-text-primary">
                          {formatCurrency(campaignDetails.budget_min)} - {formatCurrency(campaignDetails.budget_max)}
                        </p>
                      </div>

                      <div className="p-4 bg-background-card rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-primary-500" />
                          <span className="text-sm text-text-secondary">Min Followers</span>
                        </div>
                        <p className="text-lg font-semibold text-text-primary">
                          {formatNumber(campaignDetails.min_followers)}
                        </p>
                      </div>

                      <div className="p-4 bg-background-card rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-accent-500" />
                          <span className="text-sm text-text-secondary">Min FMV Score</span>
                        </div>
                        <p className="text-lg font-semibold text-text-primary">
                          {campaignDetails.min_fmv_score}/100
                        </p>
                      </div>

                      <div className="p-4 bg-background-card rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-error-500" />
                          <span className="text-sm text-text-secondary">Target States</span>
                        </div>
                        <p className="text-lg font-semibold text-text-primary">
                          {campaignDetails.states_targeting?.length || 0}
                        </p>
                      </div>
                    </div>

                    {campaignDetails.sports_targeting && campaignDetails.sports_targeting.length > 0 && (
                      <div>
                        <p className="text-sm text-text-secondary mb-2">Target Sports:</p>
                        <div className="flex flex-wrap gap-2">
                          {campaignDetails.sports_targeting.map((sport) => (
                            <Badge key={sport} variant="primary" size="md">
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {campaignDetails.content_types && campaignDetails.content_types.length > 0 && (
                      <div>
                        <p className="text-sm text-text-secondary mb-2">Content Types:</p>
                        <div className="flex flex-wrap gap-2">
                          {campaignDetails.content_types.map((type) => (
                            <Badge key={type} variant="secondary" size="md">
                              {type.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Matched Athletes */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary-500" />
                <h2 className="text-2xl font-bold text-text-primary">Matched Athletes</h2>
              </div>

              {isLoadingMatches ? (
                <Skeleton className="h-96 w-full rounded-xl" />
              ) : matches.length > 0 ? (
                <MatchResultsTable
                  matches={matches}
                  onAthleteClick={handleMatchClick}
                />
              ) : (
                <Card>
                  <CardContent className="p-12">
                    <EmptyState
                      icon={Users}
                      title="No Matches Found"
                      description="No athletes match this campaign's criteria at this time"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Match Detail Modal */}
      <MatchDetailModal
        isOpen={isModalOpen}
        athleteMatch={selectedMatch as any}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMatch(null);
        }}
      />
    </DemoShell>
  );
}
