'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AgencyOnlyGuard } from '@/components/guards/AgencyOnlyGuard';
import {
  Bookmark,
  BookmarkX,
  TrendingUp,
  Users,
  Loader2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import type { AgencyAthleteInteraction } from '@/types/agency';

export default function AgencySavedPage() {
  return (
    <AgencyOnlyGuard>
      <SavedAthletesContent />
    </AgencyOnlyGuard>
  );
}

function SavedAthletesContent() {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<AgencyAthleteInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Get session on mount
  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
      }
    }
    getSession();
  }, []);

  useEffect(() => {
    async function fetchSaved() {
      if (!accessToken) return;

      try {
        const response = await fetch('/api/agency/interactions?saved=true', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json();

        if (data.success && data.data) {
          setInteractions(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch saved athletes:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSaved();
  }, [accessToken]);

  const handleRemove = async (athleteId: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch('/api/agency/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          athlete_user_id: athleteId,
          action: 'unsave',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setInteractions(prev => prev.filter(i => i.athlete_user_id !== athleteId));
      }
    } catch (error) {
      console.error('Failed to remove athlete:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Athletes</h1>
          <p className="text-gray-600 mt-1">
            Your shortlist of athletes you're interested in working with.
          </p>
        </div>

        {/* Content */}
        {interactions.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {interactions.map(interaction => (
                <SavedAthleteRow
                  key={interaction.id}
                  interaction={interaction}
                  onRemove={() => handleRemove(interaction.athlete_user_id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-medium text-gray-900">No saved athletes</p>
            <p className="text-gray-500 mt-2">
              Start discovering athletes and save the ones you're interested in.
            </p>
            <Link
              href="/agency/discover"
              className="inline-block mt-6 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition"
            >
              Discover Athletes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SavedAthleteRow({
  interaction,
  onRemove,
}: {
  interaction: AgencyAthleteInteraction;
  onRemove: () => void;
}) {
  const athlete = interaction.athlete;

  return (
    <div className="p-6 flex items-center gap-6 hover:bg-gray-50 transition">
      {/* Avatar */}
      <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
        {athlete?.first_name?.[0]}
        {athlete?.last_name?.[0]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/athletes/${interaction.athlete_user_id}`}
          className="font-semibold text-lg text-gray-900 hover:text-primary-500 transition"
        >
          {athlete?.first_name} {athlete?.last_name}
        </Link>
        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
          {athlete?.primary_sport && <span>{athlete.primary_sport}</span>}
          {athlete?.school_name && (
            <>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>{athlete.school_name}</span>
            </>
          )}
          {athlete?.graduation_year && (
            <>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span>Class of {athlete.graduation_year}</span>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        {interaction.match_score && (
          <div className="text-center">
            <div className="flex items-center gap-1 text-primary-500 font-semibold">
              <TrendingUp className="w-4 h-4" />
              {interaction.match_score}%
            </div>
            <span className="text-gray-400 text-xs">Match</span>
          </div>
        )}

        {athlete?.total_followers && (
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {(athlete.total_followers / 1000).toFixed(1)}K
            </div>
            <span className="text-gray-400 text-xs">Followers</span>
          </div>
        )}

        {athlete?.avg_engagement_rate && (
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {athlete.avg_engagement_rate.toFixed(1)}%
            </div>
            <span className="text-gray-400 text-xs">Engagement</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/athletes/${interaction.athlete_user_id}`}
          className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition"
          title="View Profile"
        >
          <ExternalLink className="w-5 h-5" />
        </Link>
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
          title="Remove from saved"
        >
          <BookmarkX className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
