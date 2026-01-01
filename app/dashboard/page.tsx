/**
 * Athlete Dashboard Page - Redesigned V2
 *
 * Streamlined dashboard following 2025 UX best practices:
 * - Reduced from 11 sections to 4 (70% less scroll)
 * - Action-first layout (actionable items above the fold)
 * - Compact stats bar with FMV integrated
 * - Featured opportunity hero card
 * - Unified activity feed (merged activity + notifications)
 * - Floating AI Coach access
 *
 * Layout: "Action First, Stats Second, History Third"
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import useSWR from 'swr';

// New redesigned components
import { CompactStatsBar } from '@/components/dashboard/CompactStatsBar';
import { FeaturedOpportunity } from '@/components/dashboard/FeaturedOpportunity';
import { ActionRequiredPanel } from '@/components/dashboard/ActionRequiredPanel';
import { UnifiedActivityFeed } from '@/components/dashboard/UnifiedActivityFeed';
import { CompactArchetypeCard } from '@/components/dashboard/CompactArchetypeCard';
import { CompactKnowledgeCard } from '@/components/dashboard/CompactKnowledgeCard';
import { useQuizProgress } from '@/hooks/useDashboardData';

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Fetch archetype/traits data
  const { data: assessmentData } = useSWR(
    user?.id ? `/api/assessment/results?userId=${user.id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Fetch quiz progress data
  const { data: quizData } = useQuizProgress(user?.id);

  // Redirect if not authenticated or if agency user
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/?auth=login');
    } else if (!isLoading && user && user.role === 'agency') {
      router.replace('/agency/dashboard');
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
    <div className="min-h-screen bg-[#FAF6F1]">
      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome back, {user.first_name || 'Athlete'}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Your NIL dashboard
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Section 1: Compact Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-6"
        >
          <CompactStatsBar />
        </motion.div>

        {/* Section 2: Priority Grid (Featured Opportunity + Action Required) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Featured Opportunity - 3/5 width on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <FeaturedOpportunity />
          </motion.div>

          {/* Action Required Panel - 2/5 width on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <ActionRequiredPanel />
          </motion.div>
        </div>

        {/* Section 3: Archetype & Knowledge Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <CompactArchetypeCard
              archetype={assessmentData?.results?.archetypeName || null}
              traits={
                assessmentData?.results?.traitScores
                  ? Object.entries(assessmentData.results.traitScores)
                      .map(([name, score]) => ({
                        name: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                        score: score as number,
                      }))
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 3)
                  : []
              }
              completedAt={assessmentData?.results?.calculatedAt}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <CompactKnowledgeCard
              quizzesCompleted={quizData?.completed || 0}
              totalQuizzes={quizData?.total || 10}
              badgesEarned={quizData?.badges || 0}
              currentStreak={quizData?.streak || 0}
            />
          </motion.div>
        </div>

        {/* Section 4: Unified Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mb-6"
        >
          <UnifiedActivityFeed limit={6} />
        </motion.div>

      </div>
    </div>
  );
}
