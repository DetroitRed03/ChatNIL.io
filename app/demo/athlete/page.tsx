'use client';

import React, { useState, useEffect } from 'react';
import { DemoShell } from '@/components/demo/DemoShell';
import { AthleteSelector } from '@/components/demo/AthleteSelector';
import { FMVScoreGauge } from '@/components/demo/fmv/FMVScoreGauge';
import { ScoreBreakdownCards } from '@/components/demo/fmv/ScoreBreakdownCards';
import { DealValueEstimates } from '@/components/demo/fmv/DealValueEstimates';
import { MatchResultsTable, type AthleteMatch } from '@/components/demo/matchmaking/MatchResultsTable';
import { MatchDetailModal } from '@/components/demo/matchmaking/MatchDetailModal';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRouter } from 'next/navigation';
import { Target, TrendingUp } from 'lucide-react';

interface FMVData {
  fmv_score: number;
  fmv_tier: 'elite' | 'high' | 'medium' | 'developing' | 'emerging';
  social_score: number;
  athletic_score: number;
  market_score: number;
  brand_score: number;
  estimated_deal_value_low: number;
  estimated_deal_value_mid: number;
  estimated_deal_value_high: number;
}

export default function AthleteDemoPage() {
  const router = useRouter();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [fmvData, setFmvData] = useState<FMVData | null>(null);
  const [matches, setMatches] = useState<AthleteMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<AthleteMatch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingFMV, setIsLoadingFMV] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  // Fetch FMV data when athlete is selected
  useEffect(() => {
    if (!selectedAthleteId) return;

    async function fetchFMVData() {
      setIsLoadingFMV(true);
      try {
        const response = await fetch(`/api/demo/fmv/athlete/${selectedAthleteId}`);
        if (response.ok) {
          const data = await response.json();
          // Extract the FMV data from the response (API returns { fmv: {...}, athlete: {...}, ... })
          setFmvData(data.fmv);
        } else {
          console.error('Failed to fetch FMV data');
        }
      } catch (error) {
        console.error('Error fetching FMV data:', error);
      } finally {
        setIsLoadingFMV(false);
      }
    }

    fetchFMVData();
  }, [selectedAthleteId]);

  // Fetch matched campaigns when athlete is selected
  useEffect(() => {
    if (!selectedAthleteId) return;

    async function fetchMatches() {
      setIsLoadingMatches(true);
      try {
        const response = await fetch(`/api/demo/matchmaking/athlete/${selectedAthleteId}/campaigns`);
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
  }, [selectedAthleteId]);

  const handleAthleteSelect = (athleteId: string) => {
    setSelectedAthleteId(athleteId);
    setFmvData(null);
    setMatches([]);
  };

  const handleMatchClick = (match: AthleteMatch) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleViewChange = (view: 'athlete' | 'agency') => {
    if (view === 'agency') {
      router.push('/demo/agency');
    }
  };

  return (
    <DemoShell activeView="athlete" onViewChange={handleViewChange}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Athlete FMV Demo</h1>
          <p className="text-text-secondary mt-2">
            Select an athlete to view their Fair Market Value score and matched NIL opportunities
          </p>
        </div>

        {/* Athlete Selector */}
        <AthleteSelector
          onSelect={handleAthleteSelect}
          selectedAthleteId={selectedAthleteId || undefined}
        />

        {/* FMV Data Display */}
        {selectedAthleteId && (
          <>
            {isLoadingFMV ? (
              // Loading State
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardContent className="p-6 flex items-center justify-center">
                    <Skeleton className="w-48 h-48 rounded-full" />
                  </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : fmvData ? (
              <>
                {/* FMV Score & Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* FMV Gauge */}
                  <Card className="lg:col-span-1">
                    <CardContent className="p-6 flex items-center justify-center">
                      <FMVScoreGauge
                        score={fmvData.fmv_score}
                        tier={fmvData.fmv_tier}
                        size="lg"
                      />
                    </CardContent>
                  </Card>

                  {/* Score Breakdown Cards */}
                  <div className="lg:col-span-2">
                    <ScoreBreakdownCards fmv={fmvData} />
                  </div>
                </div>

                {/* Deal Value Estimates */}
                <DealValueEstimates
                  low={fmvData.estimated_deal_value_low}
                  mid={fmvData.estimated_deal_value_mid}
                  high={fmvData.estimated_deal_value_high}
                />

                {/* Matched Opportunities */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-text-primary">
                        Matched NIL Opportunities
                      </h2>
                      <p className="text-text-secondary mt-1">
                        Top campaigns that match this athlete's profile
                      </p>
                    </div>
                    {matches.length > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg border border-primary-200">
                        <Target className="h-5 w-5 text-primary-600" />
                        <span className="text-sm font-medium text-primary-600">
                          {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} Found
                        </span>
                      </div>
                    )}
                  </div>

                  {isLoadingMatches ? (
                    // Loading State
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </CardContent>
                    </Card>
                  ) : matches.length > 0 ? (
                    <MatchResultsTable
                      matches={matches}
                      onAthleteClick={handleMatchClick}
                    />
                  ) : (
                    <Card>
                      <CardContent className="p-12">
                        <EmptyState
                          icon={TrendingUp}
                          title="No Matches Yet"
                          description="We're analyzing campaigns to find the best NIL opportunities for this athlete. Check back soon!"
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              // Error State
              <Card>
                <CardContent className="p-12">
                  <EmptyState
                    icon={Target}
                    title="Unable to Load FMV Data"
                    description="There was an error loading the FMV data for this athlete. Please try again."
                  />
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Empty State - No Athlete Selected */}
        {!selectedAthleteId && (
          <Card>
            <CardContent className="p-12">
              <EmptyState
                icon={Target}
                title="Select an Athlete"
                description="Choose an athlete from the dropdown above to view their FMV score and matched opportunities"
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
