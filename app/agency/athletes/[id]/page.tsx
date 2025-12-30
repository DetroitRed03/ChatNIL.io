'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  MessageCircle,
  Instagram,
  Twitter,
  Video as TikTok,
  Youtube,
  Users,
  TrendingUp,
  DollarSign,
  MapPin,
  GraduationCap,
  Trophy,
  Calendar,
  Briefcase,
  Star,
  Edit3,
  Save,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface AthleteProfile {
  user_id: string;
  username: string;
  display_name: string;
  profile_photo_url?: string;
  cover_photo_url?: string;
  bio?: string;
  sport: string;
  position?: string;
  year?: string;
  school_name?: string;
  school_level?: string;
  state?: string;
  city?: string;
  instagram_followers?: number;
  instagram_engagement_rate?: number;
  tiktok_followers?: number;
  tiktok_engagement_rate?: number;
  twitter_followers?: number;
  twitter_engagement_rate?: number;
  youtube_subscribers?: number;
  youtube_engagement_rate?: number;
  total_followers?: number;
  avg_engagement_rate?: number;
  estimated_fmv_min?: number;
  estimated_fmv_max?: number;
  content_categories?: string[];
  brand_values?: string[];
  is_available_for_partnerships?: boolean;
}

export default function AgencyAthleteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const athleteId = params?.id as string;

  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // Redirect non-agencies
  useEffect(() => {
    if (user && user.role !== 'agency') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch athlete data
  useEffect(() => {
    if (athleteId && user?.role === 'agency') {
      fetchAthleteProfile();
      checkIfSaved();
    }
  }, [athleteId, user]);

  async function fetchAthleteProfile() {
    try {
      // Fetch athlete profile by user_id (uses [username] route which handles both IDs and usernames)
      const res = await fetch(`/api/athletes/${athleteId}`);
      const data = await res.json();

      if (res.ok && data.profile) {
        // Transform the profile data to match the expected interface
        setAthlete({
          user_id: data.profile.id,
          username: data.profile.username,
          display_name: `${data.profile.first_name || ''} ${data.profile.last_name || ''}`.trim() || data.profile.username,
          profile_photo_url: data.profile.profile_photo_url,
          cover_photo_url: data.profile.cover_photo_url,
          bio: data.profile.bio,
          sport: data.profile.primary_sport,
          position: data.profile.position,
          year: data.profile.graduation_year,
          school_name: data.profile.school_name,
          state: data.profile.state,
          city: data.profile.city,
          instagram_followers: data.profile.social_media_stats?.instagram?.followers || 0,
          instagram_engagement_rate: data.profile.social_media_stats?.instagram?.engagement_rate || 0,
          tiktok_followers: data.profile.social_media_stats?.tiktok?.followers || 0,
          tiktok_engagement_rate: data.profile.social_media_stats?.tiktok?.engagement_rate || 0,
          twitter_followers: data.profile.social_media_stats?.twitter?.followers || 0,
          twitter_engagement_rate: data.profile.social_media_stats?.twitter?.engagement_rate || 0,
          youtube_subscribers: 0,
          total_followers: data.profile.total_followers || 0,
          avg_engagement_rate: data.profile.avg_engagement_rate || 0,
          estimated_fmv_min: data.profile.fmv_score ? data.profile.fmv_score * 0.8 : undefined,
          estimated_fmv_max: data.profile.fmv_score ? data.profile.fmv_score * 1.2 : undefined,
          is_available_for_partnerships: true,
          content_categories: data.profile.content_creation_interests || [],
          brand_values: data.profile.brand_values || []
        });
      } else {
        // Fallback: try fetching from athlete_public_profiles via discovery API
        const fallbackRes = await fetch(`/api/agency/athletes/discover`);
        const fallbackData = await fallbackRes.json();

        if (fallbackData.success && fallbackData.data.athletes) {
          // Find the athlete by user_id
          const found = fallbackData.data.athletes.find((a: any) => a.user_id === athleteId);
          if (found) {
            setAthlete(found);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching athlete:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkIfSaved() {
    try {
      const res = await fetch('/api/agency/roster');
      const data = await res.json();

      if (res.ok && data.athletes) {
        const saved = data.athletes.some((a: any) => a.id === athleteId);
        setIsSaved(saved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  }

  async function handleSaveToggle() {
    if (isSaved) {
      // Unsave
      try {
        const res = await fetch(`/api/agency/roster?athleteId=${athleteId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setIsSaved(false);
          alert('✓ Athlete removed from roster');
        }
      } catch (error) {
        console.error('Error removing athlete:', error);
        alert('❌ Failed to remove athlete');
      }
    } else {
      // Save
      try {
        const res = await fetch('/api/agency/roster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ athleteId }),
        });

        if (res.ok) {
          setIsSaved(true);
          alert('✓ Athlete saved to roster');
        } else if (res.status === 409) {
          setIsSaved(true);
          alert('ℹ️ Athlete is already in your roster');
        }
      } catch (error) {
        console.error('Error saving athlete:', error);
        alert('❌ Failed to save athlete');
      }
    }
  }

  async function handleMessage() {
    if (!athleteId) return;

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
      } else {
        alert('❌ Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('❌ Failed to start conversation');
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    // TODO: Implement notes API
    setTimeout(() => {
      setSavingNotes(false);
      setIsEditingNotes(false);
      alert('✓ Notes saved!');
    }, 500);
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

  if (user?.role !== 'agency') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading athlete profile...</p>
        </div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Athlete not found</p>
          <button
            onClick={() => router.push('/agency/discover')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Discovery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Cover Photo */}
      <div
        className="h-64 bg-gradient-to-br from-primary-600 to-primary-800 relative"
        style={
          athlete.cover_photo_url
            ? { backgroundImage: `url(${athlete.cover_photo_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
      >
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-800 rounded-lg shadow-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back</span>
        </button>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex gap-3">
          <button
            onClick={handleSaveToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg font-medium transition-colors ${
              isSaved
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-white/90 hover:bg-white text-gray-800'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-4 h-4" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Save to Roster</span>
              </>
            )}
          </button>

          <button
            onClick={handleMessage}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-gray-800 rounded-lg shadow-lg font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Message</span>
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 pb-12">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Profile Photo */}
            <div className="relative flex-shrink-0">
              {athlete.profile_photo_url ? (
                <img
                  src={athlete.profile_photo_url}
                  alt={athlete.display_name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center border-4 border-white shadow-xl">
                  <span className="text-4xl font-bold text-white">
                    {athlete.display_name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              {athlete.is_available_for_partnerships && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  Available
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {athlete.display_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Trophy className="w-4 h-4" />
                  <span className="font-medium">{athlete.sport}</span>
                  {athlete.position && <span>• {athlete.position}</span>}
                </div>
                {athlete.school_name && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <GraduationCap className="w-4 h-4" />
                    <span>{athlete.school_name}</span>
                  </div>
                )}
                {(athlete.city || athlete.state) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {athlete.city}
                      {athlete.city && athlete.state && ', '}
                      {athlete.state}
                    </span>
                  </div>
                )}
              </div>

              {athlete.bio && (
                <p className="text-gray-700 mb-4">{athlete.bio}</p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {athlete.year && (
                  <Badge variant="secondary">
                    <Calendar className="w-3 h-3 mr-1" />
                    {athlete.year}
                  </Badge>
                )}
                {athlete.school_level && (
                  <Badge variant="secondary">
                    {athlete.school_level === 'college' ? 'College' : 'High School'}
                  </Badge>
                )}
                {athlete.content_categories?.slice(0, 3).map((category) => (
                  <Badge key={category} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Key Stats */}
            <div className="flex-shrink-0 grid grid-cols-1 gap-4 min-w-[200px]">
              <div className="text-center p-3 bg-primary-50 rounded-lg border border-primary-200">
                <Users className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(athlete.total_followers)}
                </div>
                <div className="text-xs text-gray-600">Total Followers</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">
                  {athlete.avg_engagement_rate?.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-gray-600">Avg Engagement</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <DollarSign className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(athlete.estimated_fmv_min)} - {formatCurrency(athlete.estimated_fmv_max)}
                </div>
                <div className="text-xs text-gray-600">Est. Value Range</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Social Media & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Social Media Stats */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary-600" />
                Social Media Presence
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {athlete.instagram_followers && athlete.instagram_followers > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatNumber(athlete.instagram_followers)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {athlete.instagram_engagement_rate?.toFixed(1)}% engagement
                      </div>
                    </div>
                  </div>
                )}

                {athlete.tiktok_followers && athlete.tiktok_followers > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <TikTok className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatNumber(athlete.tiktok_followers)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {athlete.tiktok_engagement_rate?.toFixed(1)}% engagement
                      </div>
                    </div>
                  </div>
                )}

                {athlete.twitter_followers && athlete.twitter_followers > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Twitter className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatNumber(athlete.twitter_followers)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {athlete.twitter_engagement_rate?.toFixed(1)}% engagement
                      </div>
                    </div>
                  </div>
                )}

                {athlete.youtube_subscribers && athlete.youtube_subscribers > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                      <Youtube className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatNumber(athlete.youtube_subscribers)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {athlete.youtube_engagement_rate?.toFixed(1)}% engagement
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Brand Values & Interests */}
            {athlete.brand_values && athlete.brand_values.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary-600" />
                  Brand Values & Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {athlete.brand_values.map((value) => (
                    <Badge key={value} variant="secondary" className="text-sm">
                      {value}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Agency Notes */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Agency Notes</h2>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add private notes about this athlete..."
                    className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {savingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600">
                  {notes || (
                    <p className="text-gray-400 italic">No notes yet. Click edit to add notes.</p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
