'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AthletePublicProfile, AthleteDiscoveryFilters } from '@/types';
import { DiscoveryStats } from '@/components/agencies/DiscoveryStats';
import { AIRecommendations } from '@/components/agencies/AIRecommendations';
import { DiscoverFilters } from '@/components/agencies/DiscoverFilters';
import { AthleteDiscoveryCard } from '@/components/agencies/AthleteDiscoveryCard';
import { ArrowUpDown, Loader2 } from 'lucide-react';

export default function DiscoverPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [athletes, setAthletes] = useState<AthletePublicProfile[]>([]);
  const [filters, setFilters] = useState<AthleteDiscoveryFilters>({});
  const [sortBy, setSortBy] = useState<'followers' | 'engagement' | 'fmv'>('followers');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [savedAthletes, setSavedAthletes] = useState<Set<string>>(new Set());

  // Redirect if not an agency
  useEffect(() => {
    if (user && user.role !== 'agency') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'agency') {
      fetchAthletes(true);
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

  async function fetchAthletes(reset = false) {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const queryParams = new URLSearchParams();

      if (filters.search) queryParams.set('search', filters.search);

      // Array filters - use bracket notation for backend compatibility
      filters.sports?.forEach(s => queryParams.append('sports[]', s));
      filters.states?.forEach(s => queryParams.append('states[]', s));
      filters.school_levels?.forEach(s => queryParams.append('school_levels[]', s));
      filters.content_categories?.forEach(c => queryParams.append('content_categories[]', c));

      // Numeric filters
      if (filters.min_followers) queryParams.set('min_followers', filters.min_followers.toString());
      if (filters.max_followers) queryParams.set('max_followers', filters.max_followers.toString());
      if (filters.min_fmv) queryParams.set('min_fmv', filters.min_fmv.toString());
      if (filters.max_fmv) queryParams.set('max_fmv', filters.max_fmv.toString());
      if (filters.min_engagement) queryParams.set('min_engagement', filters.min_engagement.toString());
      if (filters.available_only) queryParams.set('available_only', 'true');

      // Sort - combine into single parameter for backend compatibility
      const sortParam = `${sortBy}_${sortOrder}`;
      queryParams.set('sort', sortParam);
      queryParams.set('page', currentPage.toString());
      queryParams.set('limit', '12');

      const res = await fetch(`/api/agencies/athletes/discover?${queryParams}`);
      const response = await res.json();

      // Handle the nested response structure
      const data = response.success ? response.data : response;
      const athletesList = data.athletes || [];

      if (reset) {
        setAthletes(athletesList);
        setPage(1);
      } else {
        setAthletes([...athletes, ...athletesList]);
      }

      // Check if there are more pages
      const hasMore = data.pagination
        ? data.pagination.hasNextPage
        : (data.has_more || false);
      setHasMore(hasMore);
    } catch (error) {
      console.error('Error fetching athletes:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = () => {
    fetchAthletes(true);
  };

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  const handleSaveAthlete = async (athleteId: string) => {
    if (!user) return;

    // Optimistic update
    setSavedAthletes(prev => new Set(prev).add(athleteId));

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

      if (res.ok) {
        // Success feedback
        alert('✓ Athlete saved to roster!');
      } else {
        // Revert optimistic update on error
        setSavedAthletes(prev => {
          const newSet = new Set(prev);
          newSet.delete(athleteId);
          return newSet;
        });

        // Handle specific error cases
        if (res.status === 409) {
          alert('ℹ️ Athlete is already in your roster');
          // Re-add since it was already saved
          setSavedAthletes(prev => new Set(prev).add(athleteId));
        } else {
          alert(`❌ ${data.error || 'Failed to save athlete'}`);
        }
      }
    } catch (error) {
      console.error('Error saving athlete:', error);
      alert('❌ Failed to save athlete. Please try again.');

      // Revert optimistic update
      setSavedAthletes(prev => {
        const newSet = new Set(prev);
        newSet.delete(athleteId);
        return newSet;
      });
    }
  };

  const handleMessageAthlete = async (athleteId: string) => {
    try {
      // Create a thread with a welcome message
      const res = await fetch('/api/agency/messages/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athlete_user_id: athleteId,
          message_text: "Hi! I'd like to discuss a potential partnership opportunity with you."
        })
      });

      if (res.ok) {
        // Navigate to messages page
        router.push('/agencies/messages');
      } else {
        alert('❌ Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('❌ Failed to start conversation');
    }
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  useEffect(() => {
    if (page > 1 && user?.role === 'agency') {
      fetchAthletes(false);
    }
  }, [page]);

  useEffect(() => {
    if (user?.role === 'agency') {
      fetchAthletes(true);
    }
  }, [sortBy, sortOrder]);

  if (user?.role !== 'agency') {
    return null;
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Discovery Stats */}
        <DiscoveryStats />

        {/* AI Recommendations */}
        <AIRecommendations
          onSaveAthlete={handleSaveAthlete}
          onMessageAthlete={handleMessageAthlete}
        />

        {/* Main Content: Filters + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <DiscoverFilters
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={handleSearch}
              />
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm">
              <div className="text-sm text-gray-600">
                {athletes.length > 0 ? (
                  <span>
                    Showing <span className="font-semibold text-gray-900">{athletes.length}</span> athletes
                  </span>
                ) : loading ? (
                  <span>Loading...</span>
                ) : (
                  <span>No athletes found</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <button
                  onClick={() => handleSortChange('followers')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'followers'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Followers
                  {sortBy === 'followers' && (
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => handleSortChange('engagement')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'engagement'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Engagement
                  {sortBy === 'engagement' && (
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => handleSortChange('fmv')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'fmv'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Value
                  {sortBy === 'fmv' && (
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Athletes Grid */}
            {loading && athletes.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-600">Finding athletes...</p>
                </div>
              </div>
            ) : athletes.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 mb-2 text-lg font-medium">No athletes found</p>
                <p className="text-gray-500 text-sm">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {athletes.map((athlete) => (
                    <AthleteDiscoveryCard
                      key={athlete.user_id}
                      athlete={athlete}
                      onSave={() => handleSaveAthlete(athlete.user_id)}
                      onMessage={() => handleMessageAthlete(athlete.user_id)}
                      isSaved={savedAthletes.has(athlete.user_id)}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <span>Load More Athletes</span>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
