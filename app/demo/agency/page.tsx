'use client';

import React, { useState, useEffect } from 'react';
import { DemoShell } from '@/components/demo/DemoShell';
import { CampaignSelector } from '@/components/demo/CampaignSelector';
import { MatchResultsTable, type AthleteMatch } from '@/components/demo/matchmaking/MatchResultsTable';
import { MatchDetailModal } from '@/components/demo/matchmaking/MatchDetailModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Target, Users, DollarSign, MapPin, TrendingUp, Filter } from 'lucide-react';

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

export default function AgencyDemoPage() {
  const router = useRouter();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignDetails, setCampaignDetails] = useState<CampaignDetails | null>(null);
  const [matches, setMatches] = useState<AthleteMatch[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<AthleteMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<AthleteMatch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  // Filter states
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

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

  // Run matchmaking when campaign is selected
  useEffect(() => {
    if (!selectedCampaignId) return;

    async function runMatchmaking() {
      setIsLoadingMatches(true);
      try {
        const response = await fetch('/api/demo/matchmaking/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaign_id: selectedCampaignId }),
        });

        if (response.ok) {
          const data = await response.json();
          setMatches(data.matches || []);
          setFilteredMatches(data.matches || []);
        } else {
          console.error('Failed to run matchmaking');
        }
      } catch (error) {
        console.error('Error running matchmaking:', error);
      } finally {
        setIsLoadingMatches(false);
      }
    }

    runMatchmaking();
  }, [selectedCampaignId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...matches];

    if (sportFilter !== 'all') {
      filtered = filtered.filter(m => m.sport === sportFilter);
    }

    if (stateFilter !== 'all') {
      filtered = filtered.filter(m => m.state === stateFilter);
    }

    if (minScoreFilter > 0) {
      filtered = filtered.filter(m => m.match_score >= minScoreFilter);
    }

    setFilteredMatches(filtered);
  }, [matches, sportFilter, stateFilter, minScoreFilter]);

  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setCampaignDetails(null);
    setMatches([]);
    setFilteredMatches([]);
    setSportFilter('all');
    setStateFilter('all');
    setMinScoreFilter(0);
  };

  const handleMatchClick = (match: AthleteMatch) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleViewChange = (view: 'athlete' | 'agency') => {
    if (view === 'athlete') {
      router.push('/demo/athlete');
    }
  };

  // Get unique sports and states for filters
  const uniqueSports = Array.from(new Set(matches.map(m => m.sport))).sort();
  const uniqueStates = Array.from(new Set(matches.map(m => m.state).filter(Boolean))).sort();

  return (
    <DemoShell activeView="agency" onViewChange={handleViewChange}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Agency Matchmaking Demo</h1>
          <p className="text-text-secondary mt-2">
            Select a campaign to find the best athlete matches using our AI-powered matchmaking engine
          </p>
        </div>

        {/* Campaign Selector */}
        <CampaignSelector
          onSelect={handleCampaignSelect}
          selectedCampaignId={selectedCampaignId || undefined}
        />

        {/* Campaign Details */}
        {selectedCampaignId && (
          <>
            {isLoadingCampaign ? (
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ) : campaignDetails ? (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary-500" />
                    Campaign Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Budget */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-success-50">
                        <DollarSign className="h-5 w-5 text-success-600" />
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary uppercase tracking-wide">Budget</p>
                        <p className="text-lg font-semibold text-text-primary mt-1">
                          {formatCurrency(campaignDetails.budget_min)} -{' '}
                          {formatCurrency(campaignDetails.budget_max)}
                        </p>
                      </div>
                    </div>

                    {/* Sports */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary-50">
                        <Users className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary uppercase tracking-wide">Sports</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {campaignDetails.sports_targeting.map((sport) => (
                            <Badge key={sport} variant="primary" size="sm">
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* States */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary uppercase tracking-wide">States</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {campaignDetails.states_targeting.slice(0, 3).map((state) => (
                            <Badge key={state} variant="secondary" size="sm">
                              {state}
                            </Badge>
                          ))}
                          {campaignDetails.states_targeting.length > 3 && (
                            <Badge variant="gray" size="sm">
                              +{campaignDetails.states_targeting.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-accent-50">
                        <TrendingUp className="h-5 w-5 text-accent-600" />
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary uppercase tracking-wide">Requirements</p>
                        <p className="text-sm text-text-primary mt-1">
                          {formatNumber(campaignDetails.min_followers)}+ followers
                        </p>
                        <p className="text-sm text-text-secondary">
                          FMV Score {campaignDetails.min_fmv_score}+
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Matchmaking Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">
                    Athlete Matches
                  </h2>
                  <p className="text-text-secondary mt-1">
                    AI-powered recommendations ranked by compatibility
                  </p>
                </div>

                {matches.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-success-50 rounded-lg border border-success-200">
                      <Target className="h-5 w-5 text-success-600" />
                      <span className="text-sm font-medium text-success-600">
                        {filteredMatches.length} {filteredMatches.length === 1 ? 'Athlete' : 'Athletes'} Found
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Filters */}
              {matches.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-text-tertiary" />
                        <span className="text-sm font-medium text-text-primary">Filters:</span>
                      </div>

                      {/* Sport Filter */}
                      <select
                        value={sportFilter}
                        onChange={(e) => setSportFilter(e.target.value)}
                        className="px-3 py-1.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="all">All Sports</option>
                        {uniqueSports.map((sport) => (
                          <option key={sport} value={sport}>
                            {sport}
                          </option>
                        ))}
                      </select>

                      {/* State Filter */}
                      <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="px-3 py-1.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="all">All States</option>
                        {uniqueStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>

                      {/* Min Score Filter */}
                      <select
                        value={minScoreFilter}
                        onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                        className="px-3 py-1.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value={0}>All Match Scores</option>
                        <option value={90}>90%+ Match</option>
                        <option value={80}>80%+ Match</option>
                        <option value={70}>70%+ Match</option>
                        <option value={60}>60%+ Match</option>
                      </select>

                      {/* Clear Filters */}
                      {(sportFilter !== 'all' || stateFilter !== 'all' || minScoreFilter > 0) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSportFilter('all');
                            setStateFilter('all');
                            setMinScoreFilter(0);
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {isLoadingMatches ? (
                // Loading State
                <Card>
                  <CardContent className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </CardContent>
                </Card>
              ) : filteredMatches.length > 0 ? (
                <MatchResultsTable
                  matches={filteredMatches}
                  onAthleteClick={handleMatchClick}
                />
              ) : matches.length > 0 ? (
                // No results after filtering
                <Card>
                  <CardContent className="p-12">
                    <EmptyState
                      icon={Filter}
                      title="No Athletes Match Your Filters"
                      description="Try adjusting your filters to see more results"
                    />
                  </CardContent>
                </Card>
              ) : (
                // No matches found
                <Card>
                  <CardContent className="p-12">
                    <EmptyState
                      icon={Users}
                      title="No Matches Yet"
                      description="Our AI is analyzing the athlete database to find the best matches for this campaign. This may take a moment..."
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Empty State - No Campaign Selected */}
        {!selectedCampaignId && (
          <Card>
            <CardContent className="p-12">
              <EmptyState
                icon={Target}
                title="Select a Campaign"
                description="Choose a campaign from the dropdown above to find matching athletes"
              />
            </CardContent>
          </Card>
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
