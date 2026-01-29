'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { JourneyProgress } from './JourneyProgress';
import { StateRulesCard } from './StateRulesCard';
import { ParentConsentCard } from './ParentConsentCard';
import { ChaptersGrid } from './ChaptersGrid';
import { BadgeCollection } from './BadgeCollection';
import { StreakTracker } from './StreakTracker';
import { DailyQuestionCard } from './DailyQuestionCard';
import { PillarType } from '@/lib/discovery/questions';

interface DashboardData {
  user: {
    id: string;
    fullName: string;
    sport: string;
    school: string;
    state?: string;
    avatar?: string;
    age?: number;
  };
  discovery: {
    completionPercentage: number;
    currentPillar: PillarType;
    currentDay: number;
    unlockedChapters: PillarType[];
    isComplete: boolean;
  };
  consent: {
    status: 'pending' | 'approved' | 'expired' | 'not_required';
    parentEmail?: string;
    requestedAt?: string;
  };
  chapters: Record<PillarType, {
    unlocked: boolean;
    quizAvailable?: boolean;
    quizScore?: number;
    insights?: string[];
  }>;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt?: string;
    category: 'discovery' | 'quiz' | 'streak' | 'engagement' | 'milestone';
  }>;
  streak: {
    current: number;
    longest: number;
    lastActivity?: string;
    weekActivity: boolean[];
  };
  dailyQuestion?: {
    id: string;
    question: string;
    category: string;
  };
}

export function HSStudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get access token for API auth
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/dashboard/hs-student', {
        credentials: 'include',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. This dashboard is for high school students.');
          return;
        }
        throw new Error('Failed to load dashboard');
      }

      const dashboardData = await response.json();

      // Transform API response to component data format
      setData({
        user: {
          id: dashboardData.user.id,
          fullName: dashboardData.user.fullName,
          sport: dashboardData.user.sport,
          school: dashboardData.user.school,
          state: dashboardData.user.state || 'CA',
          avatar: dashboardData.user.avatar,
        },
        discovery: {
          completionPercentage: dashboardData.discovery.completionPercentage,
          currentPillar: dashboardData.discovery.currentPillar,
          currentDay: dashboardData.discovery.currentDay,
          unlockedChapters: dashboardData.discovery.unlockedChapters,
          isComplete: dashboardData.discovery.isComplete,
        },
        consent: {
          status: dashboardData.consent?.status || 'approved',
          parentEmail: dashboardData.consent?.parentEmail,
          requestedAt: dashboardData.consent?.requestedAt,
        },
        chapters: {
          identity: {
            unlocked: dashboardData.discovery.unlockedChapters.includes('identity'),
            insights: dashboardData.profile?.identity?.data
              ? Object.values(dashboardData.profile.identity.data).filter(Boolean).slice(0, 2) as string[]
              : [],
          },
          business: {
            unlocked: dashboardData.discovery.unlockedChapters.includes('business'),
            insights: dashboardData.profile?.business?.data
              ? Object.values(dashboardData.profile.business.data).filter(Boolean).slice(0, 2) as string[]
              : [],
          },
          money: {
            unlocked: dashboardData.discovery.unlockedChapters.includes('money'),
            insights: dashboardData.profile?.money?.data
              ? Object.values(dashboardData.profile.money.data).filter(Boolean).slice(0, 2) as string[]
              : [],
          },
          legacy: {
            unlocked: dashboardData.discovery.unlockedChapters.includes('legacy'),
            insights: dashboardData.profile?.legacy?.data
              ? Object.values(dashboardData.profile.legacy.data).filter(Boolean).slice(0, 2) as string[]
              : [],
          },
        },
        badges: dashboardData.badges || [],
        streak: {
          current: dashboardData.streak || 0,
          longest: dashboardData.longestStreak || dashboardData.streak || 0,
          lastActivity: dashboardData.lastActivity,
          weekActivity: dashboardData.weekActivity || [false, false, false, false, false, false, true],
        },
        dailyQuestion: dashboardData.dailyQuestion,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConsent = async () => {
    await fetch('/api/parent/resend-consent', { method: 'POST' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-lg">
          <span className="text-5xl">😕</span>
          <h2 className="text-xl font-bold text-gray-900 mt-4">Oops!</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stateNames: Record<string, string> = {
    CA: 'California',
    TX: 'Texas',
    FL: 'Florida',
    NY: 'New York',
    OH: 'Ohio',
  };

  return (
    <div data-testid="hs-student-dashboard" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.user.avatar ? (
              <img
                src={data.user.avatar}
                alt={data.user.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-semibold">
                  {data.user.fullName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 data-testid="welcome-message" className="font-semibold text-gray-900">
                Hey, {data.user.fullName.split(' ')[0]}! 👋
              </h1>
              <p data-testid="user-info" className="text-sm text-gray-500">
                {data.user.sport} • {data.user.school}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Parent Consent Banner (if pending) */}
        {data.consent.status !== 'approved' && data.consent.status !== 'not_required' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ParentConsentCard
              status={data.consent.status}
              parentEmail={data.consent.parentEmail}
              requestedAt={data.consent.requestedAt}
              onResendRequest={handleResendConsent}
            />
          </motion.div>
        )}

        {/* Journey Progress - Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <JourneyProgress
            currentPillar={data.discovery.currentPillar}
            currentDay={data.discovery.currentDay}
            unlockedChapters={data.discovery.unlockedChapters}
            completionPercentage={data.discovery.completionPercentage}
          />
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Chapters Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ChaptersGrid
                chapters={data.chapters}
                currentPillar={data.discovery.currentPillar}
              />
            </motion.div>

            {/* Daily Question */}
            {data.dailyQuestion && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <DailyQuestionCard question={data.dailyQuestion} />
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* State Rules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <StateRulesCard
                stateName={stateNames[data.user.state || 'CA'] || data.user.state || 'California'}
                stateCode={data.user.state || 'CA'}
              />
            </motion.div>

            {/* Streak Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <StreakTracker
                currentStreak={data.streak.current}
                longestStreak={data.streak.longest}
                lastActivityDate={data.streak.lastActivity}
                weekActivity={data.streak.weekActivity}
              />
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <BadgeCollection earnedBadges={data.badges} />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
