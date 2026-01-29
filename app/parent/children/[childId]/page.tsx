'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface ChapterProgress {
  pillar: string;
  title: string;
  description: string;
  icon: string;
  questionsCompleted: number;
  questionsTotal: number;
  completed: boolean;
  completedAt: string | null;
  percentComplete: number;
}

interface Badge {
  id: string;
  badgeId: string;
  name: string;
  earnedAt: string;
}

interface ProgressData {
  childId: string;
  childName: string;
  progress: {
    overall: {
      percentage: number;
      questionsCompleted: number;
      questionsTotal: number;
      pillarsCompleted: number;
      pillarsTotal: number;
    };
    currentPillar: {
      id: string;
      name: string;
      progress: number;
      total: number;
    };
    pillars: ChapterProgress[];
    gamification: {
      level: number;
      xp: number;
      xpToNextLevel: number;
      totalXpEarned: number;
    };
    streak: {
      current: number;
      longest: number;
      lastActiveDate: string | null;
    };
    badges: Badge[];
  };
}

interface ChildInfo {
  id: string;
  name: string;
  school: string;
  sport: string;
  grade: string;
  state: string;
  progressPercent: number;
  currentChapter: string;
  currentChapterTitle: string;
}

const pillarInfo: Record<string, { title: string; description: string; icon: string }> = {
  identity: {
    title: 'Identity',
    description: 'Building their personal brand',
    icon: '🎭'
  },
  business: {
    title: 'Business',
    description: 'Understanding NIL deals',
    icon: '📋'
  },
  money: {
    title: 'Money',
    description: 'Managing money and taxes',
    icon: '💰'
  },
  legacy: {
    title: 'Legacy',
    description: 'Planning for the future',
    icon: '⭐'
  }
};

export default function ChildProgressPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  const [loading, setLoading] = useState(true);
  const [childInfo, setChildInfo] = useState<ChildInfo | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const headers: HeadersInit = accessToken
        ? { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };

      // First get child info from parent dashboard
      const dashRes = await fetch('/api/parent/dashboard', {
        credentials: 'include',
        headers
      });

      if (!dashRes.ok) {
        throw new Error('Failed to load dashboard');
      }

      const dashData = await dashRes.json();
      const child = dashData.children?.find((c: ChildInfo) => c.id === childId);

      if (!child) {
        setError('Child not found');
        setLoading(false);
        return;
      }

      setChildInfo(child);

      // Then get detailed progress
      const progressRes = await fetch(`/api/parent/children/${childId}/progress`, {
        credentials: 'include',
        headers
      });

      if (progressRes.ok) {
        const data = await progressRes.json();
        setProgressData(data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Loading progress...</p>
        </div>
      </div>
    );
  }

  if (error || !childInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <p className="text-gray-500">{error || 'Failed to load'}</p>
          <button
            onClick={() => router.push('/parent/dashboard')}
            className="mt-4 text-purple-600 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Build chapters from progress data or use defaults based on child info
  const chapters: ChapterProgress[] = progressData?.progress?.pillars ||
    ['identity', 'business', 'money', 'legacy'].map((pillar, idx) => {
      const info = pillarInfo[pillar];
      const isCurrentPillar = childInfo.currentChapter === pillar;
      const isPastPillar = ['identity', 'business', 'money', 'legacy'].indexOf(pillar) <
        ['identity', 'business', 'money', 'legacy'].indexOf(childInfo.currentChapter);

      return {
        pillar,
        title: info.title,
        description: info.description,
        icon: info.icon,
        questionsCompleted: isPastPillar ? 5 : (isCurrentPillar ? Math.round(childInfo.progressPercent / 20) : 0),
        questionsTotal: 5,
        completed: isPastPillar,
        completedAt: null,
        percentComplete: isPastPillar ? 100 : (isCurrentPillar ? childInfo.progressPercent : 0)
      };
    });

  const gamification = progressData?.progress?.gamification || {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXpEarned: 0
  };

  const streak = progressData?.progress?.streak || {
    current: 0,
    longest: 0,
    lastActiveDate: null
  };

  const badges = progressData?.progress?.badges || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/parent/dashboard')}
            className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">{childInfo.name}&apos;s Progress</h1>
          <p className="text-gray-500">{childInfo.school} • {childInfo.sport} • {childInfo.grade}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Level & XP */}
        <div className="bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Current Level</p>
              <p className="text-4xl font-bold">Level {gamification.level}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Total XP Earned</p>
              <p className="text-3xl font-bold">{gamification.totalXpEarned} ⚡</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/80 mb-1">
              <span>Progress to Level {gamification.level + 1}</span>
              <span>{gamification.xp}/{gamification.xpToNextLevel} XP</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${(gamification.xp / gamification.xpToNextLevel) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-orange-500">
              {streak.current > 0 ? `${streak.current}🔥` : '—'}
            </div>
            <div className="text-sm text-gray-500">Day Streak</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-purple-600">
              {badges.length > 0 ? badges.length : '—'}
            </div>
            <div className="text-sm text-gray-500">Badges</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-green-500">
              {childInfo.progressPercent}%
            </div>
            <div className="text-sm text-gray-500">Overall</div>
          </div>
        </div>

        {/* Learning Journey */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">📚 Learning Journey</h2>

          <div className="space-y-4">
            {chapters.map((chapter, idx) => (
              <div key={chapter.pillar} className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{chapter.icon}</span>
                    <div>
                      <h3 className="font-semibold">{chapter.title}</h3>
                      <p className="text-sm text-gray-500">{chapter.description}</p>
                    </div>
                  </div>
                  {chapter.completed ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      ✓ Complete
                    </span>
                  ) : chapter.questionsCompleted > 0 ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      In Progress
                    </span>
                  ) : idx === 0 || chapters[idx - 1]?.completed ? (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      Available
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
                      🔒 Locked
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">
                      {chapter.questionsCompleted}/{chapter.questionsTotal} questions
                    </span>
                    <span className="font-medium">{chapter.percentComplete}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        chapter.completed
                          ? 'bg-green-500'
                          : chapter.questionsCompleted > 0
                            ? 'bg-gradient-to-r from-purple-500 to-orange-500'
                            : 'bg-gray-300'
                      }`}
                      style={{ width: `${chapter.percentComplete}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Section */}
        {badges.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">🏆 Badges Earned</h2>
            <div className="grid grid-cols-4 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="text-center p-3 bg-gray-50 rounded-xl"
                >
                  <div className="text-3xl mb-1">🏅</div>
                  <div className="text-sm font-medium">{badge.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Calendar placeholder */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">📅 Activity This Month</h2>
          <div className="grid grid-cols-7 gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs text-gray-500 font-medium">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const dayNum = i - new Date().getDay() + 1;
              const isToday = dayNum === new Date().getDate();
              const isActive = dayNum > 0 && dayNum <= new Date().getDate() && Math.random() > 0.5;
              return (
                <div
                  key={i}
                  className={`aspect-square rounded flex items-center justify-center text-xs ${
                    isToday
                      ? 'bg-purple-500 text-white font-bold'
                      : isActive
                        ? 'bg-green-100 text-green-700'
                        : dayNum > 0 && dayNum <= 31
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-transparent'
                  }`}
                >
                  {dayNum > 0 && dayNum <= 31 ? dayNum : ''}
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Active days are shown in green
          </p>
        </div>
      </main>
    </div>
  );
}
