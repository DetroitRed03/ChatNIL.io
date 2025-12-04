'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, X, Search, Zap, Target, TrendingUp } from 'lucide-react';
import { AthleteDiscoveryCard } from './AthleteDiscoveryCard';
import { AgencyAthleteMatch, AthletePublicProfile } from '@/types';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';

interface AIRecommendationsProps {
  onSaveAthlete?: (athleteId: string) => void;
  onMessageAthlete?: (athleteId: string) => void;
}

interface EnrichedMatch extends AgencyAthleteMatch {
  athlete?: AthletePublicProfile;
}

// Scanning messages shown during generation
const SCANNING_MESSAGES = [
  { icon: Search, text: 'Scanning athlete database...' },
  { icon: Target, text: 'Analyzing brand alignment...' },
  { icon: TrendingUp, text: 'Evaluating engagement metrics...' },
  { icon: Zap, text: 'Calculating match scores...' },
  { icon: Sparkles, text: 'Finding your perfect matches...' },
];

export function AIRecommendations({ onSaveAthlete, onMessageAthlete }: AIRecommendationsProps) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading state while checking for existing matches
  const [generating, setGenerating] = useState(false);
  const [scanningPhase, setScanningPhase] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isNewGeneration, setIsNewGeneration] = useState(false); // Track if user clicked generate

  // Check if user has existing matches on mount and display them
  useEffect(() => {
    if (user?.id) {
      loadExistingMatches();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  // Cycle through scanning messages during generation
  useEffect(() => {
    if (!generating) return;

    const interval = setInterval(() => {
      setScanningPhase(prev => (prev + 1) % SCANNING_MESSAGES.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [generating]);

  // Reveal matches one by one after generation
  useEffect(() => {
    if (!hasGenerated || matches.length === 0 || revealedCount >= matches.length) {
      // Trigger celebration ONLY when user clicked Generate (not on page load with existing matches)
      if (isNewGeneration && matches.length > 0 && revealedCount === matches.length && revealedCount > 0) {
        setShowCelebration(true);
        setIsNewGeneration(false); // Reset so it doesn't trigger again on refresh
        // Auto-hide celebration after 3 seconds
        setTimeout(() => setShowCelebration(false), 3000);
      }
      return;
    }

    const timeout = setTimeout(() => {
      setRevealedCount(prev => prev + 1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [hasGenerated, matches.length, revealedCount, isNewGeneration]);

  async function loadExistingMatches() {
    // Load existing matches from database and display them immediately
    // This provides persistence across page refreshes and navigation
    console.log('🔍 [AIRecommendations] Checking for existing matches...');

    try {
      const res = await fetch(`/api/matches?limit=10&userId=${user?.id}`);
      const data = await res.json();

      if (data.matches && data.matches.length > 0) {
        console.log(`✅ [AIRecommendations] Found ${data.matches.length} existing matches - displaying immediately`);

        // Transform and set matches
        const transformed = transformAndSetMatches(data.matches);

        // Show all matches immediately (no animation for returning users)
        setHasGenerated(true);
        setRevealedCount(transformed.length); // Show all cards immediately
        // Don't set isNewGeneration - we don't want confetti on page load
      } else {
        console.log('📭 [AIRecommendations] No existing matches - showing generate button');
      }
    } catch (error) {
      console.error('❌ [AIRecommendations] Error loading existing matches:', error);
    } finally {
      setLoading(false);
    }
  }

  // Transform API matches to component format
  function transformAndSetMatches(apiMatches: any[]) {
    const transformedMatches = apiMatches
      .filter((m: any) => m.athlete)
      .map((match: any) => ({
        ...match,
        athlete: {
          ...match.athlete,
          user_id: match.athlete.id,
          username: match.athlete.username,
          display_name: match.athlete.display_name || match.athlete.name || `${match.athlete.first_name || ''} ${match.athlete.last_name || ''}`.trim(),
          sport: match.athlete.primary_sport,
          // Flat fields from athlete_public_profiles (enriched by API)
          school_name: match.athlete.school_name,
          year: match.athlete.graduation_year, // Map graduation_year to year for AthleteDiscoveryCard
          graduation_year: match.athlete.graduation_year,
          instagram_followers: match.athlete.instagram_followers || 0,
          tiktok_followers: match.athlete.tiktok_followers || 0,
          twitter_followers: match.athlete.twitter_followers || 0,
          youtube_subscribers: match.athlete.youtube_subscribers || 0,
          total_followers: match.athlete.total_followers || 0,
          avg_engagement_rate: match.athlete.avg_engagement_rate || 0,
          estimated_fmv_min: match.athlete.estimated_fmv_min,
          estimated_fmv_max: match.athlete.estimated_fmv_max,
          is_available_for_partnerships: match.athlete.is_available_for_partnerships ?? true,
          profile_image_url: match.athlete.profile_image_url,
          cover_image_url: match.athlete.cover_image_url,
          bio: match.athlete.bio,
          // FMV data from athlete_fmv_data table
          fmv_score: match.athlete.fmv_score,
          fmv_tier: match.athlete.fmv_tier,
          percentile_rank: match.athlete.percentile_rank
        }
      }));

    setMatches(transformedMatches);
    return transformedMatches;
  }

  async function fetchMatches() {
    console.log('🔄 [AIRecommendations] Fetching matches...');

    if (!user?.id) {
      console.log('⚠️ [AIRecommendations] No user ID available');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/matches?limit=10&userId=${user.id}`);
      const data = await res.json();

      console.log('📊 [AIRecommendations] Fetched matches:', data);

      if (data.matches && data.matches.length > 0) {
        console.log(`✅ [AIRecommendations] Found ${data.matches.length} matches`);
        transformAndSetMatches(data.matches);
      } else {
        console.log('⚠️ [AIRecommendations] No matches found');
        setMatches([]);
      }
    } catch (error) {
      console.error('❌ [AIRecommendations] Error fetching matches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  async function generateMatches() {
    setGenerating(true);
    setError(null);
    setSuccess(null);
    setRevealedCount(0); // Reset reveal count for new generation
    setScanningPhase(0);
    setShowCelebration(false); // Reset celebration
    setIsNewGeneration(true); // Mark this as a user-initiated generation (for confetti)

    console.log('🎯 [AIRecommendations] Starting match generation...');

    if (!user?.id) {
      setError('Please log in to generate matches');
      setGenerating(false);
      return;
    }

    try {
      const res = await fetch('/api/matches/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      console.log('📡 [AIRecommendations] API Response Status:', res.status, res.statusText);

      const data = await res.json();
      console.log('📊 [AIRecommendations] API Response Data:', data);

      if (res.ok) {
        const count = data.matchesCreated || 0;

        if (count === 0) {
          setSuccess('Match generation completed, but no high-quality matches found. Try adjusting your agency profile or preferences.');
          console.log('⚠️ [AIRecommendations] Zero matches created');
          setGenerating(false);
        } else {
          // Fetch fresh matches and trigger reveal animation
          const fetchRes = await fetch(`/api/matches?limit=10&userId=${user.id}`);
          const fetchData = await fetchRes.json();

          if (fetchData.matches && fetchData.matches.length > 0) {
            const transformed = transformAndSetMatches(fetchData.matches);
            setHasGenerated(true);
            setRevealedCount(0); // Start reveal from 0 to animate each card

            setSuccess(`Found ${transformed.length} athlete${transformed.length === 1 ? '' : 's'} matching your criteria!`);
          }

          console.log(`✅ [AIRecommendations] Created ${count} matches`);
        }

        // Auto-dismiss success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        // Handle different error status codes
        let errorMessage = 'Failed to generate matches. Please try again.';

        if (res.status === 404) {
          errorMessage = 'No athletes found in the system. Please check back later.';
        } else if (res.status === 403) {
          errorMessage = 'You do not have permission to generate matches. Please ensure you have an agency account.';
        } else if (res.status === 500) {
          errorMessage = data.message || 'Server error occurred. Please try again later.';
        } else if (data.error) {
          errorMessage = data.error;
        }

        setError(errorMessage);
        console.error('❌ [AIRecommendations] Generation failed:', errorMessage);
        console.error('📋 [AIRecommendations] Full error data:', data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? `Network error: ${error.message}`
        : 'Unable to connect to the server. Please check your connection and try again.';

      setError(errorMessage);
      console.error('💥 [AIRecommendations] Exception caught:', error);

      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
    } finally {
      setGenerating(false);
      console.log('🏁 [AIRecommendations] Match generation process complete');
    }
  }

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('recommendations-scroll');
    if (!container) return;

    const scrollAmount = 400;
    const newPosition = direction === 'left'
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;

    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);

    // Update scroll button states
    setTimeout(() => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }, 300);
  };

  // Match tier thresholds aligned with matchmaking-engine.ts
  const getMatchTier = (score: number): 'excellent' | 'good' | 'potential' => {
    if (score >= 75) return 'excellent';  // 75+ in engine
    if (score >= 55) return 'good';       // 55-74 in engine
    return 'potential';                   // <55 in engine (includes poor scores)
  };

  // Show scanning animation during generation
  if (generating) {
    const CurrentIcon = SCANNING_MESSAGES[scanningPhase].icon;
    return (
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900 via-purple-800 to-pink-900 rounded-2xl p-8 border border-purple-500/30 shadow-xl text-center relative overflow-hidden"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                initial={{
                  x: Math.random() * 100 + '%',
                  y: '100%',
                  opacity: 0
                }}
                animate={{
                  y: '-10%',
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>

          {/* Scanning animation */}
          <div className="relative z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 p-1"
            >
              <div className="w-full h-full rounded-full bg-purple-900 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={scanningPhase}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CurrentIcon className="w-8 h-8 text-white" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.p
                key={scanningPhase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-lg font-medium text-white mb-2"
              >
                {SCANNING_MESSAGES[scanningPhase].text}
              </motion.p>
            </AnimatePresence>

            <p className="text-purple-200 text-sm">
              Analyzing thousands of data points to find your perfect matches
            </p>

            {/* Progress bar */}
            <div className="mt-6 max-w-xs mx-auto">
              <div className="h-1.5 bg-purple-950 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 7, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50 shadow-sm">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - entice user to generate
  if (!hasGenerated && matches.length === 0) {
    return (
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 rounded-2xl p-8 border border-purple-500/30 shadow-xl text-center relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
          <div className="absolute bottom-4 right-4 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            <h3 className="text-2xl font-bold text-white mb-3">
              Discover Your Perfect Athletes
            </h3>
            <p className="text-purple-200 mb-8 max-w-lg mx-auto leading-relaxed">
              Our AI analyzes <span className="text-white font-semibold">11 key factors</span> including engagement rates,
              brand alignment, and audience demographics to find athletes who will drive real results for your campaigns.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { icon: Target, label: 'Brand Fit Analysis' },
                { icon: TrendingUp, label: 'Engagement Scoring' },
                { icon: Zap, label: 'Real-time Matching' }
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm text-purple-200">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateMatches}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-400 hover:to-pink-400 transition-all font-semibold text-lg shadow-lg shadow-purple-500/25"
            >
              <Sparkles className="w-6 h-6" />
              <span>Generate AI Matches</span>
            </motion.button>

            <p className="text-purple-300/60 text-xs mt-4">
              Takes about 5-10 seconds to analyze
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // No matches found after generation
  if (hasGenerated && matches.length === 0) {
    return (
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200 shadow-sm text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Matches Found
          </h3>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            We couldn't find athletes matching your criteria. Try adjusting your agency profile or campaign preferences.
          </p>
          <button
            onClick={generateMatches}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-red-900 text-sm mb-1">Error Generating Matches</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Banner */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-green-900 text-sm mb-1">Success!</h4>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Confetti Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {/* Confetti particles */}
            {[...Array(50)].map((_, i) => {
              const colors = ['#9333ea', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
              const color = colors[Math.floor(Math.random() * colors.length)];
              const size = 8 + Math.random() * 8;
              const left = Math.random() * 100;
              const delay = Math.random() * 0.5;
              const duration = 2 + Math.random() * 2;

              return (
                <motion.div
                  key={`confetti-${i}`}
                  className="absolute"
                  style={{
                    left: `${left}%`,
                    top: -20,
                    width: size,
                    height: size,
                    backgroundColor: color,
                    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                  initial={{ y: 0, opacity: 1, rotate: 0 }}
                  animate={{
                    y: '100vh',
                    opacity: [1, 1, 0],
                    rotate: Math.random() > 0.5 ? 720 : -720,
                    x: (Math.random() - 0.5) * 200
                  }}
                  transition={{
                    duration,
                    delay,
                    ease: 'easeOut'
                  }}
                />
              );
            })}

            {/* Celebration text */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-2xl border border-purple-200">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="text-center"
                >
                  <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Perfect Matches Found!
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {matches.length} athletes ready to connect
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50 shadow-sm relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                AI-Recommended Athletes
              </h3>
              <p className="text-sm text-gray-600">
                {revealedCount < matches.length ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      key={revealedCount}
                      initial={{ scale: 1.5, color: '#9333ea' }}
                      animate={{ scale: 1, color: '#4b5563' }}
                      className="font-semibold"
                    >
                      {revealedCount}
                    </motion.span>
                    <span>of {matches.length} athletes found...</span>
                  </span>
                ) : (
                  `Top ${matches.length} matches based on your preferences`
                )}
              </p>
            </div>
          </div>

          <button
            onClick={generateMatches}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-purple-200 text-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Matches</span>
              </>
            )}
          </button>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Cards Container */}
          <div
            id="recommendations-scroll"
            className="overflow-x-auto hide-scrollbar scroll-smooth"
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              setScrollPosition(target.scrollLeft);
              setCanScrollLeft(target.scrollLeft > 0);
              setCanScrollRight(
                target.scrollLeft < target.scrollWidth - target.clientWidth - 10
              );
            }}
          >
            <div className="flex gap-4 pb-2">
              <AnimatePresence mode="popLayout">
                {matches.slice(0, revealedCount).map((match, index) => (
                  <motion.div
                    key={match.id || `match-${index}`}
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        delay: 0.1
                      }
                    }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    className="flex-shrink-0 w-80"
                  >
                    {/* Card glow effect on reveal */}
                    <motion.div
                      initial={{ boxShadow: '0 0 0 0 rgba(168, 85, 247, 0)' }}
                      animate={{
                        boxShadow: [
                          '0 0 0 0 rgba(168, 85, 247, 0)',
                          '0 0 30px 10px rgba(168, 85, 247, 0.3)',
                          '0 0 0 0 rgba(168, 85, 247, 0)'
                        ]
                      }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="rounded-2xl"
                    >
                      <AthleteDiscoveryCard
                        athlete={match.athlete!}
                        matchScore={Math.round(match.match_score)}
                        matchTier={getMatchTier(match.match_score)}
                        onSave={() => onSaveAthlete?.(match.athlete_id)}
                        onMessage={() => onMessageAthlete?.(match.athlete_id)}
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Placeholder slots for unrevealed matches */}
              {revealedCount < matches.length && (
                <AnimatePresence>
                  {[...Array(Math.min(3, matches.length - revealedCount))].map((_, i) => (
                    <motion.div
                      key={`placeholder-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-shrink-0 w-80"
                    >
                      <div className="h-[400px] rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-dashed border-purple-300 flex items-center justify-center">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-center"
                        >
                          <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                          <span className="text-purple-500 font-medium text-sm">
                            Revealing...
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
