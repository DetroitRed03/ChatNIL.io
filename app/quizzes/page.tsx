'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/AuthGuard';
import AppShell from '@/components/Chat/AppShell';
import Header from '@/components/Header';
import QuizCard from '@/components/quiz/QuizCard';
import { QuizCategoryInfo } from '@/lib/quiz';
import { useRouter } from 'next/navigation';
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

function QuizListContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<QuizCategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'not-started'>('all');

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

      const data = await response.json();

      if (data.success) {
        // Store questions in sessionStorage
        sessionStorage.setItem(`quiz_${data.sessionId}`, JSON.stringify(data.questions));

        // Navigate to quiz session page
        router.push(`/quizzes/${data.sessionId}`);
      } else {
        alert('Failed to start quiz: ' + data.error);
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz');
    }
  };

  const filteredCategories = categories.filter(cat => {
    if (filter === 'completed') return cat.completedCount > 0;
    if (filter === 'not-started') return cat.completedCount === 0;
    return true;
  });

  if (loading) {
    return (
      <AppShell>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading quizzes...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header />
      <div className="min-h-full bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-500 rounded-xl mr-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">NIL Knowledge Quizzes</h1>
                <p className="text-gray-600">Test your knowledge and earn badges</p>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-xs text-gray-500">Completed</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.quizzes_completed}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-5 h-5 text-green-500" />
                    <span className="text-xs text-gray-500">Avg Score</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.average_score_percentage)}%
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <span className="text-xs text-gray-500">Total Points</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.total_points_earned}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span className="text-xs text-gray-500">Correct</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.total_questions_correct}/{stats.total_questions_attempted}
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-gray-200 inline-flex">
              <Filter className="w-4 h-4 text-gray-500 ml-2" />
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Quizzes
              </button>
              <button
                onClick={() => setFilter('not-started')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'not-started'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Not Started
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'completed'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
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
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No quizzes found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or check back later for new quizzes
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function QuizListPage() {
  return (
    <ProtectedRoute>
      <QuizListContent />
    </ProtectedRoute>
  );
}
