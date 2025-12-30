/**
 * Agency Dashboard Page - Business-Focused
 *
 * Professional dashboard for agencies managing NIL campaigns and athlete partnerships.
 * Features business KPIs, not personal growth metrics.
 *
 * Design Philosophy:
 * - Professional warm aesthetic (muted by ~20% vs athlete dashboard)
 * - Data-driven, not encouraging
 * - Business terminology (ROI, spend, impressions)
 * - No sidebar (agencies don't need AI chat)
 * - Focus on campaign management and athlete performance
 */

'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/AuthGuard';
import { motion } from 'framer-motion';
import { Plus, Calendar } from 'lucide-react';
import Link from 'next/link';

// Business-focused widgets
import { CampaignPerformanceOverview } from '@/components/dashboard/agency/CampaignPerformanceOverview';
import { ActiveAthletesRoster } from '@/components/dashboard/agency/ActiveAthletesRoster';
import { BudgetTracker } from '@/components/dashboard/agency/BudgetTracker';
// import { PendingActionsWidget } from '@/components/dashboard/agency/PendingActionsWidget'; // Hidden until approval workflow is implemented
import { AgencyActivityFeed } from '@/components/dashboard/agency/AgencyActivityFeed';
import { AgencyMatchUpdatesWidget } from '@/components/dashboard/agency/AgencyMatchUpdatesWidget';

function AgencyDashboardContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated or not agency role
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/?auth=login');
    }
    // TODO: Add role check when agency role is implemented
    // if (!isLoading && user && user.role !== 'agency') {
    //   router.replace('/dashboard');
    // }
  }, [user, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/15 via-amber-50/8 to-yellow-50/15 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard until authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/15 via-amber-50/8 to-yellow-50/15">
      {/* Professional Header - Muted Warm Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 border-b border-orange-600/20 overflow-hidden"
      >
        {/* Subtle background shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatDelay: 4,
          }}
        />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            {/* Title Section */}
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Agency Dashboard
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/85 text-base font-medium"
              >
                Manage your NIL campaigns and athlete partnerships
              </motion.p>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3"
            >
              <Link
                href="/agency/campaigns"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white font-semibold text-sm transition-all"
              >
                <Calendar className="w-4 h-4" />
                View Campaigns
              </Link>
              <Link
                href="/agency/campaigns/new"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 rounded-lg text-orange-600 font-bold text-sm shadow-lg shadow-black/10 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Campaign
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Campaign Performance Overview - Hero Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <CampaignPerformanceOverview />
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Athletes Roster */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <ActiveAthletesRoster />
            </motion.div>

            {/* Agency Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <AgencyActivityFeed />
            </motion.div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Pending Actions - Hidden until approval workflow is implemented
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <PendingActionsWidget />
            </motion.div>
            */}

            {/* Real-Time Match Updates - SSE Notifications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.28 }}
            >
              <AgencyMatchUpdatesWidget limit={5} />
            </motion.div>

            {/* Budget Tracker */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <BudgetTracker />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgencyDashboardPage() {
  return (
    <ProtectedRoute>
      <AgencyDashboardContent />
    </ProtectedRoute>
  );
}
