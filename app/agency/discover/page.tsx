'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AthletePublicProfile, AthleteDiscoveryFilters, AgencyAthleteMatch } from '@/types';
import { useMessagingStore, setMessagingUserRole, setMessagingUserId } from '@/lib/stores/messaging';
import { useMessageDrawer } from '@/contexts/MessageDrawerContext';
import { DiscoveryStats } from '@/components/agency/DiscoveryStats';
import { DiscoverSidebar } from '@/components/agency/DiscoverSidebar';
import { DiscoverResults } from '@/components/agency/DiscoverResults';
import { MobileFilterDrawer } from '@/components/agency/MobileFilterDrawer';
import { Loader2 } from 'lucide-react';

// Enriched athlete type with match score
interface EnrichedAthlete extends AthletePublicProfile {
  match_score?: number;
  match_tier?: 'excellent' | 'good' | 'potential';
  match_reasons?: string[];
  // Additional fields from API enrichment
  avatar_url?: string;
  profile_photo?: string;
  full_name?: string;
}

export default function DiscoverPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { fetchThreads } = useMessagingStore();
  const { openDrawer } = useMessageDrawer();

  const [athletes, setAthletes] = useState<EnrichedAthlete[]>([]);
  const [filters, setFilters] = useState<AthleteDiscoveryFilters>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [savedAthletes, setSavedAthletes] = useState<Set<string>>(new Set());
  const [messagingAthleteId, setMessagingAthleteId] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Calculate active filter count for mobile badge
  const activeFilterCount = [
    filters.sports?.length,
    filters.states?.length,
    filters.school_levels?.length,
    filters.content_categories?.length,
    filters.min_followers ? 1 : 0,
    filters.max_followers ? 1 : 0,
    filters.min_fmv ? 1 : 0,
    filters.max_fmv ? 1 : 0,
    filters.min_engagement ? 1 : 0,
    filters.available_only ? 1 : 0,
  ].reduce((sum: number, count) => sum + (count || 0), 0);

  // Redirect if not an agency
  useEffect(() => {
    if (user && user.role !== 'agency') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'agency') {
      fetchAthletesWithMatches(true);
      fetchSavedAthletes();
    }
  }, [user]);

  // Fetch saved athletes to show which are already in roster
  async function fetchSavedAthletes() {
    if (!user) return;

    try {
      const res = await fetch('/api/agency/roster', {
        credentials: 'include',
        headers: {
          'X-User-ID': user.id,
        },
      });
      const data = await res.json();

      if (res.ok && data.athletes) {
        const savedIds = new Set<string>(data.athletes.map((a: any) => a.id));
        setSavedAthletes(savedIds);
      }
    } catch (error) {
      console.error('Error fetching saved athletes:', error);
    }
  }

  // Fetch athletes with match scores from the unified matches endpoint
  async function fetchAthletesWithMatches(reset = false) {
    if (reset) {
      setInitialLoading(true);
    }
    setLoading(true);

    try {
      // First, try to fetch matches with scores
      const matchesRes = await fetch(`/api/matches?limit=50&userId=${user?.id}`);
      const matchesData = await matchesRes.json();

      let enrichedAthletes: EnrichedAthlete[] = [];

      if (matchesData.matches && matchesData.matches.length > 0) {
        // We have AI-generated matches with scores
        enrichedAthletes = matchesData.matches.map((match: AgencyAthleteMatch & { athlete: any }) => ({
          ...match.athlete,
          user_id: match.athlete.id || match.athlete_id,
          display_name: match.athlete.display_name || match.athlete.name || `${match.athlete.first_name || ''} ${match.athlete.last_name || ''}`.trim(),
          sport: match.athlete.primary_sport || match.athlete.sport,
          school_name: match.athlete.school_name || match.athlete.school,
          match_score: match.match_score,
          match_tier: match.match_score >= 90 ? 'excellent' : match.match_score >= 80 ? 'good' : 'potential',
          match_reasons: match.match_reasons || (match.match_reason ? [match.match_reason] : undefined),
        }));
      }

      // Also fetch from discover endpoint to fill in more athletes
      const currentPage = reset ? 1 : page;
      const queryParams = new URLSearchParams();

      if (filters.search) queryParams.set('search', filters.search);
      filters.sports?.forEach(s => queryParams.append('sports[]', s));
      filters.states?.forEach(s => queryParams.append('states[]', s));
      filters.school_levels?.forEach(s => queryParams.append('school_levels[]', s));
      filters.content_categories?.forEach(c => queryParams.append('content_categories[]', c));
      if (filters.min_followers) queryParams.set('min_followers', filters.min_followers.toString());
      if (filters.max_followers) queryParams.set('max_followers', filters.max_followers.toString());
      if (filters.min_fmv) queryParams.set('min_fmv', filters.min_fmv.toString());
      if (filters.max_fmv) queryParams.set('max_fmv', filters.max_fmv.toString());
      if (filters.min_engagement) queryParams.set('min_engagement', filters.min_engagement.toString());
      if (filters.available_only) queryParams.set('available_only', 'true');
      queryParams.set('sort', 'followers_desc');
      queryParams.set('page', currentPage.toString());
      queryParams.set('limit', '24');

      const discoverRes = await fetch(`/api/agency/athletes/discover?${queryParams}`);
      const discoverResponse = await discoverRes.json();
      const discoverData = discoverResponse.success ? discoverResponse.data : discoverResponse;
      const discoverAthletes = discoverData.athletes || [];

      // Merge discovered athletes with matches (avoid duplicates)
      const matchedIds = new Set(enrichedAthletes.map(a => a.user_id));
      const additionalAthletes: EnrichedAthlete[] = discoverAthletes
        .filter((a: any) => !matchedIds.has(a.user_id || a.id))
        .map((a: any) => ({
          ...a,
          user_id: a.user_id || a.id,
          display_name: a.display_name || a.full_name || `${a.first_name || ''} ${a.last_name || ''}`.trim(),
          // Calculate a default match score based on available metrics
          match_score: calculateDefaultScore(a),
          match_tier: undefined,
        }));

      // Combine and sort by match score
      const allAthletes = [...enrichedAthletes, ...additionalAthletes];
      allAthletes.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

      // Apply filters to the combined list
      const filteredAthletes = applyLocalFilters(allAthletes, filters);

      if (reset) {
        setAthletes(filteredAthletes);
        setPage(1);
      } else {
        setAthletes([...athletes, ...filteredAthletes]);
      }

      // Check if there are more pages
      const hasMorePages = discoverData.pagination
        ? discoverData.pagination.hasNextPage
        : (discoverData.has_more || false);
      setHasMore(hasMorePages);

    } catch (error) {
      console.error('Error fetching athletes:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  // Calculate a default match score for athletes without AI-generated scores
  function calculateDefaultScore(athlete: any): number {
    let score = 50; // Base score

    // Boost for engagement rate
    const engagement = athlete.avg_engagement_rate || athlete.engagement_rate || 0;
    if (engagement >= 8) score += 20;
    else if (engagement >= 5) score += 15;
    else if (engagement >= 3) score += 10;

    // Boost for followers
    const followers = (athlete.instagram_followers || 0) + (athlete.tiktok_followers || 0);
    if (followers >= 100000) score += 15;
    else if (followers >= 50000) score += 10;
    else if (followers >= 10000) score += 5;

    // Boost for availability
    if (athlete.is_available_for_partnerships) score += 10;

    // Cap at 100
    return Math.min(score, 100);
  }

  // Apply local filters to athlete list
  function applyLocalFilters(athleteList: EnrichedAthlete[], currentFilters: AthleteDiscoveryFilters): EnrichedAthlete[] {
    return athleteList.filter(athlete => {
      // Search filter
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        const name = (athlete.display_name || '').toLowerCase();
        const sport = (athlete.sport || '').toLowerCase();
        const school = (athlete.school_name || '').toLowerCase();
        if (!name.includes(searchLower) && !sport.includes(searchLower) && !school.includes(searchLower)) {
          return false;
        }
      }

      // Sport filter
      if (currentFilters.sports && currentFilters.sports.length > 0) {
        if (!currentFilters.sports.includes(athlete.sport || '')) {
          return false;
        }
      }

      // Followers filter
      const totalFollowers = (athlete.instagram_followers || 0) + (athlete.tiktok_followers || 0) + (athlete.twitter_followers || 0);
      if (currentFilters.min_followers && totalFollowers < currentFilters.min_followers) {
        return false;
      }
      if (currentFilters.max_followers && totalFollowers > currentFilters.max_followers) {
        return false;
      }

      // Engagement filter
      const engagementRate = athlete.avg_engagement_rate || 0;
      if (currentFilters.min_engagement && engagementRate < currentFilters.min_engagement) {
        return false;
      }

      // FMV filter
      const fmv = (athlete as any).fmv_score || athlete.estimated_fmv_min || 0;
      if (currentFilters.min_fmv && fmv < currentFilters.min_fmv) {
        return false;
      }
      if (currentFilters.max_fmv && fmv > currentFilters.max_fmv) {
        return false;
      }

      // Availability filter
      if (currentFilters.available_only && !athlete.is_available_for_partnerships) {
        return false;
      }

      return true;
    });
  }

  const handleSearch = () => {
    fetchAthletesWithMatches(true);
  };

  const handleRefresh = () => {
    fetchAthletesWithMatches(true);
  };

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  const handleSaveAthlete = async (athleteId: string) => {
    if (!user) return;

    // Check current state to determine if we're saving or unsaving
    const isCurrentlySaved = savedAthletes.has(athleteId);

    // Optimistic update - toggle the state
    setSavedAthletes(prev => {
      const newSet = new Set(prev);
      if (isCurrentlySaved) {
        newSet.delete(athleteId);
      } else {
        newSet.add(athleteId);
      }
      return newSet;
    });

    try {
      const res = await fetch('/api/agency/roster', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id,
        },
        body: JSON.stringify({ athleteId })
      });

      const data = await res.json();

      if (!res.ok) {
        // Revert optimistic update on error
        setSavedAthletes(prev => {
          const newSet = new Set(prev);
          if (isCurrentlySaved) {
            newSet.add(athleteId); // Re-add if we were trying to unsave
          } else {
            newSet.delete(athleteId); // Remove if we were trying to save
          }
          return newSet;
        });
      } else {
        // Sync with server response to ensure consistency
        setSavedAthletes(prev => {
          const newSet = new Set(prev);
          if (data.isSaved) {
            newSet.add(athleteId);
          } else {
            newSet.delete(athleteId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling athlete save:', error);
      // Revert optimistic update on error
      setSavedAthletes(prev => {
        const newSet = new Set(prev);
        if (isCurrentlySaved) {
          newSet.add(athleteId);
        } else {
          newSet.delete(athleteId);
        }
        return newSet;
      });
    }
  };

  const handleMessageAthlete = (athleteId: string) => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    // Find the athlete in our loaded data to get their details
    const athlete = athletes.find(a => a.user_id === athleteId);

    if (athlete) {
      // Open the message drawer with athlete info
      // Use avatar_url with fallbacks to profile_photo and profile_image_url
      const avatarUrl = athlete.avatar_url || athlete.profile_photo || (athlete as Record<string, unknown>).profile_image_url as string || undefined;
      openDrawer({
        id: athleteId,
        name: athlete.full_name || athlete.display_name || 'Athlete',
        handle: athlete.username,
        avatar: avatarUrl,
        meta: [athlete.sport, athlete.school_name].filter(Boolean).join(' • '),
        profileUrl: athlete.username ? `/athletes/${athlete.username}` : undefined,
      });
    } else {
      // Fallback: open drawer with minimal info
      openDrawer({
        id: athleteId,
        name: 'Athlete',
      });
    }
  };

  // Load more when page changes
  useEffect(() => {
    if (page > 1 && user?.role === 'agency') {
      fetchAthletesWithMatches(false);
    }
  }, [page]);

  if (user?.role !== 'agency') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
      />

      <div className="max-w-[1600px] mx-auto">
        {/* Page Header - Full Width */}
        <div className="px-6 py-6 bg-white border-b border-gray-200">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold text-gray-900">Discover Athletes</h1>
            <p className="text-gray-500 mt-1">Find and connect with high-performing athletes for your campaigns</p>
          </motion.div>
        </div>

        {/* Stats Row - Full Width */}
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DiscoveryStats />
          </motion.div>
        </div>

        {/* Main Content - Sidebar + Results */}
        <div className="flex">
          {/* Left Sidebar - Filters (Hidden on mobile) */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block w-[280px] xl:w-[300px] flex-shrink-0 border-r border-gray-200 bg-white h-[calc(100vh-200px)] sticky top-0 overflow-y-auto"
          >
            <DiscoverSidebar
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
            />
          </motion.aside>

          {/* Right Content - Results */}
          <main className="flex-1 min-w-0 p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {initialLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"
                    />
                    <p className="text-gray-600 font-medium">Finding your best matches...</p>
                    <p className="text-sm text-gray-400 mt-1">Analyzing athletes and calculating match scores</p>
                  </div>
                </div>
              ) : (
                <DiscoverResults
                  athletes={athletes}
                  isLoading={loading && athletes.length === 0}
                  onSaveAthlete={handleSaveAthlete}
                  onMessageAthlete={handleMessageAthlete}
                  savedAthleteIds={savedAthletes}
                  onRefresh={handleRefresh}
                  onOpenMobileFilters={() => setMobileFiltersOpen(true)}
                  activeFilterCount={activeFilterCount}
                />
              )}

              {/* Load More Button */}
              {hasMore && athletes.length > 0 && !initialLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-10 text-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>Load More Athletes</span>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
