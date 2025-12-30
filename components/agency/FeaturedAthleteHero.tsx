'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Instagram,
  Music,
  Twitter,
  Youtube,
  Bookmark,
  BookmarkCheck,
  MessageCircle,
  Eye,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  MapPin,
  DollarSign,
  TrendingUp,
  Target,
  Zap,
  Search
} from 'lucide-react';
import { AthletePublicProfile, AgencyAthleteMatch } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import confetti from 'canvas-confetti';

interface FeaturedAthleteHeroProps {
  onSaveAthlete?: (athleteId: string) => void;
  onMessageAthlete?: (athleteId: string) => void;
  isSaved?: boolean;
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
  { icon: Sparkles, text: 'Finding your perfect match...' },
];

export function FeaturedAthleteHero({ onSaveAthlete, onMessageAthlete, isSaved = false }: FeaturedAthleteHeroProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [topMatch, setTopMatch] = useState<EnrichedMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scanningPhase, setScanningPhase] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(isSaved);

  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  // Load existing top match on mount
  useEffect(() => {
    if (user?.id) {
      loadTopMatch();
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

  async function loadTopMatch() {
    try {
      const res = await fetch(`/api/matches?limit=1&userId=${user?.id}`);
      const data = await res.json();

      if (data.matches && data.matches.length > 0) {
        const match = data.matches[0];
        setTopMatch({
          ...match,
          athlete: transformAthlete(match.athlete)
        });
      }
    } catch (error) {
      console.error('Error loading top match:', error);
    } finally {
      setLoading(false);
    }
  }

  function transformAthlete(athlete: any): AthletePublicProfile {
    return {
      ...athlete,
      user_id: athlete.id,
      username: athlete.username,
      display_name: athlete.display_name || athlete.name || `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim(),
      sport: athlete.primary_sport,
      school_name: athlete.school_name,
      year: athlete.graduation_year,
      graduation_year: athlete.graduation_year,
      instagram_followers: athlete.instagram_followers || 0,
      tiktok_followers: athlete.tiktok_followers || 0,
      twitter_followers: athlete.twitter_followers || 0,
      youtube_subscribers: athlete.youtube_subscribers || 0,
      total_followers: athlete.total_followers || 0,
      avg_engagement_rate: athlete.avg_engagement_rate || 0,
      estimated_fmv_min: athlete.estimated_fmv_min,
      estimated_fmv_max: athlete.estimated_fmv_max,
      is_available_for_partnerships: athlete.is_available_for_partnerships ?? true,
      profile_image_url: athlete.profile_image_url,
      bio: athlete.bio,
      fmv_score: athlete.fmv_score,
      fmv_tier: athlete.fmv_tier,
      state: athlete.state,
    };
  }

  async function generateMatches() {
    setGenerating(true);
    setError(null);
    setScanningPhase(0);

    if (!user?.id) {
      setError('Please log in to generate matches');
      setGenerating(false);
      return;
    }

    try {
      const res = await fetch('/api/matches/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (res.ok && data.matchesCreated > 0) {
        // Fetch fresh top match
        const fetchRes = await fetch(`/api/matches?limit=1&userId=${user.id}`);
        const fetchData = await fetchRes.json();

        if (fetchData.matches && fetchData.matches.length > 0) {
          const match = fetchData.matches[0];
          setTopMatch({
            ...match,
            athlete: transformAthlete(match.athlete)
          });

          // Trigger celebration
          setShowCelebration(true);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#9333ea', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']
          });
          setTimeout(() => setShowCelebration(false), 3000);
        }
      } else if (data.matchesCreated === 0) {
        setError('No matches found. Try adjusting your preferences.');
      }
    } catch (error) {
      setError('Failed to generate matches. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  const formatNumber = (num?: number) => {
    if (!num && num !== 0) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num?: number) => {
    if (!num) return 'N/A';
    return `$${(num / 1000).toFixed(0)}K`;
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSave = () => {
    if (topMatch?.athlete) {
      setSaved(!saved);
      onSaveAthlete?.(topMatch.athlete_id);
    }
  };

  const handleMessage = () => {
    if (topMatch?.athlete) {
      onMessageAthlete?.(topMatch.athlete_id);
    }
  };

  const handleViewProfile = () => {
    if (topMatch?.athlete) {
      const profileId = topMatch.athlete.username || topMatch.athlete.user_id;
      router.push(`/athletes/${profileId}`);
    }
  };

  // Generating state
  if (generating) {
    const CurrentIcon = SCANNING_MESSAGES[scanningPhase].icon;
    return (
      <section className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-900 via-orange-800 to-amber-900 rounded-2xl p-12 border border-orange-500/30 shadow-xl text-center relative overflow-hidden"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                initial={{ x: Math.random() * 100 + '%', y: '100%', opacity: 0 }}
                animate={{ y: '-10%', opacity: [0, 1, 0] }}
                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 p-1"
            >
              <div className="w-full h-full rounded-full bg-orange-900 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={scanningPhase}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <CurrentIcon className="w-10 h-10 text-white" />
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
                className="text-xl font-medium text-white mb-2"
              >
                {SCANNING_MESSAGES[scanningPhase].text}
              </motion.p>
            </AnimatePresence>

            <p className="text-orange-200">Finding your perfect athlete match</p>

            <div className="mt-8 max-w-sm mx-auto">
              <div className="h-2 bg-orange-950 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 7, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  // Loading state
  if (loading) {
    return (
      <section className="mb-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse">
          <div className="grid md:grid-cols-2">
            <div className="h-80 md:h-96 bg-gradient-to-br from-orange-200 to-amber-200" />
            <div className="p-8 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-32 bg-gray-100 rounded-xl" />
              <div className="flex gap-4">
                <div className="h-16 bg-gray-200 rounded flex-1" />
                <div className="h-16 bg-gray-200 rounded flex-1" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state - no matches yet
  if (!topMatch) {
    return (
      <section className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-900 via-amber-900 to-orange-800 rounded-2xl p-12 border border-orange-500/30 shadow-xl text-center relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-4 right-4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Find Your Perfect Athlete Partner
            </h2>
            <p className="text-orange-200 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
              Our AI analyzes <span className="text-white font-semibold">engagement rates, brand alignment, and audience demographics</span> to find athletes who will drive real ROI for your campaigns.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {[
                { icon: Target, label: 'Brand Fit Analysis' },
                { icon: TrendingUp, label: 'ROI Prediction' },
                { icon: Zap, label: 'Instant Matching' }
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-orange-200">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateMatches}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-400 hover:to-amber-400 transition-all font-bold text-lg shadow-lg shadow-orange-500/25"
            >
              <Sparkles className="w-6 h-6" />
              <span>Find My Perfect Match</span>
            </motion.button>

            <p className="text-orange-300/60 text-sm mt-6">
              Takes about 5-10 seconds to analyze your brand profile
            </p>
          </div>
        </motion.div>
      </section>
    );
  }

  const athlete = topMatch.athlete!;
  const matchScore = Math.round(topMatch.match_score);

  // Main hero with featured athlete
  return (
    <section className="mb-10">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl px-10 py-8 shadow-2xl border border-orange-200"
            >
              <Sparkles className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Perfect Match Found!
              </h3>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Top Match</h2>
          <p className="text-gray-500">AI-recommended based on your brand profile</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateMatches}
          disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 border border-orange-200 text-orange-700 rounded-xl transition-colors font-medium shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          <span>Refresh Match</span>
        </motion.button>
      </div>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
      >
        <div className="grid md:grid-cols-2">
          {/* Left: Large athlete visual */}
          <div className="relative h-80 md:h-auto md:min-h-[400px] bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            </div>

            {/* Avatar */}
            <div className="absolute inset-0 flex items-center justify-center">
              {athlete.profile_image_url ? (
                <div className="w-40 h-40 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden">
                  <img
                    src={athlete.profile_image_url}
                    alt={athlete.display_name || 'Athlete'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-40 h-40 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white text-5xl font-bold shadow-2xl">
                  {getInitials(athlete.display_name)}
                </div>
              )}
            </div>

            {/* Match score badge - prominent */}
            <div className="absolute top-6 left-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                className="bg-white rounded-2xl px-5 py-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-orange-600">{matchScore}%</span>
                  <span className="text-sm text-gray-500 font-medium">match</span>
                </div>
              </motion.div>
            </div>

            {/* Available badge */}
            {athlete.is_available_for_partnerships && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                className="absolute top-6 right-6"
              >
                <div className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Available</span>
                </div>
              </motion.div>
            )}

            {/* Sport badge */}
            <div className="absolute bottom-6 left-6">
              <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                {athlete.sport} {athlete.position && `· ${athlete.position}`}
              </div>
            </div>
          </div>

          {/* Right: Athlete details */}
          <div className="p-8 flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {athlete.display_name || 'Athlete'}
                </h3>
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{athlete.school_name || 'School'}</span>
                  {athlete.state && <span>· {athlete.state}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {athlete.fmv_score ? formatCurrency(athlete.fmv_score) :
                   athlete.estimated_fmv_min ? formatCurrency(athlete.estimated_fmv_min) : 'N/A'}
                </div>
                <div className="text-sm text-gray-500">Est. FMV</div>
              </div>
            </div>

            {/* Why they match - THE KEY DIFFERENTIATOR */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 mb-6 border border-orange-100">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-600" />
                Why {athlete.display_name?.split(' ')[0] || 'they'} is perfect for your brand:
              </h4>
              <ul className="space-y-2.5">
                {topMatch.match_reasons?.slice(0, 3).map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-orange-600" />
                    </span>
                    <span>{reason}</span>
                  </li>
                )) || (
                  <>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-orange-600" />
                      </span>
                      <span>High engagement rate of {athlete.avg_engagement_rate?.toFixed(1) || '0'}%</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-orange-600" />
                      </span>
                      <span>{formatNumber(athlete.total_followers || 0)} combined followers</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-orange-600" />
                      </span>
                      <span>Available for partnerships</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Social proof row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {athlete.instagram_followers && athlete.instagram_followers > 0 && (
                <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                  <Instagram className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                  <div className="font-bold text-gray-900">{formatNumber(athlete.instagram_followers)}</div>
                </div>
              )}
              {athlete.tiktok_followers && athlete.tiktok_followers > 0 && (
                <div className="text-center p-3 bg-gray-900 rounded-xl">
                  <Music className="w-4 h-4 text-white mx-auto mb-1" />
                  <div className="font-bold text-white">{formatNumber(athlete.tiktok_followers)}</div>
                </div>
              )}
              {athlete.twitter_followers && athlete.twitter_followers > 0 && (
                <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <Twitter className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <div className="font-bold text-gray-900">{formatNumber(athlete.twitter_followers)}</div>
                </div>
              )}
              <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <div className="font-bold text-gray-900">{athlete.avg_engagement_rate?.toFixed(1) || '0'}%</div>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-grow" />

            {/* CTA Buttons - Premium feel */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMessage}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/25"
              >
                Start Conversation
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleViewProfile}
                className="flex-1 border-2 border-gray-200 hover:border-orange-300 font-semibold py-3.5 px-6 rounded-xl transition-all text-gray-700 hover:text-orange-700"
              >
                View Full Profile
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className={`w-14 h-14 border-2 rounded-xl flex items-center justify-center transition-all ${
                  saved
                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                    : 'border-gray-200 hover:border-orange-300 text-gray-500 hover:text-orange-600'
                }`}
              >
                {saved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
