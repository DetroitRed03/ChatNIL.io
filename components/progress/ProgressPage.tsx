'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import ProgressHeader from './ProgressHeader';
import DiscoveryProgress from './DiscoveryProgress';
import QuizPerformance from './QuizPerformance';
import AchievementGrid from './AchievementGrid';
import DealHistory from './DealHistory';
import ActivityTimeline from './ActivityTimeline';
import { StreakTracker } from '@/components/dashboard/hs-student/StreakTracker';

interface ProgressData {
  user: {
    fullName: string;
    sport: string;
    school: string;
    role: string;
    avatar: string | null;
  };
  gamification: {
    level: number;
    currentXP: number;
    lifetimeXP: number;
    xpToNextLevel: number;
    xpInLevel: number;
    levelThreshold: number;
  };
  discovery: {
    currentPillar: string;
    currentDay: number;
    completedPillars: string[];
    totalPillars: number;
    completionPercentage: number;
    isComplete: boolean;
    profileCompleteness: number;
  } | null;
  quizStats: {
    total_questions_attempted: number;
    total_questions_correct: number;
    average_score_percentage: number;
    quizzes_completed: number;
    total_points_earned: number;
    total_time_spent_seconds: number;
  };
  quizCategories: Array<{
    category: string;
    name: string;
    questionCount: number;
    completedCount: number;
    averageScore: number;
  }>;
  badges: {
    earned: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      rarity: string;
      points: number;
      earnedAt: string;
    }>;
    totalAvailable: number;
    earnedCount: number;
  };
  deals: Array<{
    id: string;
    brandName: string;
    compensationAmount: number | null;
    status: string;
    complianceStatus: string | null;
    createdAt: string;
  }>;
  streak: {
    current: number;
    longest: number;
    weekActivity: boolean[];
    lastActivity: string | null;
  };
  activity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
  }>;
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/progress', {
        credentials: 'include',
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to view your progress.');
          return;
        }
        throw new Error('Failed to load progress');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Failed to load progress:', err);
      setError('Unable to load your progress. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Something went wrong.'}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isHSStudent = data.user.role === 'hs_student';

  return (
    <div className="flex flex-col overflow-y-auto min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20 py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Level & XP Header */}
        <ProgressHeader
          level={data.gamification.level}
          lifetimeXP={data.gamification.lifetimeXP}
          xpInLevel={data.gamification.xpInLevel}
          xpToNextLevel={data.gamification.xpToNextLevel}
          levelThreshold={data.gamification.levelThreshold}
          userName={data.user.fullName}
        />

        {/* Discovery Progress - HS Students Only */}
        {isHSStudent && data.discovery && (
          <DiscoveryProgress
            currentPillar={data.discovery.currentPillar}
            currentDay={data.discovery.currentDay}
            completedPillars={data.discovery.completedPillars}
            completionPercentage={data.discovery.completionPercentage}
          />
        )}

        {/* Quiz Performance + Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuizPerformance
            averageScore={data.quizStats.average_score_percentage}
            quizzesCompleted={data.quizStats.quizzes_completed}
            totalAttempted={data.quizStats.total_questions_attempted}
            categories={data.quizCategories}
          />
          <AchievementGrid
            earned={data.badges.earned}
            totalAvailable={data.badges.totalAvailable}
            earnedCount={data.badges.earnedCount}
          />
        </div>

        {/* Deal History + Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.deals.length > 0 ? (
            <>
              <DealHistory deals={data.deals} />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <StreakTracker
                  currentStreak={data.streak.current}
                  longestStreak={data.streak.longest}
                  lastActivityDate={data.streak.lastActivity || undefined}
                  weekActivity={data.streak.weekActivity}
                />
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 max-w-md"
            >
              <StreakTracker
                currentStreak={data.streak.current}
                longestStreak={data.streak.longest}
                lastActivityDate={data.streak.lastActivity || undefined}
                weekActivity={data.streak.weekActivity}
              />
            </motion.div>
          )}
        </div>

        {/* Activity Timeline */}
        <ActivityTimeline activities={data.activity} />
      </div>
    </div>
  );
}
