/**
 * Athlete Dashboard Page
 *
 * Production-ready dashboard with:
 * - Real-time data from materialized views
 * - Auto-refresh every 30 seconds via SWR
 * - Loading skeletons and error states
 * - Responsive grid layout
 * - Framer Motion animations
 */

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { QuickStatsCard } from '@/components/dashboard/QuickStatsCard';
import { FMVScoreCard } from '@/components/dashboard/FMVScoreCard';
import { ActivityFeedWidget } from '@/components/dashboard/ActivityFeedWidget';
import { CampaignOpportunities } from '@/components/dashboard/CampaignOpportunities';
import { UpcomingEventsWidget } from '@/components/dashboard/UpcomingEventsWidget';
import { NotificationsWidget } from '@/components/dashboard/NotificationsWidget';
// QuickActionsWidget removed - actions accessible via nav
import { QuizProgressWidget } from '@/components/dashboard/QuizProgressWidget';
import { RecentChatsWidget } from '@/components/dashboard/RecentChatsWidget';
import { LiveMatchUpdatesWidget } from '@/components/dashboard/LiveMatchUpdatesWidget';
import { AthleteMatchOpportunitiesWidget } from '@/components/dashboard/AthleteMatchOpportunitiesWidget';
import { CoreTraitsWidget } from '@/components/dashboard/CoreTraitsWidget';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated or if agency user
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/?auth=login');
    } else if (!isLoading && user && user.role === 'agency') {
      router.replace('/agencies/dashboard');
    }
  }, [user, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard until authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Modern Clean Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">
                Welcome back, {user.first_name || 'Athlete'}
              </h1>
              <p className="text-sm text-slate-600">
                Track your NIL performance and brand opportunities
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
              </span>
              <span className="text-green-700 font-medium text-sm">Live</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <QuickStatsCard className="mb-8" />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Athlete Match Opportunities - Main detailed view */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <AthleteMatchOpportunitiesWidget limit={3} showHeader={true} />
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <ActivityFeedWidget limit={8} />
            </motion.div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Core Traits / Brand Identity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <CoreTraitsWidget userId={user?.id} />
            </motion.div>

            {/* FMV Score Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <FMVScoreCard showDetails={true} />
            </motion.div>

            {/* Live Match Updates - Compact notifications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <LiveMatchUpdatesWidget limit={3} />
            </motion.div>

            {/* Quiz Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <QuizProgressWidget userId={user?.id} />
            </motion.div>

            {/* Upcoming Events Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <UpcomingEventsWidget />
            </motion.div>

            {/* Notifications Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <NotificationsWidget />
            </motion.div>
          </div>
        </div>

        {/* AI Coach Section - V3 Premium Professional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-10"
        >
          {/* Professional Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold tracking-tight text-gray-900">AI Coach</h2>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Centered Chat Widget */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <RecentChatsWidget userId={user?.id} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
