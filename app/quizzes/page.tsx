'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AthleteOnlyGuard } from '@/components/guards/AthleteOnlyGuard';
import QuizCard from '@/components/quiz/QuizCard';
import { supabase } from '@/lib/supabase';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuizCategoryInfo } from '@/lib/quiz';
import { useRouter } from 'next/navigation';
import { DifficultyTabs } from '@/components/quiz/DifficultyTabs';
import { DifficultyLevel } from '@/components/quiz/DifficultyBadge';
import { useQuizUnlockStatus } from '@/hooks/useDashboardData';
import { motion } from 'framer-motion';
import {
  Trophy,
  Award,
  Target,
  TrendingUp,
  Filter,
  Zap,
  BookOpen,
  Loader2
} from 'lucide-react';

export default function QuizListPage() {
  return (
    <AthleteOnlyGuard>
      <QuizListPageContent />
    </AthleteOnlyGuard>
  );
}

function QuizListPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<QuizCategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'not-started'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');

  // Fetch unlock status
  const { data: unlockData, isLoading: unlockLoading } = useQuizUnlockStatus(user?.id);

  useEffect(() => {
    if (user) {
      loadQuizData();
    }
  }, [user]);

  const loadQuizData = async () => {
    try {
      setLoading(true);

      const [categoriesRes, statsRes] = await Promise.all([
        fetch(`/api/quizzes?userId=${user?.id}`),
        fetch(`/api/quizzes/stats?userId=${user?.id}`)
      ]);

      const categoriesData = await categoriesRes.json();
      const statsData = await statsRes.json();

      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (category: QuizCategoryInfo) => {
    try {
      // Check sessionStorage availability first
      if (typeof window === 'undefined' || !window.sessionStorage) {
        console.error('sessionStorage is not available');
        alert('Unable to start quiz: browser storage is not available');
        return;
      }

      const response = await fetch('/api/quizzes/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          category: category.category,
          difficulty: null, // Mix of all difficulties
          questionCount: 10
        })
      });

      if (!response.ok) {
        console.error('Quiz start API error:', response.status, response.statusText);
        alert(`Failed to start quiz: Server error (${response.status})`);
        return;
      }

      const data = await response.json();

      if (data.success && data.sessionId && data.questions) {
        try {
          // Store questions in sessionStorage
          sessionStorage.setItem(`quiz_${data.sessionId}`, JSON.stringify(data.questions));

          // Store metadata for tracking
          sessionStorage.setItem(`quiz_metadata_${data.sessionId}`, JSON.stringify({
            category: category.category,
            difficulty: 'mixed',
            startedAt: new Date().toISOString()
          }));

          // Navigate to quiz session page
          router.push(`/quizzes/${data.sessionId}`);
        } catch (storageError) {
          console.error('Failed to store quiz data:', storageError);
          alert('Unable to start quiz: storage error');
        }
      } else {
        console.error('Quiz start failed:', data.error);
        alert('Failed to start quiz: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz: Network error');
    }
  };

  const filteredCategories = categories.filter(cat => {
    if (filter === 'completed') return cat.completedCount > 0;
    if (filter === 'not-started') return cat.completedCount === 0;
    return true;
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating background particles - BOLDER & SLOWER */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-4 h-4 rounded-full"
            style={{
              left: `${5 + (i * 6.5) % 90}%`,
              top: `${10 + (i * 7) % 80}%`,
              backgroundColor: i % 2 === 0 ? '#f97316' : '#fbbf24',
              opacity: 0.45,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.4, 0.75, 0.4],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 5 + (i % 3) * 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <div className="flex flex-col overflow-y-auto min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20 py-6 sm:py-8 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          {/* Gradient Header with Shimmer */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 rounded-2xl px-6 py-8 mb-8 overflow-hidden shadow-xl shadow-orange-200/50"
          >
            {/* Shimmer effect - BOLDER & SLOWER */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 5, repeat: Infinity, repeatDelay: 3 }}
            />
            <div className="relative z-10 flex items-center">
              {/* Header icon glow - BOLDER & SLOWER */}
              <motion.div
                className="p-4 bg-white/30 backdrop-blur-sm rounded-2xl mr-5"
                animate={{
                  boxShadow: [
                    '0 0 25px rgba(255, 255, 255, 0.5)',
                    '0 0 55px rgba(255, 255, 255, 0.85)',
                    '0 0 25px rgba(255, 255, 255, 0.5)',
                  ],
                }}
                transition={{ duration: 3.5, repeat: Infinity }}
              >
                <BookOpen className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">NIL Knowledge Center</h1>
                <p className="text-white/90 text-lg">Master NIL concepts & earn badges to unlock rewards</p>
              </div>
            </div>
          </motion.div>

          {/* Content Section */}
          <div className="mb-8">

            {/* Stats Cards with Orange/Amber Theme */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 17 }}
                  whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(249, 115, 22, 0.3)' }}
                  className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 shadow-md border border-orange-100 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="w-5 h-5 text-orange-600" />
                    <span className="text-xs text-orange-700/70 font-medium">Completed</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.quizzes_completed}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 17 }}
                  whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(249, 115, 22, 0.3)' }}
                  className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 shadow-md border border-orange-100 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <span className="text-xs text-orange-700/70 font-medium">Avg Score</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.average_score_percentage)}%
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 17 }}
                  whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(249, 115, 22, 0.3)' }}
                  className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 shadow-md border border-orange-100 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-5 h-5 text-amber-600" />
                    <span className="text-xs text-orange-700/70 font-medium">Total Points</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.total_points_earned}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 17 }}
                  whileHover={{ scale: 1.05, y: -4, boxShadow: '0 20px 40px rgba(249, 115, 22, 0.3)' }}
                  className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 shadow-md border border-orange-100 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <span className="text-xs text-orange-700/70 font-medium">Correct</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.total_questions_correct}/{stats.total_questions_attempted}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Difficulty Tabs */}
            {!unlockLoading && unlockData && (
              <div className="mb-6">
                <DifficultyTabs
                  selectedDifficulty={selectedDifficulty}
                  onSelectDifficulty={setSelectedDifficulty}
                  unlockStatus={unlockData.unlockStatus}
                  questionCounts={{
                    beginner: 13,
                    intermediate: 15,
                    advanced: 2,
                    expert: 0,
                  }}
                />
              </div>
            )}

            {/* Filters with Orange Theme */}
            <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-orange-100 shadow-sm inline-flex">
              <Filter className="w-4 h-4 text-orange-400 ml-2" />
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md shadow-orange-200/50'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                All Quizzes
              </button>
              <button
                onClick={() => setFilter('not-started')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'not-started'
                    ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md shadow-orange-200/50'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                Not Started
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'completed'
                    ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md shadow-orange-200/50'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Quiz Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map(category => (
              <QuizCard
                key={category.category}
                category={category}
                onClick={() => handleStartQuiz(category)}
              />
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white to-orange-50/50 rounded-2xl border-2 border-dashed border-orange-200"
            >
              <EmptyState
                icon={<Award className="w-8 h-8 text-orange-500" />}
                title="No Quizzes Found"
                description="Try adjusting your filters or check back later for new quizzes to test your NIL knowledge."
              />
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
