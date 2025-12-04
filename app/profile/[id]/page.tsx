import * as React from 'react';
import { notFound } from 'next/navigation';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { AboutSection } from '@/components/profile/AboutSection';
import { AthleticSection } from '@/components/profile/AthleticSection';
import { SocialMediaStatsCard } from '@/components/profile/reusable/SocialMediaStatsCard';
import { PortfolioGrid } from '@/components/profile/reusable/PortfolioItemCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  MessageCircle, Download, Share2, Instagram, Twitter, Video,
  Heart, Leaf, Star, DollarSign, TrendingUp, CheckCircle, Target
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  params: {
    id: string;
  };
}

// Fetch athlete profile from database
async function getAthleteProfile(id: string) {
  const supabase = await createClient();

  // Fetch user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (userError || !user) {
    return null;
  }

  // Fetch athlete profile data (contains detailed athletic info)
  const { data: athleteProfile } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', id)
    .single();

  // Fetch social media stats
  const { data: socialStatsArray } = await supabase
    .from('social_media_stats')
    .select('*')
    .eq('user_id', id);

  // Fetch NIL deals data for this athlete
  const { data: nilDeals } = await supabase
    .from('nil_deals')
    .select('id, status, compensation_amount')
    .eq('athlete_id', id);

  // Calculate active deals count and total earnings
  let activeDealCount = 0;
  let totalNILEarnings = 0;

  if (nilDeals && nilDeals.length > 0) {
    // Count active deals (active, completed, pending)
    activeDealCount = nilDeals.filter(
      (deal) => deal.status === 'active' || deal.status === 'pending'
    ).length;

    // Sum up compensation from completed/active deals
    totalNILEarnings = nilDeals
      .filter((deal) => deal.status === 'completed' || deal.status === 'active')
      .reduce((sum, deal) => sum + (parseFloat(String(deal.compensation_amount)) || 0), 0);
  }

  // Transform social stats into the format expected by the UI
  // New schema: each row is one platform with: platform, handle, followers, engagement_rate, verified
  const socialMediaStats: any = {};
  let totalFollowers = 0;
  let avgEngagementRate = 0;

  if (socialStatsArray && socialStatsArray.length > 0) {
    let totalEngagement = 0;

    // Process each platform row
    for (const stat of socialStatsArray) {
      const platform = stat.platform;
      if (!platform) continue;

      socialMediaStats[platform] = {
        handle: stat.handle || '',
        followers: stat.followers || 0,
        engagementRate: stat.engagement_rate || 0,
        verified: stat.verified || false,
      };

      totalFollowers += stat.followers || 0;
      totalEngagement += stat.engagement_rate || 0;
    }

    avgEngagementRate = socialStatsArray.length > 0
      ? totalEngagement / socialStatsArray.length
      : 0;
  }

  // Calculate FMV tier from estimated_fmv
  const getFMVTier = (fmv: number | null): string => {
    if (!fmv) return 'Bronze';
    if (fmv >= 100000) return 'Platinum';
    if (fmv >= 50000) return 'Gold';
    if (fmv >= 25000) return 'Silver';
    return 'Bronze';
  };

  // Transform data to match component expectations
  // Prioritize athlete_profiles data over users table data
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    profilePhoto: athleteProfile?.profile_photo_url || user.profile_photo,
    coverPhoto: athleteProfile?.cover_photo_url || null,
    bio: athleteProfile?.bio || null,

    // Personal
    school: athleteProfile?.school || user.school_name,
    graduationYear: athleteProfile?.graduation_year || user.graduation_year,
    major: athleteProfile?.major || user.major,
    gpa: athleteProfile?.gpa || user.gpa,

    // Athletic
    primarySport: athleteProfile?.sport || user.primary_sport,
    position: athleteProfile?.position || user.position,
    heightInches: athleteProfile?.height_inches,
    weightLbs: athleteProfile?.weight_lbs,
    jerseyNumber: athleteProfile?.jersey_number,
    secondarySports: athleteProfile?.secondary_sports || user.secondary_sports || [],
    division: undefined, // Not in database yet
    teamName: undefined, // Not in database yet
    achievements: athleteProfile?.achievements || user.achievements || [],
    coachName: user.coach_name,
    coachEmail: user.coach_email,

    // Social
    totalFollowers,
    avgEngagementRate,
    socialMediaStats,

    // Interests
    contentCreationInterests: athleteProfile?.nil_interests || user.content_creation_interests || [],
    lifestyleInterests: user.lifestyle_interests || [],
    causesCareAbout: user.causes_care_about || [],
    brandAffinity: athleteProfile?.brand_preferences || user.brand_affinity || [],

    // NIL
    fmvScore: athleteProfile?.estimated_fmv || 0,
    fmvTier: getFMVTier(athleteProfile?.estimated_fmv),
    activeDealCount,
    totalNILEarnings,
    nilGoals: athleteProfile?.nil_goals || [],
    nilConcerns: athleteProfile?.nil_concerns || [],

    // Portfolio
    contentSamples: athleteProfile?.content_samples || user.content_samples || [],
  };
}

export default async function AthleteProfilePage({ params }: PageProps) {
  const athlete = await getAthleteProfile(params.id);

  if (!athlete) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="mb-8">
        <ProfileHero athlete={athlete} />
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <AboutSection athlete={athlete} />

            {/* Athletic Information */}
            <AthleticSection
              athlete={athlete}
              viewMode="public" // Change to 'verified-brand' to show coach info
            />

            {/* Social Media Presence */}
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-success-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-success-600" />
                  </div>
                  <CardTitle>Social Media Presence</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {athlete.socialMediaStats.instagram && (
                    <SocialMediaStatsCard
                      platform="instagram"
                      data={athlete.socialMediaStats.instagram}
                      onChange={() => {}}
                      isEditable={false}
                      showLastUpdated={false}
                    />
                  )}
                  {athlete.socialMediaStats.tiktok && (
                    <SocialMediaStatsCard
                      platform="tiktok"
                      data={athlete.socialMediaStats.tiktok}
                      onChange={() => {}}
                      isEditable={false}
                      showLastUpdated={false}
                    />
                  )}
                  {athlete.socialMediaStats.twitter && (
                    <SocialMediaStatsCard
                      platform="twitter"
                      data={athlete.socialMediaStats.twitter}
                      onChange={() => {}}
                      isEditable={false}
                      showLastUpdated={false}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Interests & Values */}
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent-100 rounded-lg">
                    <Heart className="h-5 w-5 text-accent-600" />
                  </div>
                  <CardTitle>Interests & Values</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Content Creation */}
                {athlete.contentCreationInterests.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2">
                      Content Creation
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {athlete.contentCreationInterests.map((interest: string) => (
                        <Badge key={interest} variant="primary">
                          {interest.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lifestyle */}
                {athlete.lifestyleInterests.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2">
                      Lifestyle Interests
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {athlete.lifestyleInterests.map((interest: string) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Causes */}
                {athlete.causesCareAbout.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-success-600" />
                      Causes I Care About
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {athlete.causesCareAbout.map((cause: string) => (
                        <Badge key={cause} variant="success">
                          {cause.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brand Affinity */}
                {athlete.brandAffinity.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-accent-600" />
                      Brand Affinity
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {athlete.brandAffinity.map((brand: string) => (
                        <Badge key={brand} variant="accent">
                          {brand.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* NIL Goals & Aspirations */}
            {(athlete.nilGoals && athlete.nilGoals.length > 0) && (
              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle>NIL Goals & Aspirations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {athlete.nilGoals.map((goal: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-sm text-text-primary flex-1">
                          {goal}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio Gallery */}
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Video className="h-5 w-5 text-primary-600" />
                    </div>
                    <CardTitle>Portfolio</CardTitle>
                  </div>
                  <Badge variant="gray">{athlete.contentSamples.length} items</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <PortfolioGrid
                  items={athlete.contentSamples}
                  mode="view"
                  onClick={(item) => console.log('View item:', item)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="primary" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Partnership Discussion
                </Button>
                <Button variant="secondary" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Media Kit
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-lg">Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-3 bg-success-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-success-700">
                    Available for partnerships
                  </span>
                </div>
                <p className="text-xs text-text-tertiary">
                  Typical response time: 24-48 hours
                </p>
              </CardContent>
            </Card>

            {/* FMV Breakdown */}
            <Card variant="elevated" className="bg-gradient-to-br from-accent-50 to-primary-50 border-accent-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-accent-600" />
                  <CardTitle className="text-lg">Fair Market Value</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-text-primary mb-1">
                    ${(athlete.fmvScore / 1000).toFixed(1)}K
                  </div>
                  <Badge variant="accent" className="mb-2">
                    <Star className="h-3 w-3 mr-1" />
                    {athlete.fmvTier} Tier
                  </Badge>
                  <p className="text-xs text-text-tertiary">
                    Top 15% of athletes in tier
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Social Score</span>
                    <span className="font-semibold text-text-primary">85%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Engagement Score</span>
                    <span className="font-semibold text-text-primary">92%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">Athletic Performance</span>
                    <span className="font-semibold text-text-primary">78%</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-accent-200">
                  <div className="flex items-center gap-2 text-xs text-accent-800">
                    <CheckCircle className="h-4 w-4" />
                    <span>Verified metrics</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
