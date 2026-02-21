'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  GraduationCap,
  Trophy,
  Instagram,
  Twitter,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  Award,
  Heart,
  Share2,
  MessageCircle,
  Download,
  CheckCircle2,
  Clock,
  Music,
  Target,
  Sparkles,
  FileText,
  Mail,
  MapPin,
  Plane,
  Calendar,
  Package,
  Ruler,
  Weight,
  Hash,
  Scale,
  AlertTriangle,
  Shield,
  Video,
  Star,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress';
import { useAuth } from '@/contexts/AuthContext';
import { useMessageDrawer } from '@/contexts/MessageDrawerContext';
import {
  fetchProfileByUsername,
  formatFollowerCount,
  formatEngagementRate,
  formatFMV,
  calculateEstimatedFMV,
  getProfileStrength,
  type ProfileData,
} from '@/lib/profile-data';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { PortfolioGrid } from '@/components/profile/reusable/PortfolioItemCard';

// Helper functions for athlete stats
function formatHeight(inches: number | null | undefined): string {
  if (!inches) return '';
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

function formatWeight(lbs: number | null | undefined): string {
  if (!lbs) return '';
  return `${lbs} lbs`;
}

export default function AthletePublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { openDrawer } = useMessageDrawer();
  const username = params.username as string;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProfileByUsername(username);

      if (!data) {
        setError('Athlete not found');
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.first_name} ${profile?.last_name} - Athlete Profile`,
          text: `Check out ${profile?.first_name}'s athlete profile on ChatNIL`,
          url: url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      setToastMessage('Profile link copied to clipboard!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleMessage = () => {
    if (!profile) return;

    // For agencies/brands, open the message drawer
    if (user?.role === 'agency' || user?.role === 'business') {
      openDrawer({
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`.trim() || 'Athlete',
        handle: profile.username || undefined,
        avatar: profile.profile_photo_url || undefined,
        meta: [profile.primary_sport, profile.school_name].filter(Boolean).join(' • '),
        profileUrl: profile.username ? `/athletes/${profile.username}` : undefined,
      });
    } else {
      // For athletes and other users, use the athlete messaging page
      router.push(`/messages?athlete=${profile.id}`);
    }
  };

  const getSportIcon = (sport?: string) => {
    // Map sports to emojis
    const sportIcons: Record<string, string> = {
      Basketball: '🏀',
      Football: '🏈',
      Soccer: '⚽',
      Baseball: '⚾',
      Softball: '🥎',
      Volleyball: '🏐',
      Tennis: '🎾',
      Track: '🏃',
      Swimming: '🏊',
      Golf: '⛳',
    };
    return sportIcons[sport || ''] || '🏆';
  };

  // Parse secondary sports data (handles triple-stringified JSON)
  const parseSecondarySports = (secondary_sports: any): Array<{sport: string, position?: string}> => {
    if (!secondary_sports || !Array.isArray(secondary_sports)) return [];

    console.log('🔍 Parsing secondary sports:', secondary_sports);

    const parsed = secondary_sports.map((sport: any) => {
      console.log('  Processing sport:', sport, 'Type:', typeof sport);

      // If it's a JSON string, parse it
      if (typeof sport === 'string') {
        try {
          let parsed = JSON.parse(sport);
          console.log('  📝 First parse result:', parsed, 'Type:', typeof parsed);

          // Handle nested stringified JSON in the 'sport' property
          // This handles the triple-stringified case: {sport: "{sport: ...}"}
          // Keep parsing while the 'sport' property is a stringified JSON object (starts with '{')
          while (typeof parsed === 'object' && parsed !== null && parsed.sport && typeof parsed.sport === 'string' && parsed.sport.trim().startsWith('{')) {
            console.log('  🔄 Parsing nested sport property:', parsed.sport);
            parsed = JSON.parse(parsed.sport);
            console.log('  📝 Nested parse result:', parsed, 'Type:', typeof parsed);
          }

          // Handle double-stringified case (result is still a string)
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
            console.log('  📝 Second parse result:', parsed);
          }

          console.log('  ✅ Final parsed result:', parsed);
          return parsed;
        } catch (e) {
          console.error('  ❌ Error parsing secondary sport:', sport, e);
          return null;
        }
      }

      // If it's already an object with sport/position at the top level, return as-is
      if (typeof sport === 'object' && sport !== null && typeof sport.sport === 'string') {
        console.log('  ✅ Already a properly formatted object:', sport);
        return sport;
      }

      console.log('  ⚠️ Unknown format, returning null');
      return null;
    }).filter(Boolean);

    console.log('🎯 Final parsed sports:', parsed);
    return parsed;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-gray-600" role="status" aria-live="polite">Getting {username}&apos;s profile ready...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">We Couldn't Find This Profile</h2>
          <p className="text-gray-600 mb-6">{error || "This athlete profile might have been moved or removed. Let's get you back on track."}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
          >
            Back to Home
          </button>
        </Card>
      </div>
    );
  }

  const isHSAthlete = profile.role === 'hs_student';
  const showPortfolio = !isHSAthlete || profile.state_nil_allowed !== false;
  const fmv = calculateEstimatedFMV(profile);
  const profileStrength = getProfileStrength(profile.profile_completion_score || 0, isHSAthlete);
  const totalFollowers = profile.total_followers || 0;
  const avgEngagement = profile.avg_engagement_rate || 0;

  // Transform content_samples to PortfolioItem format (only public items)
  const portfolioItems = (profile.content_samples || [])
    .filter((sample: any) => sample.is_public !== false) // Only show public items
    .map((sample: any) => ({
      id: sample.id || crypto.randomUUID(),
      type: sample.type || 'image',
      url: sample.url,
      thumbnailUrl: sample.thumbnail_url || sample.url,
      metrics: {
        views: sample.views || 0,
        likes: sample.likes || 0,
        comments: sample.comments || 0
      },
      sponsored: sample.sponsored || false,
      brand: sample.brand,
      description: sample.description,
      is_featured: sample.is_featured || false,
      display_order: sample.display_order || 0,
      createdAt: sample.date || sample.created_at
    }))
    .sort((a: any, b: any) => {
      // Featured items first
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      // Then by display_order
      return a.display_order - b.display_order;
    });

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      {/* Enhanced Header Section with Cover Photo - V4 Design */}
      <div className="relative bg-gradient-to-br from-orange-600 via-orange-700 to-gray-900 overflow-hidden">
        {/* Cover Photo Background */}
        {profile.cover_photo_url && (
          <div className="absolute inset-0">
            <img
              src={profile.cover_photo_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Gradient Scrim Overlay (ensures white text stays legible) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />

        {/* Decorative background pattern (only show when no cover photo) */}
        {!profile.cover_photo_url && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Profile Info Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-start gap-6 mb-8"
          >
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Avatar
                src={profile.profile_photo_url || undefined}
                fallback={`${profile.first_name?.[0]}${profile.last_name?.[0]}`}
                size="xl"
                className="ring-4 ring-white shadow-[0_20px_60px_-15px_rgba(249,115,22,0.5)]"
              />
            </motion.div>

            {/* Info Column */}
            <div className="flex-1">
              {/* Name & Badge */}
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  {profile.first_name} {profile.last_name}
                </h1>
                <Badge className="bg-white/20 text-white backdrop-blur-sm">
                  {profileStrength.icon} {profileStrength.label}
                </Badge>
              </div>

              {/* Sport & Position + Athlete Identifiers */}
              {profile.primary_sport && (
                <div className="flex flex-wrap items-center gap-2 text-lg text-white mb-2">
                  <span className="text-2xl">{getSportIcon(profile.primary_sport)}</span>
                  <span className="font-semibold text-xl">{profile.primary_sport}</span>
                  {profile.position && (
                    <>
                      <span className="text-white/60">•</span>
                      <span className="text-xl">{profile.position}</span>
                    </>
                  )}

                  {/* Athlete Identifiers - inline badges */}
                  {(profile.jersey_number !== null || profile.height_inches || profile.weight_lbs) && (
                    <>
                      <span className="text-white/60 hidden sm:inline">•</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {profile.jersey_number !== null && profile.jersey_number !== undefined && (
                          <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold flex items-center gap-1.5">
                            <Hash className="h-3.5 w-3.5" />
                            {profile.jersey_number}
                          </span>
                        )}
                        {profile.height_inches && (
                          <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                            {formatHeight(profile.height_inches)}
                          </span>
                        )}
                        {profile.weight_lbs && (
                          <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium">
                            {formatWeight(profile.weight_lbs)}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* School & Graduation */}
              <div className="flex flex-wrap items-center gap-4 text-white mb-4">
                {profile.school_name && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    <span className="font-medium">{profile.school_name}</span>
                  </div>
                )}
                {profile.graduation_year && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/60">•</span>
                    <span>Class of {profile.graduation_year}</span>
                  </div>
                )}
              </div>

              {/* Secondary Sports - inline badges */}
              {profile.secondary_sports && profile.secondary_sports.length > 0 && (() => {
                const parsedSports = parseSecondarySports(profile.secondary_sports);
                return parsedSports.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-sm text-white/80">Also plays:</span>
                    {parsedSports.map((sport, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-sm text-white border border-white/20">
                        <span>{getSportIcon(sport.sport)}</span>
                        <span className="font-medium">{sport.sport}</span>
                        {sport.position && (
                          <span className="text-white/80">({sport.position})</span>
                        )}
                      </span>
                    ))}
                  </div>
                );
              })()}

              {/* Bio */}
              {profile.bio && (
                <p className="text-lg text-white max-w-3xl mb-6 line-clamp-3">{profile.bio}</p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {!isHSAthlete && (
                  <motion.button
                    onClick={handleMessage}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Send message to ${profile.first_name} ${profile.last_name}`}
                    className="px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(249,115,22,0.25)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.35)] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Message Athlete
                  </motion.button>
                )}
                <motion.button
                  onClick={handleShare}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Share ${profile.first_name} ${profile.last_name}'s profile`}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 focus:outline-none focus:ring-2 ${
                    isHSAthlete
                      ? 'bg-white text-primary-600 hover:bg-gray-50 shadow-[0_4px_20px_rgba(249,115,22,0.25)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.35)] focus:ring-orange-500 focus:ring-offset-2'
                      : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20 shadow-lg hover:shadow-xl focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-700'
                  }`}
                >
                  <Share2 className="h-5 w-5" />
                  Share Profile
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid in Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -8 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm text-white/80 font-medium">Total Followers</span>
              </div>
              <div className="text-3xl font-bold text-white">{formatFollowerCount(totalFollowers)}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -8 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm text-white/80 font-medium">Avg. Engagement</span>
              </div>
              <div className="text-3xl font-bold text-white">{formatEngagementRate(avgEngagement)}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -8 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  {isHSAthlete ? <Star className="h-5 w-5 text-white" /> : <Trophy className="h-5 w-5 text-white" />}
                </div>
                <span className="text-sm text-white/80 font-medium">
                  {isHSAthlete ? 'Profile Strength' : 'FMV Ranking'}
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {isHSAthlete
                  ? `${profile.profile_completion_score || 0}%`
                  : (profile.percentile_rank !== null && profile.percentile_rank !== undefined
                      ? `${profile.percentile_rank}th`
                      : 'N/A')}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.05, y: -8 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  {isHSAthlete ? <Heart className="h-5 w-5 text-white" /> : <Briefcase className="h-5 w-5 text-white" />}
                </div>
                <span className="text-sm text-white/80 font-medium">
                  {isHSAthlete ? 'Interests' : 'Active Deals'}
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {isHSAthlete
                  ? (profile.nil_interests?.length || profile.content_creation_interests?.length || 0)
                  : (profile.active_deals_count || 0)}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Vertical Scroll Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card className="p-6 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-lg shadow-md">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">About</h3>
              </div>

              {profile.bio && (
                <p className="text-gray-700 leading-relaxed mb-6">{profile.bio}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.major && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Major</div>
                      <div className="font-semibold text-gray-900">{profile.major}</div>
                    </div>
                  </div>
                )}

                {profile.gpa && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Award className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">GPA</div>
                      <div className="font-semibold text-gray-900">{profile.gpa.toFixed(2)}</div>
                    </div>
                  </div>
                )}

                {profile.division && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Trophy className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Division</div>
                      <div className="font-semibold text-gray-900">{profile.division}</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Athletic Information Section */}
            <Card className="p-6 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-lg shadow-md">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Athletic Information</h3>
              </div>

              <div className="space-y-6">
                {/* Primary Sport */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.primary_sport && (
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                      <Trophy className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm text-orange-700 mb-1 font-medium">Primary Sport</div>
                        <div className="font-bold text-gray-900">{profile.primary_sport}</div>
                        {profile.position && (
                          <div className="text-sm text-gray-600 mt-1">{profile.position}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {profile.team_name && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Users className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Team</div>
                        <div className="font-semibold text-gray-900">{profile.team_name}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Secondary Sports */}
                {profile.secondary_sports && profile.secondary_sports.length > 0 && (() => {
                  const parsedSports = parseSecondarySports(profile.secondary_sports);
                  return parsedSports.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Secondary Sports</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {parsedSports.map((sport, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-xl">{getSportIcon(sport.sport)}</span>
                            <div>
                              <div className="font-medium text-gray-900">{sport.sport}</div>
                              {sport.position && (
                                <div className="text-sm text-gray-600">{sport.position}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Highlight Film (HS athletes) */}
                {isHSAthlete && profile.highlight_video_url && (
                  <a
                    href={profile.highlight_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200 hover:border-orange-300 transition-colors group"
                  >
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <Video className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Highlight Film</div>
                      <div className="text-sm text-orange-600">Watch highlights →</div>
                    </div>
                  </a>
                )}

                {/* Coach Information */}
                {(profile.coach_name || profile.coach_email) && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Coach Information
                    </h4>
                    <div className="space-y-2">
                      {profile.coach_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-gray-900">{profile.coach_name}</span>
                        </div>
                      )}
                      {profile.coach_email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <a
                            href={`mailto:${profile.coach_email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {profile.coach_email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Achievements Section - Compact Grid Layout */}
            {profile.achievements && profile.achievements.length > 0 && (
              <Card className="p-6 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-orange-600" />
                  Achievements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {profile.achievements.map((achievement, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100/50 text-sm"
                    >
                      <Award className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <span className="text-gray-800 leading-tight">{achievement}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Interests & Passions Section */}
            {(profile.content_creation_interests?.length || profile.causes_care_about?.length || profile.lifestyle_interests?.length || profile.hobbies?.length || profile.brand_affinity?.length) && (
              <Card className="p-6 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-lg shadow-md">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Interests & Passions</h3>
                </div>

                <div className="space-y-6">
                  {profile.content_creation_interests && profile.content_creation_interests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-orange-600" />
                        Content Creation
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.content_creation_interests.map((interest, idx) => (
                          <Badge key={idx} variant="primary" className="bg-orange-100 text-orange-700 border-orange-200">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.causes_care_about && profile.causes_care_about.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Heart className="h-4 w-4 text-green-600" />
                        Causes I Care About
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.causes_care_about.map((cause, idx) => (
                          <Badge key={idx} variant="success" className="bg-green-100 text-green-700 border-green-200">
                            {cause}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.lifestyle_interests && profile.lifestyle_interests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        Lifestyle Interests
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.lifestyle_interests.map((interest, idx) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-700 border-blue-200">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.hobbies && profile.hobbies.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        Hobbies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.hobbies.map((hobby, idx) => (
                          <Badge key={idx} className="bg-purple-100 text-purple-700 border-purple-200">
                            {hobby}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.brand_affinity && profile.brand_affinity.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-600" />
                        Brand Partnerships
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {profile.brand_affinity.map((brand, idx) => (
                          <div key={idx} className="px-4 py-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg font-medium text-gray-900 border border-gray-200">
                            {brand}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Social Media Section */}
            {profile.social_media_stats && (
              <Card className="p-6 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-lg shadow-md">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Social Media Presence</h3>
                </div>

                <div className="space-y-4">
                  {/* Instagram */}
                  {profile.social_media_stats.instagram && (
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                            <Instagram className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Instagram</div>
                            {profile.social_media_stats.instagram.handle ? (
                              <a
                                href={`https://instagram.com/${profile.social_media_stats.instagram.handle.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-purple-600 hover:underline"
                              >
                                @{profile.social_media_stats.instagram.handle.replace('@', '')}
                              </a>
                            ) : (
                              <span className="text-sm text-gray-500">Handle not linked</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatFollowerCount(profile.social_media_stats.instagram.followers)}
                          </div>
                          <div className="text-sm text-gray-600">followers</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Engagement Rate</span>
                          <span className="font-semibold text-gray-900">{profile.social_media_stats.instagram.engagement_rate?.toFixed(1) || '0.0'}%</span>
                        </div>
                        <Progress
                          value={(profile.social_media_stats.instagram.engagement_rate || 0) * 10}
                          className="h-2 bg-purple-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* TikTok */}
                  {profile.social_media_stats.tiktok && (
                    <div className="p-4 bg-gray-900 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg">
                            <Music className="h-5 w-5 text-gray-900" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">TikTok</div>
                            {profile.social_media_stats.tiktok.handle ? (
                              <a
                                href={`https://tiktok.com/@${profile.social_media_stats.tiktok.handle.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-300 hover:text-white hover:underline"
                              >
                                @{profile.social_media_stats.tiktok.handle.replace('@', '')}
                              </a>
                            ) : (
                              <span className="text-sm text-gray-500">Handle not linked</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {formatFollowerCount(profile.social_media_stats.tiktok.followers)}
                          </div>
                          <div className="text-sm text-gray-400">followers</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Engagement Rate</span>
                          <span className="font-semibold text-white">{profile.social_media_stats.tiktok.engagement_rate?.toFixed(1) || '0.0'}%</span>
                        </div>
                        <Progress
                          value={(profile.social_media_stats.tiktok.engagement_rate || 0) * 10}
                          className="h-2 bg-gray-700"
                        />
                      </div>
                    </div>
                  )}

                  {/* Twitter */}
                  {profile.social_media_stats.twitter && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500 rounded-lg">
                            <Twitter className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Twitter</div>
                            {profile.social_media_stats.twitter.handle ? (
                              <a
                                href={`https://twitter.com/${profile.social_media_stats.twitter.handle.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                @{profile.social_media_stats.twitter.handle.replace('@', '')}
                              </a>
                            ) : (
                              <span className="text-sm text-gray-500">Handle not linked</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatFollowerCount(profile.social_media_stats.twitter.followers)}
                          </div>
                          <div className="text-sm text-gray-600">followers</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Engagement Rate</span>
                          <span className="font-semibold text-gray-900">{profile.social_media_stats.twitter.engagement_rate?.toFixed(1) || '0.0'}%</span>
                        </div>
                        <Progress
                          value={(profile.social_media_stats.twitter.engagement_rate || 0) * 10}
                          className="h-2 bg-blue-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* NIL Preferences Section */}
            {profile.nil_preferences && (
              <Card className="p-6 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-lg shadow-md">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">NIL Preferences</h3>
                </div>

                <div className="space-y-6">
                  {/* Deal Types Looking For */}
                  {profile.nil_preferences.preferred_deal_types && profile.nil_preferences.preferred_deal_types.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        Looking For
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.nil_preferences.preferred_deal_types.map((type, idx) => (
                          <Badge key={idx} variant="primary" className="bg-orange-100 text-orange-700 border-orange-200">
                            {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compensation Range (hidden for HS athletes) */}
                  {!isHSAthlete && (profile.nil_preferences.min_compensation !== undefined || profile.nil_preferences.max_compensation !== undefined) && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Compensation Range
                      </h4>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(profile.nil_preferences.min_compensation || 0)} - {formatCurrency(profile.nil_preferences.max_compensation || 0)}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Partnership Length */}
                    {profile.nil_preferences.preferred_partnership_length && (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Partnership Length</div>
                          <div className="font-semibold text-gray-900">
                            {profile.nil_preferences.preferred_partnership_length.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Travel Willing */}
                    {profile.nil_preferences.travel_willing !== undefined && (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <Plane className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Open to Travel</div>
                          <div className="font-semibold text-gray-900 flex items-center gap-2">
                            {profile.nil_preferences.travel_willing ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-green-700">Yes</span>
                              </>
                            ) : (
                              <>
                                <span className="text-gray-500">No</span>
                              </>
                            )}
                          </div>
                          {isHSAthlete && profile.nil_preferences.travel_willing && (
                            <div className="text-xs text-amber-600 mt-1">Requires parent/guardian approval</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Types Willing to Create */}
                  {profile.nil_preferences.content_types_willing && profile.nil_preferences.content_types_willing.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        Content Types
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.nil_preferences.content_types_willing.map((type, idx) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-700 border-blue-200">
                            {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  {profile.nil_preferences.additional_notes && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Additional Notes</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {profile.nil_preferences.additional_notes}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* NIL Goals & Aspirations Section */}
            {profile.nil_goals && profile.nil_goals.length > 0 && (
              <Card className="p-6 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-lg shadow-md">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">NIL Goals & Aspirations</h3>
                </div>

                <div className="space-y-3">
                  {profile.nil_goals.map((goal: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-gray-800 leading-relaxed flex-1">
                        {goal}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Portfolio Section — hidden for HS athletes when state doesn't allow NIL or no content */}
            {(showPortfolio && (!isHSAthlete || portfolioItems.length > 0)) && (
              <Card className="p-6 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-lg shadow-md">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Portfolio</h3>
                  {portfolioItems.length > 0 && (
                    <Badge variant="gray">{portfolioItems.length} {portfolioItems.length === 1 ? 'item' : 'items'}</Badge>
                  )}
                </div>

                {portfolioItems.length > 0 ? (
                  <PortfolioGrid
                    items={portfolioItems}
                    mode="view"
                    onClick={(item) => window.open(item.url, '_blank')}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Coming Soon</h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {profile.first_name} is building their content showcase. Reach out to see their work and discuss partnership opportunities!
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Actions Card — HS vs College */}
            {isHSAthlete ? (
              <Card className="p-6 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="font-bold text-gray-900 mb-4">Partnership Inquiries</h3>
                <p className="text-sm text-gray-600 mb-4">
                  For partnership inquiries about {profile.first_name}:
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-gray-900">Parent/Guardian</span>
                </div>
                <button
                  onClick={handleShare}
                  className="w-full px-4 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 mb-3"
                >
                  <Share2 className="h-5 w-5" />
                  Share Profile
                </button>
                <p className="text-xs text-gray-500 mb-4">
                  Share this profile to discuss partnership opportunities.
                </p>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Please do not contact high school athletes directly. All inquiries should go through their parent/guardian.
                    </span>
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="p-6 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="font-bold text-gray-900 mb-4">Get in Touch</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleMessage}
                    className="w-full px-4 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Start a Conversation
                  </button>
                  <button className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    <Download className="h-5 w-5" />
                    Get Media Kit
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="h-5 w-5" />
                    Share Profile
                  </button>
                </div>
              </Card>
            )}

            {/* State NIL Rules Notice (HS athletes only) */}
            {isHSAthlete && (
              <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-orange-600" />
                  HS NIL Rules
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  High school NIL rules vary by state. Verify eligibility and disclosure requirements before pursuing any partnership.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-orange-500" />
                  <span className="text-gray-600">
                    {profile.school_name ? `${profile.school_name} policies apply` : 'Check your state rules'}
                  </span>
                </div>
              </Card>
            )}

            {/* Quick Info Card */}
            {profile.graduation_year && (
              <Card className="p-6 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-600" />
                  Quick Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Class</span>
                    <span className="font-semibold text-gray-900">{profile.graduation_year}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Availability Card */}
            <Card className="p-6 border-orange-100 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="font-bold text-gray-900 mb-4">Availability</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-gray-900">Available for partnerships</span>
              </div>
              {isHSAthlete ? (
                <p className="text-sm text-gray-600">
                  Partnerships require parent/guardian approval.
                </p>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Response Rate</span>
                    <span className="font-semibold text-gray-900">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Avg. Response Time</span>
                    <span className="font-semibold text-gray-900">24 hours</span>
                  </div>
                </div>
              )}
            </Card>

            {/* FMV Card (college athletes only) */}
            {!isHSAthlete && profile.fmv_score && (
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="font-bold text-gray-900 mb-2">Fair Market Value</h3>
                <div className="text-4xl font-bold text-primary-600 mb-2">{profile.fmv_score}</div>
                <p className="text-sm text-gray-600 mb-4">Out of 100</p>
                {profile.percentile_rank != null && (
                  <p className="text-sm text-gray-700">
                    Top {100 - profile.percentile_rank}% in {profile.primary_sport}
                  </p>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 px-6 py-3 bg-gray-900 text-white rounded-xl shadow-lg flex items-center gap-2 z-50"
        >
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          {toastMessage}
        </motion.div>
      )}
    </div>
  );
}
