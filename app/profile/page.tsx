'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  User,
  GraduationCap,
  Trophy,
  Instagram,
  Twitter,
  TrendingUp,
  Sparkles,
  Save,
  Eye,
  Heart,
  DollarSign,
  Image as ImageIcon,
  CheckCircle2,
  Music,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { CreativeSlider } from '@/components/ui/CreativeSlider';
import { PhotoUpload } from '@/components/PhotoUpload';
import { fetchOwnProfile, updateProfile, type ProfileData } from '@/lib/profile-data';
import { calculateProfileCompletion } from '@/lib/profile-completion';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  SportsPositionPicker,
  PositionPickerModal,
  SecondarySportsManager,
  type SecondarySport,
} from '@/components/profile/shared';
import { ProfileSectionCard } from '@/components/profile/edit/ProfileSectionCard';
import { PortfolioManagementSection } from '@/components/portfolio/PortfolioManagementSection';
import { ProfileVisibilityToggle } from '@/components/profile/ProfileVisibilityToggle';

export default function ProfileEditPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect non-athlete roles away from this page
  useEffect(() => {
    if (user && user.role === 'compliance_officer') {
      router.replace('/compliance/settings');
    } else if (user && user.role === 'parent') {
      router.replace('/parent/settings');
    }
  }, [user, router]);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [positionModalOpen, setPositionModalOpen] = useState(false);
  const [secondarySportsModalIndex, setSecondarySportsModalIndex] = useState<number | null>(null);

  // Personal Info
  const [bio, setBio] = useState('');
  const [major, setMajor] = useState('');
  const [gpa, setGpa] = useState('');

  // Athletic Info
  const [primarySport, setPrimarySport] = useState<{ sport: string; position?: string }>({
    sport: '',
    position: '',
  });
  const [secondarySports, setSecondarySports] = useState<SecondarySport[]>([]);
  const [achievements, setAchievements] = useState('');
  const [coachName, setCoachName] = useState('');
  const [coachEmail, setCoachEmail] = useState('');

  // Athlete Stats
  const [heightInches, setHeightInches] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');

  // Social Media
  const [instagramHandle, setInstagramHandle] = useState('');
  const [instagramFollowers, setInstagramFollowers] = useState(0);
  const [instagramEngagement, setInstagramEngagement] = useState(0);
  const [tiktokHandle, setTiktokHandle] = useState('');
  const [tiktokFollowers, setTiktokFollowers] = useState(0);
  const [tiktokEngagement, setTiktokEngagement] = useState(0);
  const [twitterHandle, setTwitterHandle] = useState('');
  const [twitterFollowers, setTwitterFollowers] = useState(0);
  const [twitterEngagement, setTwitterEngagement] = useState(0);

  // Interests
  const [contentInterests, setContentInterests] = useState<string[]>([]);
  const [brandAffinity, setBrandAffinity] = useState<string[]>([]);
  const [causes, setCauses] = useState<string[]>([]);
  const [lifestyleInterests, setLifestyleInterests] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);

  // NIL Preferences
  const [dealTypes, setDealTypes] = useState<string[]>([]);
  const [minCompensation, setMinCompensation] = useState(0);
  const [maxCompensation, setMaxCompensation] = useState(50000);
  const [partnershipLength, setPartnershipLength] = useState('');
  const [contentTypesWilling, setContentTypesWilling] = useState<string[]>([]);
  const [travelWilling, setTravelWilling] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchOwnProfile(user!.id);
      setProfile(data);

      // Populate form fields
      // Personal
      setBio(data.bio || '');
      setMajor(data.major || '');
      setGpa(data.gpa?.toString() || '');

      // Athletic
      setPrimarySport({
        sport: data.primary_sport || '',
        position: data.position || '',
      });

      // Handle secondary_sports - convert from string format if needed
      const secondarySportsData = data.secondary_sports || [];
      const normalizedSecondarySports = secondarySportsData.map((item: any) => {
        // If it's already an object with sport/position, use it
        if (typeof item === 'object' && item.sport) {
          return item;
        }
        // If it's a string like "Soccer - Goalkeeper", parse it
        if (typeof item === 'string') {
          const parts = item.split(' - ');
          return {
            sport: parts[0]?.trim() || '',
            position: parts[1]?.trim() || undefined,
          };
        }
        // Fallback to empty object
        return { sport: '', position: undefined };
      });
      setSecondarySports(normalizedSecondarySports);

      setAchievements(data.achievements?.join('\n') || '');
      setCoachName(data.coach_name || '');
      setCoachEmail(data.coach_email || '');

      // Athlete stats
      setHeightInches(data.height_inches?.toString() || '');
      setWeightLbs(data.weight_lbs?.toString() || '');
      setJerseyNumber(data.jersey_number?.toString() || '');

      // Social media stats
      if (data.social_media_stats) {
        if (data.social_media_stats.instagram) {
          setInstagramHandle(data.social_media_stats.instagram.handle || '');
          setInstagramFollowers(data.social_media_stats.instagram.followers || 0);
          setInstagramEngagement(data.social_media_stats.instagram.engagement_rate || 0);
        }
        if (data.social_media_stats.tiktok) {
          setTiktokHandle(data.social_media_stats.tiktok.handle || '');
          setTiktokFollowers(data.social_media_stats.tiktok.followers || 0);
          setTiktokEngagement(data.social_media_stats.tiktok.engagement_rate || 0);
        }
        if (data.social_media_stats.twitter) {
          setTwitterHandle(data.social_media_stats.twitter.handle || '');
          setTwitterFollowers(data.social_media_stats.twitter.followers || 0);
          setTwitterEngagement(data.social_media_stats.twitter.engagement_rate || 0);
        }
      }

      // Interests
      setContentInterests(data.content_creation_interests || []);
      setBrandAffinity(data.brand_affinity || []);
      setCauses(data.causes_care_about || []);
      setLifestyleInterests(data.lifestyle_interests || []);
      setHobbies(data.hobbies || []);

      // NIL Preferences
      if (data.nil_preferences) {
        setDealTypes(data.nil_preferences.preferred_deal_types || []);
        setMinCompensation(data.nil_preferences.min_compensation || 0);
        setMaxCompensation(data.nil_preferences.max_compensation || 50000);
        setPartnershipLength(data.nil_preferences.preferred_partnership_length || '');
        setContentTypesWilling(data.nil_preferences.content_types_willing || []);
        setTravelWilling(data.nil_preferences.travel_willing || false);
      }

      // Calculate completion (skip content scoring if state doesn't allow NIL for HS)
      const completion = calculateProfileCompletion(data, {
        nilAllowedInState: data.state_nil_allowed,
      });
      setProfileCompletion(completion.percentage);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save with debouncing (500ms)
  const autoSave = useCallback(
    async (updates: Partial<ProfileData>) => {
      if (!user?.id) return;

      try {
        setSaveStatus('saving');
        await updateProfile(user.id, updates);
        setSaveStatus('saved');

        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-save error:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    },
    [user]
  );

  const handleSave = async () => {
    try {
      setSaving(true);

      const achievementsArray = achievements.split('\n').filter((a) => a.trim());

      const updates = {
        bio,
        major,
        gpa: gpa ? parseFloat(gpa) : undefined,
        primary_sport: primarySport.sport,
        position: primarySport.position,
        secondary_sports: Array.isArray(secondarySports) && secondarySports.length > 0 ? secondarySports : null,
        achievements: achievementsArray.length > 0 ? achievementsArray : null,
        coach_name: coachName,
        coach_email: coachEmail,
        height_inches: heightInches ? parseInt(heightInches) : null,
        weight_lbs: weightLbs ? parseInt(weightLbs) : null,
        jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
        social_media_stats: {
          instagram: instagramHandle
            ? {
                handle: instagramHandle,
                followers: instagramFollowers,
                engagement_rate: instagramEngagement,
              }
            : null,
          tiktok: tiktokHandle
            ? {
                handle: tiktokHandle,
                followers: tiktokFollowers,
                engagement_rate: tiktokEngagement,
              }
            : null,
          twitter: twitterHandle
            ? {
                handle: twitterHandle,
                followers: twitterFollowers,
                engagement_rate: twitterEngagement,
              }
            : null,
        },
        content_creation_interests: Array.isArray(contentInterests) && contentInterests.length > 0 ? contentInterests : null,
        brand_affinity: Array.isArray(brandAffinity) && brandAffinity.length > 0 ? brandAffinity : null,
        causes_care_about: Array.isArray(causes) && causes.length > 0 ? causes : null,
        lifestyle_interests: Array.isArray(lifestyleInterests) && lifestyleInterests.length > 0 ? lifestyleInterests : null,
        hobbies: Array.isArray(hobbies) && hobbies.length > 0 ? hobbies : null,
        nil_preferences: {
          preferred_deal_types: Array.isArray(dealTypes) && dealTypes.length > 0 ? dealTypes : null,
          min_compensation: minCompensation !== undefined ? minCompensation : null,
          max_compensation: maxCompensation !== undefined ? maxCompensation : null,
          preferred_partnership_length: partnershipLength,
          content_types_willing: Array.isArray(contentTypesWilling) && contentTypesWilling.length > 0 ? contentTypesWilling : null,
          travel_willing: travelWilling,
        },
      };

      console.log('🔍 Saving profile with updates:', JSON.stringify(updates, null, 2));
      await updateProfile(user!.id, updates as Partial<ProfileData>);
      alert('Profile updated successfully!');
      await loadProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleViewPublicProfile = () => {
    if (profile?.username) {
      router.push(`/athletes/${profile.username}`);
    } else {
      alert('You need a username to view your public profile');
    }
  };

  // Toggle functions for multi-select
  const toggleItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  // Section completion calculation functions
  const calculatePersonalCompletion = () => {
    let filled = 0;
    let total = 3;
    if (bio.trim()) filled++;
    if (major.trim()) filled++;
    if (gpa.trim()) filled++;
    return Math.round((filled / total) * 100);
  };

  const calculateAthleticCompletion = () => {
    let filled = 0;
    let total = 2; // primary sport + position required
    if (primarySport.sport) filled++;
    if (primarySport.position) filled++;
    return Math.round((filled / total) * 100);
  };

  const calculatePhotoCompletion = () => {
    let filled = 0;
    let total = 2; // profile photo + cover photo
    if (profile?.profile_photo_url) filled++;
    if (profile?.cover_photo_url) filled++;
    return Math.round((filled / total) * 100);
  };

  const calculateSocialCompletion = () => {
    let filled = 0;
    let total = 1; // At least one complete platform

    // Check if Instagram has data (handle optional, followers required)
    if (instagramFollowers > 0 && instagramEngagement > 0) {
      filled++;
    }
    // Check if TikTok has data (handle optional, followers required)
    if (tiktokFollowers > 0 && tiktokEngagement > 0) {
      filled++;
    }
    // Check if Twitter has data (handle optional, followers required)
    if (twitterFollowers > 0 && twitterEngagement > 0) {
      filled++;
    }

    return filled >= total ? 100 : Math.round((filled / total) * 100);
  };

  const calculateInterestsCompletion = () => {
    const totalItems =
      contentInterests.length +
      brandAffinity.length +
      causes.length +
      lifestyleInterests.length +
      hobbies.length;

    // At least 2 items selected across all categories
    return totalItems >= 2 ? 100 : Math.round((totalItems / 2) * 100);
  };

  const calculateNILCompletion = () => {
    let filled = 0;
    let total = 3;

    // Deal types selected
    if (dealTypes.length > 0) filled++;

    // Compensation range set
    if (minCompensation > 0 || maxCompensation > 0) filled++;

    // At least one content type willing
    if (contentTypesWilling.length > 0) filled++;

    return Math.round((filled / total) * 100);
  };

  const calculatePortfolioCompletion = () => {
    if (!profile?.content_samples || !Array.isArray(profile.content_samples)) {
      return 0;
    }

    const portfolioItems = profile.content_samples;
    if (portfolioItems.length === 0) {
      return 0; // No items = 0%
    }

    // Has at least 1 item = 50%
    // Has 3+ items = 100%
    if (portfolioItems.length >= 3) {
      return 100;
    } else if (portfolioItems.length >= 1) {
      return 50;
    }

    return 0;
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-y-auto bg-[#FAF6F1]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 mt-1">
                Manage your athlete profile and increase your visibility
              </p>
            </div>
            <div className="flex gap-3">
              {/* Save Status Indicator */}
              {saveStatus !== 'idle' && (
                <div
                  className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 ${
                    saveStatus === 'saving'
                      ? 'bg-blue-100 text-blue-700'
                      : saveStatus === 'saved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {saveStatus === 'saving' && (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Saving...
                    </>
                  )}
                  {saveStatus === 'saved' && (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Saved!
                    </>
                  )}
                  {saveStatus === 'error' && <>Error saving</>}
                </div>
              )}

              <button
                onClick={handleViewPublicProfile}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Eye className="h-5 w-5" />
                View Public Profile
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Profile Completion */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Profile Strength</h3>
                  <span className="text-2xl font-bold text-primary-600">
                    {profileCompletion}%
                  </span>
                </div>
                <Progress value={profileCompletion} className="h-3" />
              </div>
              <div className="p-4 bg-primary-100 rounded-xl">
                <Sparkles className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            {profileCompletion < 100 && (
              <p className="text-sm text-gray-600 mt-3">
                Complete your profile to increase your visibility to brands and agencies!
              </p>
            )}
          </Card>

          {/* Profile Visibility Toggle */}
          {profile && (
            <ProfileVisibilityToggle
              profile={{
                avatar_url: profile.avatar_url,
                profile_photo_url: profile.profile_photo_url,
                bio: profile.bio,
                sport: profile.primary_sport,
                primary_sport: profile.primary_sport,
                school: profile.school_name,
                school_name: profile.school_name,
                social_media_stats: profile.social_media_stats,
                is_public: profile.is_public,
                role: profile.role,
                parent_consent_given: profile.parent_consent_given,
                username: profile.username,
              }}
              onUpdate={(isPublic) => {
                setProfile((prev: any) => prev ? { ...prev, is_public: isPublic } : prev);
              }}
            />
          )}

          {/* Profile Sections - Vertical Scrollable */}
          <div className="space-y-6">
            {/* 1. Personal Information Section */}
            <ProfileSectionCard
              id="personal"
              title="Personal Information"
              description="Tell us about yourself"
              icon={User}
              completionPercentage={calculatePersonalCompletion()}
              defaultExpanded={true}
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Tell brands about yourself, your interests, and what makes you unique..."
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-sm text-gray-500">
                      Introduce yourself to potential brand partners
                    </p>
                    <p className="text-sm text-gray-400">{bio.length}/500</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">School</label>
                    <Input value={profile?.school_name || ''} disabled />
                    <p className="text-xs text-gray-500 mt-1">Set during onboarding</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Graduation Year
                    </label>
                    <Input value={profile?.graduation_year || ''} disabled />
                    <p className="text-xs text-gray-500 mt-1">Set during onboarding</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
                    <Input
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="e.g., Business Administration"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GPA (Optional)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      placeholder="3.50"
                    />
                  </div>
                </div>
              </div>
            </ProfileSectionCard>

            {/* 2. Profile Photos Section */}
            <ProfileSectionCard
              id="photos"
              title="Profile Photos"
              description="Upload your profile and cover photos"
              icon={ImageIcon}
              completionPercentage={calculatePhotoCompletion()}
            >
              <div className="space-y-8">
                {/* Profile Photo */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
                      <p className="text-sm text-gray-600">
                        Square photo that appears next to your name (400x400 recommended)
                      </p>
                    </div>
                    <Badge className="bg-primary-100 text-primary-700">
                      {profile?.profile_photo_url ? 'Uploaded' : 'Not Set'}
                    </Badge>
                  </div>
                  <PhotoUpload
                    photoType="profile"
                    currentPhotoUrl={profile?.profile_photo_url}
                    onUploadSuccess={(url) => {
                      setProfile({ ...profile, profile_photo_url: url });
                      setSaveStatus('saved');
                      setTimeout(() => setSaveStatus('idle'), 2000);
                    }}
                    onUploadError={(error) => {
                      console.error('Profile photo upload error:', error);
                      setSaveStatus('error');
                      setTimeout(() => setSaveStatus('idle'), 3000);
                    }}
                  />
                </div>

                {/* Cover Photo */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Cover Photo</h3>
                      <p className="text-sm text-gray-600">
                        Wide banner photo for your profile header (1584x396 recommended)
                      </p>
                    </div>
                    <Badge className="bg-primary-100 text-primary-700">
                      {profile?.cover_photo_url ? 'Uploaded' : 'Not Set'}
                    </Badge>
                  </div>
                  <PhotoUpload
                    photoType="cover"
                    currentPhotoUrl={profile?.cover_photo_url}
                    onUploadSuccess={(url) => {
                      setProfile({ ...profile, cover_photo_url: url });
                      setSaveStatus('saved');
                      setTimeout(() => setSaveStatus('idle'), 2000);
                    }}
                    onUploadError={(error) => {
                      console.error('Cover photo upload error:', error);
                      setSaveStatus('error');
                      setTimeout(() => setSaveStatus('idle'), 3000);
                    }}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">Photo Tips</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Use high-quality images for best results</li>
                        <li>• Profile photos work best with simple backgrounds</li>
                        <li>• Cover photos can showcase your personality and achievements</li>
                        <li>• Images are automatically optimized and compressed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </ProfileSectionCard>

            {/* 3. Athletic Information Section */}
            <ProfileSectionCard
              id="athletic"
              title="Athletic Information"
              description="Your sports and achievements"
              icon={Trophy}
              completionPercentage={calculateAthleticCompletion()}
            >
              <div className="space-y-6">
                {/* Primary Sport with Position Picker */}
                <div>
                  <SportsPositionPicker
                    value={primarySport}
                    onChange={(sport, position) =>
                      setPrimarySport({ sport, position })
                    }
                    label="Primary Sport *"
                    showPositionButton
                    onOpenPositionPicker={() => setPositionModalOpen(true)}
                  />
                </div>

                {/* Secondary Sports Manager */}
                <SecondarySportsManager
                  sports={secondarySports}
                  onChange={setSecondarySports}
                  maxSports={3}
                />

                {/* Achievements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Achievements & Honors
                  </label>
                  <textarea
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="List your awards, championships, records, or notable achievements (one per line)"
                  />
                  <p className="text-xs text-gray-500 mt-1">One achievement per line</p>
                </div>

                {/* Coach Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coach Name (Optional)
                    </label>
                    <Input
                      value={coachName}
                      onChange={(e) => setCoachName(e.target.value)}
                      placeholder="Coach's full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coach Email (Optional)
                    </label>
                    <Input
                      type="email"
                      value={coachEmail}
                      onChange={(e) => setCoachEmail(e.target.value)}
                      placeholder="coach@school.edu"
                    />
                  </div>
                </div>

                {/* Athlete Stats */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Athlete Stats (Optional)
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    These stats will appear on your public profile as part of your athlete résumé
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (inches)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="96"
                        value={heightInches}
                        onChange={(e) => setHeightInches(e.target.value)}
                        placeholder="e.g., 74 for 6'2&quot;"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {heightInches && parseInt(heightInches) > 0
                          ? `${Math.floor(parseInt(heightInches) / 12)}'${parseInt(heightInches) % 12}"`
                          : 'Enter total inches'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (lbs)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="500"
                        value={weightLbs}
                        onChange={(e) => setWeightLbs(e.target.value)}
                        placeholder="e.g., 185"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jersey Number
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="99"
                        value={jerseyNumber}
                        onChange={(e) => setJerseyNumber(e.target.value)}
                        placeholder="e.g., 23"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ProfileSectionCard>

            {/* 4. Social Media Stats Section */}
            <ProfileSectionCard
              id="social"
              title="Social Media Stats"
              description="Your social media presence"
              icon={TrendingUp}
              completionPercentage={calculateSocialCompletion()}
            >
              <div className="space-y-8">
                {/* Instagram */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                      <Instagram className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Instagram</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Handle
                      </label>
                      <Input
                        value={instagramHandle}
                        onChange={(e) => setInstagramHandle(e.target.value)}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <CreativeSlider
                        label="Followers"
                        min={0}
                        max={10000000}
                        step={1000}
                        value={instagramFollowers}
                        onChange={(val) => setInstagramFollowers(val as number)}
                        formatValue={(val) => formatNumber(val)}
                        showValue
                        gradientColors={['#c13584', '#e1306c']}
                      />
                    </div>
                    <div>
                      <CreativeSlider
                        label="Engagement Rate (%)"
                        min={0}
                        max={20}
                        step={0.1}
                        value={instagramEngagement}
                        onChange={(val) => setInstagramEngagement(val as number)}
                        formatValue={(val) => `${val.toFixed(1)}%`}
                        showValue
                        gradientColors={['#c13584', '#e1306c']}
                      />
                    </div>
                  </div>
                </div>

                {/* TikTok */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-black to-gray-800 rounded-lg">
                      <Music className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">TikTok</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Handle
                      </label>
                      <Input
                        value={tiktokHandle}
                        onChange={(e) => setTiktokHandle(e.target.value)}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <CreativeSlider
                        label="Followers"
                        min={0}
                        max={10000000}
                        step={1000}
                        value={tiktokFollowers}
                        onChange={(val) => setTiktokFollowers(val as number)}
                        formatValue={(val) => formatNumber(val)}
                        showValue
                        gradientColors={['#000000', '#ff0050']}
                      />
                    </div>
                    <div>
                      <CreativeSlider
                        label="Engagement Rate (%)"
                        min={0}
                        max={20}
                        step={0.1}
                        value={tiktokEngagement}
                        onChange={(val) => setTiktokEngagement(val as number)}
                        formatValue={(val) => `${val.toFixed(1)}%`}
                        showValue
                        gradientColors={['#000000', '#ff0050']}
                      />
                    </div>
                  </div>
                </div>

                {/* Twitter */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                      <Twitter className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Twitter</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Handle
                      </label>
                      <Input
                        value={twitterHandle}
                        onChange={(e) => setTwitterHandle(e.target.value)}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <CreativeSlider
                        label="Followers"
                        min={0}
                        max={10000000}
                        step={1000}
                        value={twitterFollowers}
                        onChange={(val) => setTwitterFollowers(val as number)}
                        formatValue={(val) => formatNumber(val)}
                        showValue
                        gradientColors={['#1DA1F2', '#0d8dd6']}
                      />
                    </div>
                    <div>
                      <CreativeSlider
                        label="Engagement Rate (%)"
                        min={0}
                        max={20}
                        step={0.1}
                        value={twitterEngagement}
                        onChange={(val) => setTwitterEngagement(val as number)}
                        formatValue={(val) => `${val.toFixed(1)}%`}
                        showValue
                        gradientColors={['#1DA1F2', '#0d8dd6']}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ProfileSectionCard>

            {/* 4. Interests & Hobbies Section */}
            <ProfileSectionCard
              id="interests"
              title="Interests & Hobbies"
              description="What makes you unique"
              icon={Heart}
              completionPercentage={calculateInterestsCompletion()}
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Creation Interests
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Select the types of content you enjoy creating
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Sports Training',
                      'Game Day Vlogs',
                      'Fitness & Nutrition',
                      'Fashion & Style',
                      'Campus Life',
                      'Mental Health Advocacy',
                      'Product Reviews',
                      'Tutorials',
                    ].map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleItem(contentInterests, setContentInterests, interest)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          contentInterests.includes(interest)
                            ? 'border-primary-500 bg-primary-50 text-primary-900'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700'
                        }`}
                      >
                        <span className="text-sm font-medium">{interest}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Causes You Care About
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Social causes and issues important to you
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Youth Sports Access',
                      'Mental Health Awareness',
                      'Gender Equality in Sports',
                      'Education',
                      'Environmental Sustainability',
                      'Social Justice',
                    ].map((cause) => (
                      <button
                        key={cause}
                        type="button"
                        onClick={() => toggleItem(causes, setCauses, cause)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          causes.includes(cause)
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700'
                        }`}
                      >
                        <span className="text-sm font-medium">{cause}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lifestyle Interests & Hobbies
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Hobbies and activities outside of sports
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Music',
                      'Fashion',
                      'Photography',
                      'Travel',
                      'Gaming',
                      'Cooking',
                      'Art',
                      'Technology',
                    ].map((hobby) => (
                      <button
                        key={hobby}
                        type="button"
                        onClick={() => toggleItem(hobbies, setHobbies, hobby)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          hobbies.includes(hobby)
                            ? 'border-accent-500 bg-accent-50 text-accent-900'
                            : 'border-gray-200 hover:border-accent-300 hover:bg-accent-50 text-gray-700'
                        }`}
                      >
                        <span className="text-sm font-medium">{hobby}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ProfileSectionCard>

            {/* 5. NIL Preferences Section */}
            <ProfileSectionCard
              id="nil"
              title="NIL Preferences"
              description="Your partnership preferences"
              icon={DollarSign}
              completionPercentage={calculateNILCompletion()}
            >
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Help brands find you!</strong> Share your NIL preferences to match with
                    the right partnership opportunities.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Deal Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Sponsored Posts',
                      'Brand Ambassador',
                      'Content Creation',
                      'Event Appearances',
                      'Product Endorsements',
                    ].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleItem(dealTypes, setDealTypes, type)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          dealTypes.includes(type)
                            ? 'border-primary-500 bg-primary-50 text-primary-900'
                            : 'border-gray-200 hover:border-primary-300 text-gray-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <CreativeSlider
                    label="Compensation Range (USD)"
                    min={0}
                    max={100000}
                    step={500}
                    value={[minCompensation, maxCompensation]}
                    onChange={(val) => {
                      const [min, max] = val as [number, number];
                      setMinCompensation(min);
                      setMaxCompensation(max);
                    }}
                    formatValue={(val) => formatCurrency(val)}
                    range
                    snapPoints={[1000, 5000, 10000, 25000, 50000, 75000]}
                    showValue
                    gradientColors={['#f97316', '#f59e0b']}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Drag both ends to set your desired compensation range
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Types Willing to Create
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Instagram Posts & Stories',
                      'TikTok Videos',
                      'YouTube Videos',
                      'Blog Posts',
                      'Podcast Appearances',
                    ].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          toggleItem(contentTypesWilling, setContentTypesWilling, type)
                        }
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          contentTypesWilling.includes(type)
                            ? 'border-primary-500 bg-primary-50 text-primary-900'
                            : 'border-gray-200 hover:border-primary-300 text-gray-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={travelWilling}
                      onChange={(e) => setTravelWilling(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Willing to travel for brand partnerships
                    </span>
                  </label>
                </div>
              </div>
            </ProfileSectionCard>

            {/* 6. Portfolio Section — hidden when HS student's state doesn't allow NIL */}
            {(profile?.role !== 'hs_student' || profile?.state_nil_allowed !== false) && (
              <ProfileSectionCard
                id="portfolio"
                title="Portfolio"
                description="Showcase your work"
                icon={ImageIcon}
                completionPercentage={calculatePortfolioCompletion()}
              >
                {user?.id && <PortfolioManagementSection userId={user.id} />}
              </ProfileSectionCard>
            )}
          </div>
        </div>
      </div>

      {/* Position Picker Modal for Primary Sport */}
      <PositionPickerModal
        sport={primarySport.sport}
        currentPosition={primarySport.position}
        isOpen={positionModalOpen}
        onClose={() => setPositionModalOpen(false)}
        onSelect={(position) => {
          setPrimarySport({ ...primarySport, position });
          setPositionModalOpen(false);
        }}
        allowCustom
      />
    </>
  );
}
