/**
 * Matched Athletes Component
 *
 * Displays athletes matched to a campaign using the matchmaking engine
 * Shows match scores, reasons, and allows inviting/assigning athletes
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  TrendingUp,
  Star,
  Send,
  Check,
  X,
  Filter,
  Search,
  ChevronDown,
  MapPin,
  Instagram,
  Award,
  DollarSign,
  AlertCircle,
  Sparkles,
  Target
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

interface AthleteMatch {
  athlete_id: string;
  user_id: string;
  score: number;
  score_breakdown: {
    sport: number;
    geography: number;
    division: number;
    followers: number;
    engagement: number;
    demographics: number;
    hobbies: number;
    brandAffinity: number;
    nilSuccess: number;
    contentQuality: number;
    responseRate: number;
  };
  match_reasons: string[];
  athlete: {
    id: string;
    full_name: string;
    username: string;
    profile_photo_url: string | null;
    primary_sport: string;
    school_name: string;
    total_followers: number;
    engagement_rate: number;
    fmv: number;
  };
}

interface MatchedAthletesProps {
  campaignId: string;
  campaignBudgetPerAthlete?: number;
}

type SortOption = 'score' | 'followers' | 'engagement' | 'fmv';

export default function MatchedAthletes({ campaignId, campaignBudgetPerAthlete }: MatchedAthletesProps) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<AthleteMatch[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<AthleteMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [selectedAthletes, setSelectedAthletes] = useState<Set<string>>(new Set());
  const [isInviting, setIsInviting] = useState(false);
  const [expandedAthleteId, setExpandedAthleteId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/campaigns/${campaignId}/matches?limit=50&minScore=${minScore}`);

        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }

        const data = await response.json();
        setMatches(data.matches || []);
        setFilteredMatches(data.matches || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMatches();
  }, [campaignId, minScore]);

  // Filter and sort matches
  useEffect(() => {
    let filtered = matches.filter(match => {
      const nameMatch = match.athlete.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       match.athlete.username?.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'followers':
          return b.athlete.total_followers - a.athlete.total_followers;
        case 'engagement':
          return b.athlete.engagement_rate - a.athlete.engagement_rate;
        case 'fmv':
          return (b.athlete.fmv || 0) - (a.athlete.fmv || 0);
        default:
          return 0;
      }
    });

    setFilteredMatches(filtered);
  }, [matches, searchTerm, sortBy]);

  const toggleAthleteSelection = (athleteId: string) => {
    const newSelection = new Set(selectedAthletes);
    if (newSelection.has(athleteId)) {
      newSelection.delete(athleteId);
    } else {
      newSelection.add(athleteId);
    }
    setSelectedAthletes(newSelection);
  };

  const handleInviteSelected = async () => {
    if (selectedAthletes.size === 0) return;

    if (!user?.id) {
      alert('Please log in to invite athletes');
      return;
    }

    setIsInviting(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id,
        },
        credentials: 'include',
        body: JSON.stringify({
          athlete_ids: Array.from(selectedAthletes),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Invite API error:', errorData);
        throw new Error(errorData.error || 'Failed to send invites');
      }

      // Clear selection after successful invite
      setSelectedAthletes(new Set());
      alert(`Successfully invited ${selectedAthletes.size} athlete(s)!`);
    } catch (err) {
      console.error('Invite error:', err);
      alert(err instanceof Error ? err.message : 'Failed to send invites');
    } finally {
      setIsInviting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-100 border-green-300';
    if (score >= 60) return 'text-blue-700 bg-blue-100 border-blue-300';
    if (score >= 40) return 'text-amber-700 bg-amber-100 border-amber-300';
    return 'text-gray-700 bg-gray-100 border-gray-300';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-white border-2 border-orange-100/50">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-white border-2 border-red-100">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-semibold mb-2">Failed to load matches</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card className="p-6 bg-white border-2 border-orange-100/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-orange-600" />
              Matched Athletes
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {matches.length} athlete{matches.length !== 1 ? 's' : ''} matched using our 11-factor algorithm
            </p>
          </div>

          {selectedAthletes.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleInviteSelected}
              disabled={isInviting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isInviting ? 'Sending...' : `Invite ${selectedAthletes.size} Athlete${selectedAthletes.size > 1 ? 's' : ''}`}
            </motion.button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search athletes..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-sm"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-sm appearance-none bg-white font-semibold text-gray-700"
            >
              <option value="score">Sort by: Match Score</option>
              <option value="followers">Sort by: Followers</option>
              <option value="engagement">Sort by: Engagement</option>
              <option value="fmv">Sort by: FMV</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Min Score Filter */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Min Match Score: {minScore}%</label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>
      </Card>

      {/* Athletes List */}
      {filteredMatches.length === 0 ? (
        <Card className="p-12 bg-white border-2 border-orange-100/50 text-center">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold mb-1">No matches found</p>
          <p className="text-sm text-gray-500">Try adjusting your filters or search criteria</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.athlete_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className={cn(
                  "p-6 bg-white border-2 transition-all hover:shadow-lg",
                  selectedAthletes.has(match.athlete_id)
                    ? "border-orange-300 bg-orange-50/30"
                    : "border-orange-100/50"
                )}>
                  <div className="flex items-start gap-6">
                    {/* Selection Checkbox */}
                    <div className="flex items-start pt-1">
                      <input
                        type="checkbox"
                        checked={selectedAthletes.has(match.athlete_id)}
                        onChange={() => toggleAthleteSelection(match.athlete_id)}
                        className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                      />
                    </div>

                    {/* Profile Photo */}
                    <div className="relative flex-shrink-0">
                      {match.athlete.profile_photo_url ? (
                        <img
                          src={match.athlete.profile_photo_url}
                          alt={match.athlete.full_name}
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {match.athlete.full_name.charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Match Score Badge */}
                      <div className={cn(
                        "absolute -top-2 -right-2 px-2 py-1 rounded-lg border-2 text-xs font-bold shadow-sm",
                        getScoreColor(match.score)
                      )}>
                        {match.score}%
                      </div>
                    </div>

                    {/* Athlete Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {match.athlete.full_name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            {match.athlete.username && (
                              <span className="font-semibold">@{match.athlete.username}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" />
                              {match.athlete.primary_sport}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {match.athlete.school_name}
                            </span>
                          </div>
                        </div>

                        <div className={cn(
                          "px-3 py-1.5 rounded-lg border-2 text-xs font-bold whitespace-nowrap",
                          getScoreColor(match.score)
                        )}>
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {getScoreLabel(match.score)}
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Instagram className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 font-semibold">Followers</div>
                            <div className="text-sm font-bold text-gray-900">
                              {match.athlete.total_followers >= 1000
                                ? `${(match.athlete.total_followers / 1000).toFixed(1)}K`
                                : match.athlete.total_followers}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 font-semibold">Engagement</div>
                            <div className="text-sm font-bold text-gray-900">
                              {match.athlete.engagement_rate.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 font-semibold">FMV</div>
                            <div className="text-sm font-bold text-gray-900">
                              ${match.athlete.fmv ? (match.athlete.fmv / 1000).toFixed(1) + 'K' : 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 font-semibold">Match</div>
                            <div className="text-sm font-bold text-gray-900">
                              {match.score}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Match Reasons */}
                      {match.match_reasons && match.match_reasons.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            {match.match_reasons.slice(0, 3).map((reason, idx) => (
                              <div
                                key={idx}
                                className="px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-lg text-xs font-semibold text-orange-700"
                              >
                                {reason}
                              </div>
                            ))}
                            {match.match_reasons.length > 3 && (
                              <button
                                onClick={() => setExpandedAthleteId(
                                  expandedAthleteId === match.athlete_id ? null : match.athlete_id
                                )}
                                className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                              >
                                +{match.match_reasons.length - 3} more
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Expanded Score Breakdown */}
                      <AnimatePresence>
                        {expandedAthleteId === match.athlete_id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-orange-100">
                              <div className="text-sm font-bold text-gray-900 mb-3">Score Breakdown</div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                {Object.entries(match.score_breakdown).map(([key, value]) => (
                                  <div key={key} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600 font-semibold capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="font-bold text-gray-900">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Budget Fit Indicator */}
                      {campaignBudgetPerAthlete && match.athlete.fmv && (
                        <div className="mt-3">
                          {match.athlete.fmv <= campaignBudgetPerAthlete ? (
                            <div className="flex items-center gap-2 text-xs text-green-700 font-semibold">
                              <Check className="w-4 h-4" />
                              Within budget (${(campaignBudgetPerAthlete / 1000).toFixed(1)}K per athlete)
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold">
                              <AlertCircle className="w-4 h-4" />
                              Above budget by ${((match.athlete.fmv - campaignBudgetPerAthlete) / 1000).toFixed(1)}K
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
