'use client';

import { useEffect, useState } from 'react';
import { AgencyAthleteMatch } from '@/types';
import { AthleteMatchCard } from './AthleteMatchCard';
import { RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function MatchDiscovery() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<AgencyAthleteMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchMatches();
    }
  }, [filter, user?.id]);

  async function fetchMatches() {
    if (!user?.id) {
      setError('Please log in to view matches');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const params = new URLSearchParams({ userId: user.id });
      if (filter !== 'all') {
        params.set('tier', filter);
      }

      const res = await fetch(`/api/matches?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to fetch matches');
        return;
      }

      setMatches(data.matches || []);
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function generateMatches() {
    setGenerating(true);
    try {
      const res = await fetch('/api/matches/generate', {
        method: 'POST'
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✨ Generated ${data.count} new matches!\n\nEvaluated ${data.stats?.total_athletes_evaluated || 0} athletes.`);
        fetchMatches();
      } else {
        alert(data.error || 'Failed to generate matches');
      }
    } catch (error) {
      console.error('Error generating matches:', error);
      alert('Failed to generate matches');
    } finally {
      setGenerating(false);
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view and generate athlete matches.</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Matches</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchMatches}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Discover Athletes</h1>
            <p className="text-gray-600">Find the perfect athletes for your brand campaigns</p>
          </div>

          <button
            onClick={generateMatches}
            disabled={generating}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
          >
            {generating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate New Matches</span>
              </>
            )}
          </button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {stats.by_tier?.excellent || 0}
              </div>
              <div className="text-sm text-gray-600">🌟 Excellent Matches</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {stats.by_tier?.good || 0}
              </div>
              <div className="text-sm text-gray-600">✅ Good Matches</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.by_tier?.potential || 0}
              </div>
              <div className="text-sm text-gray-600">💡 Potential Matches</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {stats.by_status?.contacted || 0}
              </div>
              <div className="text-sm text-gray-600">✉️ Contacted</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Matches ({stats?.total || 0})
          </button>
          <button
            onClick={() => setFilter('excellent')}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filter === 'excellent'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🌟 Excellent
          </button>
          <button
            onClick={() => setFilter('good')}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filter === 'good'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✅ Good
          </button>
          <button
            onClick={() => setFilter('potential')}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filter === 'potential'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💡 Potential
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-700">
            <strong>💡 How it works:</strong> Our matching algorithm scores athletes 0-100 based on
            11 factors including follower count, engagement rate, sport alignment, hobbies, location,
            and brand fit. Click "Generate New Matches" to discover athletes that match your campaign goals.
          </p>
        </div>
      </div>

      {/* Matches Grid */}
      {matches.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 mb-4 text-lg">No matches found</p>
          <p className="text-gray-500 mb-6">
            Generate matches based on your campaign preferences to discover athletes
          </p>
          <button
            onClick={generateMatches}
            disabled={generating}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate Matches Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map(match => (
            <AthleteMatchCard key={match.id} match={match} onUpdate={fetchMatches} />
          ))}
        </div>
      )}
    </div>
  );
}
