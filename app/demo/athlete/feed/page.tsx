'use client';

import React, { useState, useEffect } from 'react';
import { DemoShell } from '@/components/demo/DemoShell';
import { AthleteFeed } from '@/components/demo/browse/AthleteFeed';
import { FMVScoreGauge } from '@/components/demo/fmv/FMVScoreGauge';
import { ScoreBreakdownCards } from '@/components/demo/fmv/ScoreBreakdownCards';
import { DealValueEstimates } from '@/components/demo/fmv/DealValueEstimates';
import { MatchResultsTable, type AthleteMatch } from '@/components/demo/matchmaking/MatchResultsTable';
import { MatchDetailModal } from '@/components/demo/matchmaking/MatchDetailModal';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
import { Target, TrendingUp, List } from 'lucide-react';

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

export default function AthleteFeedDemoPage() {
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
    // Smooth scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById('fmv-results');
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
    if (view === 'agency') {
      router.push('/demo/agency/feed');
    }
  };

  return (
    <DemoShell activeView="athlete" onViewChange={handleViewChange}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-text-primary">
                Athlete FMV Demo
              </h1>
              <Badge variant="primary" size="sm" leftIcon={<List className="h-3 w-3" />}>
                Feed View
              </Badge>
            </div>
            <p className="text-text-secondary">
              Scroll through athletes and select one to view their Fair Market Value
            </p>
          </div>

          {/* View Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/demo/athlete')}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-background-hover transition-colors"
            >
              Dropdown
            </button>
            <button
              onClick={() => router.push('/demo/athlete/grid')}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-background-hover transition-colors"
            >
              Grid
            </button>
            <button
              className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg shadow-md"
            >
              Feed
            </button>
          </div>
        </div>

        {/* Athlete Feed */}
        <AthleteFeed
          onSelect={handleAthleteSelect}
          selectedAthleteId={selectedAthleteId || undefined}
        />

        {/* FMV Results */}
        {selectedAthleteId && (
          <div id="fmv-results" className="pt-8 border-t-2 border-border space-y-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary-500" />
              <h2 className="text-2xl font-bold text-text-primary">Fair Market Value Analysis</h2>
            </div>

            {isLoadingFMV ? (
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            ) : fmvData ? (
              <>
                <FMVScoreGauge score={fmvData.fmv_score} tier={fmvData.fmv_tier} />
                <ScoreBreakdownCards fmv={fmvData} />
                <DealValueEstimates
                  low={fmvData.estimated_deal_value_low}
                  mid={fmvData.estimated_deal_value_mid}
                  high={fmvData.estimated_deal_value_high}
                />
              </>
            ) : (
              <Card>
                <CardContent className="p-12">
                  <EmptyState
                    icon={TrendingUp}
                    title="No FMV Data Available"
                    description="Unable to load Fair Market Value data for this athlete"
                  />
                </CardContent>
              </Card>
            )}

            {/* Matched Campaigns */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-primary-500" />
                <h2 className="text-2xl font-bold text-text-primary">Matched Campaign Opportunities</h2>
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
                      icon={Target}
                      title="No Matches Found"
                      description="No campaign opportunities available for this athlete at this time"
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
