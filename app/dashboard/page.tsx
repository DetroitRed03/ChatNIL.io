'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, Users, MessageSquare, Target, Star, Calendar, Zap, BookOpen, Trophy, ChevronRight } from 'lucide-react';
import { ProtectedRoute } from '@/components/AuthGuard';
import AppShell from '@/components/Chat/AppShell';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface QuizStats {
  totalQuestions: number;
  correctAnswers: number;
  quizzesCompleted: number;
  averageScore: number;
}

interface QuizCategory {
  category: string;
  displayName: string;
  description: string;
  totalQuestions: number;
  completedQuestions: number;
  icon: string;
}

function DashboardPageContent() {
  const { user } = useAuth();
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [quizCategories, setQuizCategories] = useState<QuizCategory[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchQuizData();
    }
  }, [user?.id]);

  const fetchQuizData = async () => {
    try {
      setLoadingQuizzes(true);

      // Fetch user quiz stats
      const statsResponse = await fetch(`/api/quizzes/stats?userId=${user?.id}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setQuizStats(statsData.stats);
        }
      }

      // Fetch quiz categories
      const categoriesResponse = await fetch(`/api/quizzes?userId=${user?.id}`);
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        if (categoriesData.success) {
          // Show top 3 recommended categories
          setQuizCategories(categoriesData.categories.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      nil_basics: '📚',
      contracts: '📄',
      branding: '🎨',
      social_media: '📱',
      compliance: '✅',
      tax_finance: '💰',
      negotiation: '🤝',
      legal: '⚖️',
      marketing: '📈',
      athlete_rights: '🏆'
    };
    return iconMap[category] || '📖';
  };

  return (
    <AppShell>
      <Header />
      <div className="min-h-full bg-gradient-to-br from-green-50 to-teal-50 py-8 sm:py-12 px-4 sm:px-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto text-center">
          {/* Coming Soon Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <LayoutDashboard className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Zap className="h-4 w-4 text-yellow-800" />
            </div>
          </div>

          {/* Main Content */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your NIL Dashboard
          </h1>

          <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-200 rounded-full text-green-800 font-medium mb-6">
            <Calendar className="h-4 w-4 mr-2" />
            Coming Soon
          </div>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Your personalized hub for tracking NIL activities, opportunities, earnings, and compliance.
            Get insights into your brand growth and manage your NIL journey in one place.
          </p>

          {/* Dashboard Preview */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Dashboard Features
            </h2>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Analytics & Insights</h3>
                <p className="text-gray-600 text-sm">Track your social media growth, engagement rates, and brand value</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Opportunity Tracker</h3>
                <p className="text-gray-600 text-sm">Monitor active deals, pending applications, and completed campaigns</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Network Growth</h3>
                <p className="text-gray-600 text-sm">See your connections with coaches, brands, and fellow athletes</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Recent Activity</h3>
                <p className="text-gray-600 text-sm">Stay updated on messages, new opportunities, and platform notifications</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Performance Metrics</h3>
                <p className="text-gray-600 text-sm">Monitor your athletic achievements and academic progress</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Compliance Center</h3>
                <p className="text-gray-600 text-sm">Ensure all your NIL activities comply with NCAA and school regulations</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Preview */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">$0</div>
              <div className="text-sm text-gray-600">Total Earnings</div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
              <div className="text-sm text-gray-600">Active Deals</div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">0</div>
              <div className="text-sm text-gray-600">New Opportunities</div>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">0</div>
              <div className="text-sm text-gray-600">Profile Views</div>
            </div>
          </div>

          {/* Recommended Quizzes Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8 text-left">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Recommended Quizzes</h2>
                  <p className="text-sm text-gray-600">Test your NIL knowledge and earn badges</p>
                </div>
              </div>
              <Link
                href="/quizzes"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Quiz Stats */}
            {quizStats && (
              <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{quizStats.quizzesCompleted}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{quizStats.totalQuestions}</div>
                  <div className="text-xs text-gray-600">Questions Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{quizStats.averageScore}%</div>
                  <div className="text-xs text-gray-600">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{quizStats.correctAnswers}</div>
                  <div className="text-xs text-gray-600">Correct Answers</div>
                </div>
              </div>
            )}

            {/* Quiz Categories */}
            {loadingQuizzes ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading quizzes...</p>
                </div>
              </div>
            ) : quizCategories.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4">
                {quizCategories.map((category) => (
                  <Link
                    key={category.category}
                    href="/quizzes"
                    className="block p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">{getCategoryIcon(category.category)}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">
                          {category.displayName}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {category.totalQuestions} questions
                      </span>
                      {category.completedQuestions > 0 ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <Trophy className="h-3 w-3" />
                          <span>{category.completedQuestions} done</span>
                        </div>
                      ) : (
                        <span className="text-indigo-600 font-medium">Start Quiz →</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Start your learning journey with NIL quizzes!</p>
                <Link
                  href="/quizzes"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Browse Quizzes
                </Link>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-green-500 via-teal-500 to-teal-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-semibold mb-2">Get ready for your personalized dashboard</h3>
            <p className="mb-6 opacity-90 max-w-2xl mx-auto">
              Complete your profile to unlock detailed analytics and personalized recommendations.
              The more information you provide, the better insights we can give you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/profile'}
                className="bg-white text-teal-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Complete Profile
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-teal-600 transition-colors"
              >
                Back to Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardPageContent />
    </ProtectedRoute>
  );
}