'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AthletePublicProfile, AthleteDiscoveryFilters } from '@/types';
import { DiscoveryStats } from '@/components/agency/DiscoveryStats';
import { FeaturedAthleteHero } from '@/components/agency/FeaturedAthleteHero';
import { DiscoverFilters } from '@/components/agency/DiscoverFilters';
import { AthleteDiscoveryCard } from '@/components/agency/AthleteDiscoveryCard';
import { ArrowUpDown, Loader2, Sparkles, Grid, LayoutGrid, ChevronRight } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

      const res = await fetch(`/api/agency/athletes/discover?${queryParams}`);
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
        // Success feedback - subtle toast instead of alert
      } else {
        // Revert optimistic update on error
        setSavedAthletes(prev => {
          const newSet = new Set(prev);
          newSet.delete(athleteId);
          return newSet;
        });

        // Handle specific error cases
        if (res.status === 409) {
          // Already saved - re-add
          setSavedAthletes(prev => new Set(prev).add(athleteId));
        }
      }
    } catch (error) {
      console.error('Error saving athlete:', error);
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
        router.push('/agency/messages');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
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
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-white to-warm-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Athletes</h1>
          <p className="text-gray-500">Find and connect with high-performing athletes for your campaigns</p>
        </motion.div>

        {/* Section 1: Smart Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DiscoveryStats />
        </motion.div>

        {/* Section 2: Featured AI Match - HERO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FeaturedAthleteHero
            onSaveAthlete={handleSaveAthlete}
            onMessageAthlete={handleMessageAthlete}
          />
        </motion.div>

        {/* Section 3: More Matches Grid + Section 4: Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-6">
              <DiscoverFilters
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={handleSearch}
              />
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Section Header with Sort Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white/70 backdrop-blur-sm rounded-xl border border-white/40 px-5 py-4 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  More Matches
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {athletes.length > 0 ? (
                    <span>
                      Showing <span className="font-semibold text-gray-700">{athletes.length}</span> athletes
                    </span>
                  ) : loading ? (
                    <span>Finding athletes...</span>
                  ) : (
                    <span>No athletes found</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Sort buttons */}
                <div className="flex items-center gap-1 bg-gray-100/80 rounded-lg p-1">
                  <span className="text-xs text-gray-500 px-2 hidden sm:block">Sort:</span>
                  {[
                    { key: 'followers', label: 'Followers' },
                    { key: 'engagement', label: 'Engagement' },
                    { key: 'fmv', label: 'Value' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => handleSortChange(key as typeof sortBy)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        sortBy === key
                          ? 'bg-white text-purple-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {label}
                      {sortBy === key && (
                        <ArrowUpDown className="w-3 h-3" />
                      )}
                    </button>
                  ))}
                </div>

                {/* View mode toggle */}
                <div className="flex items-center bg-gray-100/80 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Athletes Grid */}
            {loading && athletes.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"
                  />
                  <p className="text-gray-600 font-medium">Finding athletes...</p>
                  <p className="text-sm text-gray-400 mt-1">This won't take long</p>
                </div>
              </div>
            ) : athletes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/40"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🔍</span>
                </div>
                <p className="text-gray-700 mb-2 text-lg font-semibold">No athletes found</p>
                <p className="text-gray-500 text-sm mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <button
                  onClick={() => {
                    setFilters({});
                    fetchAthletes(true);
                  }}
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  layout
                  className={`grid gap-5 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                      : 'grid-cols-1'
                  }`}
                >
                  <AnimatePresence mode="popLayout">
                    {athletes.map((athlete, index) => (
                      <motion.div
                        key={athlete.user_id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <AthleteDiscoveryCard
                          athlete={athlete}
                          onSave={() => handleSaveAthlete(athlete.user_id)}
                          onMessage={() => handleMessageAthlete(athlete.user_id)}
                          isSaved={savedAthletes.has(athlete.user_id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Load More Button */}
                {hasMore && (
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
                        <>
                          <span>Load More Athletes</span>
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
