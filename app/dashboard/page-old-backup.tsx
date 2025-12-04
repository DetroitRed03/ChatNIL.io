'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Hash,
  GraduationCap,
  User as UserIcon,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { CampaignOpportunities } from '@/components/dashboard/CampaignOpportunities';

// import { KeyMetrics } from '@/components/dashboard/KeyMetrics';
// import { ActiveDealsSection } from '@/components/dashboard/ActiveDealsSection';
// import { OpportunitiesSection } from '@/components/dashboard/OpportunitiesSection';
// import { NotificationsSidebar } from '@/components/dashboard/NotificationsSidebar';
// import { UpcomingEventsWidget } from '@/components/dashboard/UpcomingEventsWidget';
// import { QuickStatsWidget } from '@/components/dashboard/QuickStatsWidget';
// import { LearningProgressWidget } from '@/components/dashboard/LearningProgressWidget';
// import { BadgesWidget } from '@/components/dashboard/BadgesWidget';
// import { DocumentsWidget } from '@/components/dashboard/DocumentsWidget';
import { supabase } from '@/lib/supabase';
// import type { DashboardMetrics, NILDeal, Opportunity, Notification, Event, QuickStats, QuizProgress, BadgeProgress, RecentChat, LearningStats, UserDocument, DocumentsStats } from '@/types';

// Types for profile data
interface SecondarySport {
  sport: string;
  position?: string;
}

interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_photo_url?: string;
  primary_sport?: string;
  position?: string;
  secondary_sports?: SecondarySport[];
  jersey_number?: number | null;
  height_inches?: number | null;
  weight_lbs?: number | null;
  school_name?: string;
  graduation_year?: number;
}

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

function getSportIcon(sport?: string): string {
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
}

// Parse secondary sports data (handles both string and object formats)
function parseSecondarySports(secondary_sports: any): SecondarySport[] {
  if (!secondary_sports || !Array.isArray(secondary_sports)) return [];

  return secondary_sports.map((sport: any) => {
    // If it's already an object with sport/position, return as-is
    if (typeof sport === 'object' && sport.sport) {
      return sport;
    }
    // If it's a JSON string, parse it
    if (typeof sport === 'string') {
      try {
        const parsed = JSON.parse(sport);
        // Handle double-stringified case
        if (typeof parsed === 'string') {
          return JSON.parse(parsed);
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing secondary sport:', e);
        return null;
      }
    }
    return null;
  }).filter(Boolean);
}

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  // const [dashboardData, setDashboardData] = useState<{
  //   metrics: DashboardMetrics | null;
  //   deals: NILDeal[];
  //   opportunities: Opportunity[];
  //   notifications: Notification[];
  //   events: Event[];
  //   stats: QuickStats | null;
  //   quizzes: QuizProgress | null;
  //   badges: BadgeProgress | null;
  //   chats: RecentChat[];
  //   learningStats: LearningStats | null;
  //   documents: UserDocument[];
  //   documentsStats: DocumentsStats | null;
  // }>({
  //   metrics: null,
  //   deals: [],
  //   opportunities: [],
  //   notifications: [],
  //   events: [],
  //   stats: null,
  //   quizzes: null,
  //   badges: null,
  //   chats: [],
  //   learningStats: null,
  //   documents: [],
  //   documentsStats: null,
  // });
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch full user profile data
  useEffect(() => {
    async function fetchProfileData() {
      if (!user?.id) return;

      try {
        setProfileLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, profile_photo_url, primary_sport, position, secondary_sports, jersey_number, height_inches, weight_lbs, school_name, graduation_year')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('❌ Error fetching profile data:', error);
          return;
        }

        console.log('✅ Dashboard profile data loaded:', data);
        console.log('📊 Secondary sports:', data?.secondary_sports);
        setProfileData(data);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfileData();
  }, [user?.id]);

  // Redirect if not authenticated (only after loading completes)
  useEffect(() => {
    // Only redirect if we're done loading AND user is definitely not authenticated
    // Use replace() instead of push() to avoid adding to history stack
    // This allows back button to work properly without redirect loops
    if (!isLoading && !user) {
      router.replace('/?auth=login');
    }
  }, [user, isLoading, router]);

  // Fetch dashboard data
  // useEffect(() => {
  //   async function fetchDashboardData() {
  //     if (!user) return;

  //     try {
  //       setDataLoading(true);

  //       // Fetch all data from client-side API routes
  //       const [
  //         metricsRes,
  //         dealsRes,
  //         opportunitiesRes,
  //         notificationsRes,
  //         eventsRes,
  //         statsRes,
  //         quizzesRes,
  //         badgesRes,
  //         chatsRes,
  //         learningRes,
  //         documentsRes,
  //       ] = await Promise.all([
  //         fetch('/api/dashboard/metrics'),
  //         fetch('/api/dashboard/deals'),
  //         fetch('/api/dashboard/opportunities'),
  //         fetch('/api/dashboard/notifications'),
  //         fetch('/api/dashboard/events'),
  //         fetch('/api/dashboard/stats'),
  //         fetch('/api/dashboard/quizzes'),
  //         fetch('/api/dashboard/badges'),
  //         fetch('/api/dashboard/chats'),
  //         fetch('/api/dashboard/learning'),
  //         fetch('/api/documents?limit=5'),
  //       ]);

  //       const metrics = metricsRes.ok ? await metricsRes.json() : null;
  //       const deals = dealsRes.ok ? (await dealsRes.json()).deals || [] : [];
  //       const opportunities = opportunitiesRes.ok ? (await opportunitiesRes.json()).opportunities || [] : [];
  //       const notifications = notificationsRes.ok ? (await notificationsRes.json()).notifications || [] : [];
  //       const events = eventsRes.ok ? (await eventsRes.json()).events || [] : [];
  //       const stats = statsRes.ok ? await statsRes.json() : null;
  //       const quizzes = quizzesRes.ok ? await quizzesRes.json() : null;
  //       const badges = badgesRes.ok ? await badgesRes.json() : null;
  //       const chats = chatsRes.ok ? (await chatsRes.json()).chats || [] : [];
  //       const learningStats = learningRes.ok ? await learningRes.json() : null;
  //       const documentsData = documentsRes.ok ? await documentsRes.json() : { documents: [], stats: null };

  //       setDashboardData({
  //         metrics: metrics || {
  //           totalEarnings: 0,
  //           earningsChange: 0,
  //           activeDeals: 0,
  //           completedDeals: 0,
  //           profileViews: 0,
  //           viewsChange: 0,
  //           fmvScore: 0,
  //           fmvChange: 0,
  //         },
  //         deals,
  //         opportunities,
  //         notifications,
  //         events,
  //         stats: stats || {
  //           responseRate: 0,
  //           avgResponseTime: '0 hours',
  //           dealSuccessRate: 0,
  //           profileGrowth: 0,
  //         },
  //         quizzes,
  //         badges,
  //         chats,
  //         learningStats,
  //         documents: documentsData.documents || [],
  //         documentsStats: documentsData.stats || null,
  //       });
  //     } catch (error) {
  //       console.error('Error fetching dashboard data:', error);
  //     } finally {
  //       setDataLoading(false);
  //     }
  //   }

  //   if (user) {
  //     fetchDashboardData();
  //   }
  // }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // Loading state
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-y-auto bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>

          {/* Profile Summary Header */}
          {profileData && (
            <div className="mb-6 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 border border-primary-100">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar
                    size="lg"
                    src={profileData.profile_photo_url}
                    fallback={profileData.first_name?.[0] || profileData.email?.[0] || 'U'}
                  />
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {profileData.first_name} {profileData.last_name}
                  </h2>

                  {/* Primary Sport + Physical Stats */}
                  {profileData.primary_sport && (
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xl">{getSportIcon(profileData.primary_sport)}</span>
                      <span className="font-semibold text-gray-900">{profileData.primary_sport}</span>
                      {profileData.position && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-700">{profileData.position}</span>
                        </>
                      )}

                      {/* Inline physical stats badges */}
                      {(profileData.jersey_number !== null || profileData.height_inches || profileData.weight_lbs) && (
                        <>
                          <span className="text-gray-400 hidden sm:inline">•</span>
                          <div className="flex flex-wrap gap-1.5">
                            {profileData.jersey_number !== null && profileData.jersey_number !== undefined && (
                              <span className="px-2 py-0.5 bg-white rounded text-xs font-semibold text-gray-700 flex items-center gap-1">
                                <Hash className="h-3 w-3" /> {profileData.jersey_number}
                              </span>
                            )}
                            {profileData.height_inches && (
                              <span className="px-2 py-0.5 bg-white rounded text-xs font-medium text-gray-700">
                                {formatHeight(profileData.height_inches)}
                              </span>
                            )}
                            {profileData.weight_lbs && (
                              <span className="px-2 py-0.5 bg-white rounded text-xs font-medium text-gray-700">
                                {formatWeight(profileData.weight_lbs)}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Secondary Sports - inline badges */}
                  {profileData.secondary_sports && profileData.secondary_sports.length > 0 && (() => {
                    const parsedSports = parseSecondarySports(profileData.secondary_sports);
                    return parsedSports.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">Also plays:</span>
                        {parsedSports.map((sport, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">
                            <span>{getSportIcon(sport.sport)}</span>
                            <span className="font-medium">{sport.sport}</span>
                            {sport.position && (
                              <span className="text-gray-500">({sport.position})</span>
                            )}
                          </span>
                        ))}
                      </div>
                    );
                  })()}

                  {/* School Info */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    {profileData.school_name && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4" />
                        {profileData.school_name}
                      </span>
                    )}
                    {profileData.graduation_year && (
                      <>
                        <span>•</span>
                        <span>Class of {profileData.graduation_year}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Campaign Opportunities - AI-Powered Matchmaking */}
              <CampaignOpportunities limit={5} showHeader={true} />

              {/* Active Deals Placeholder */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Deals</h2>
                <p className="text-gray-600">Track your active NIL deals and partnerships.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
                <p className="text-gray-600">Your NIL metrics at a glance.</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Progress</h2>
                <p className="text-gray-600">Continue your NIL education journey.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}