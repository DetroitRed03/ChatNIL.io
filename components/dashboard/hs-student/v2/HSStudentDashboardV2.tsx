'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { PillarType } from '@/lib/discovery/questions';
import { useSessionTracking } from '@/lib/hooks/useSessionTracking';

// New game-focused components
import { HeaderBar } from './HeaderBar';
import { QuestHero } from './QuestHero';
import { QuickXPSection } from './QuickXPSection';
import { StreakCard } from './StreakCard';
import { AchievementsCard } from './AchievementsCard';
import { ChaptersGridV2 } from './ChaptersGridV2';
import { StateRulesCompact } from './StateRulesCompact';
import { ParentLinkCard } from './ParentLinkCard';
import { DailyChallengeModal } from './DailyChallengeModal';
import { XPEarnedToast } from './XPEarnedToast';
import { LevelUpModal } from './LevelUpModal';
import { AchievementUnlockedModal } from './AchievementUnlockedModal';

// New modals from hs-student-dashboard
import { AchievementsModal } from '@/components/hs-student-dashboard/modals/AchievementsModal';
import { InviteParentModal } from '@/components/hs-student-dashboard/modals/InviteParentModal';
import { StateRulesModal } from '@/components/hs-student-dashboard/modals/StateRulesModal';
import { StreakUpdatedToast } from '@/components/hs-student-dashboard/feedback/StreakUpdatedToast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  progress?: number;
  total?: number;
  xpReward?: number;
}

interface DashboardData {
  student: {
    id: string;
    firstName: string;
    fullName: string;
    sport: string;
    school: string;
    state: string;
    avatarUrl?: string;
  };
  gamification: {
    level: number;
    currentXP: number;
    lifetimeXP: number;
    xpToNextLevel: number;
  };
  journey: {
    currentPillar: PillarType;
    completedPillars: PillarType[];
    currentPillarProgress: number;
    currentPillarTotal: number;
    isComplete: boolean;
  };
  chapters: Array<{
    id: string;
    icon: string;
    title: string;
    progress: number;
    unlocked: boolean;
    isComplete: boolean;
    levelRequired: number;
  }>;
  streak: {
    current: number;
    longest: number;
    daysThisWeek: boolean[];
    todayComplete: boolean;
  };
  dailyChallenge: {
    id: string;
    question: string;
    pillar: string;
    type?: string;
    hints?: string[];
    coachingContext?: string;
    completed: boolean;
    xpReward: number;
  };
  achievements: {
    next?: Achievement;
    earned: Achievement[];
    total: number;
  };
  stateRules: {
    state: string;
    stateCode: string;
    hsNilAllowed: boolean;
    canDo: string[];
    cannotDo: string[];
    mustDo: string[];
    watchOut: string[];
    prohibited: string[];
    athleticAssociationName?: string;
    athleticAssociationUrl?: string;
    detailedSummary?: string;
    disclaimer?: string;
  };
  parentConnection: {
    connected: boolean;
    parentName?: string;
    parentEmail?: string;
  };
  profile: {
    strength: number;
    nextEmptyField?: string;
  };
}

// Achievement definitions - game-like naming
const allAchievements: Achievement[] = [
  { id: 'first-steps', name: 'First Steps', description: 'Answer your first question', icon: '⭐', requirement: '~30 seconds', progress: 0, total: 1, xpReward: 25 },
  { id: 'identity-complete', name: 'Identity Explorer', description: 'Complete the Identity chapter', icon: '🎭', requirement: 'Finish 5 questions', xpReward: 50 },
  { id: 'streak-3', name: 'On Fire', description: '3-day learning streak', icon: '🔥', requirement: 'Learn 3 days in a row', xpReward: 25 },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day learning streak', icon: '⚡', requirement: 'Learn 7 days straight', xpReward: 50 },
  { id: 'business-complete', name: 'Deal Ready', description: 'Complete the Business chapter', icon: '📋', requirement: 'Reach Level 2', xpReward: 50 },
  { id: 'money-complete', name: 'Money Minded', description: 'Complete the Money chapter', icon: '💰', requirement: 'Reach Level 3', xpReward: 50 },
  { id: 'legacy-complete', name: 'Legacy Builder', description: 'Complete the Legacy chapter', icon: '🌟', requirement: 'Reach Level 4', xpReward: 50 },
  { id: 'nil-scholar', name: 'NIL Scholar', description: 'Complete all 4 chapters', icon: '🎓', requirement: 'Reach Level 5', xpReward: 100 },
  { id: 'streak-30', name: 'Monthly Champion', description: '30-day learning streak', icon: '👑', requirement: '30 days straight', xpReward: 100 },
];

export function HSStudentDashboardV2() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track session for online status (visible to parents)
  useSessionTracking({ enabled: true });

  // Modal states
  const [showChallenge, setShowChallenge] = useState(false);
  const [xpToast, setXpToast] = useState<number | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ level: number; unlocks: string[] } | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  // New modal states
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showInviteParentModal, setShowInviteParentModal] = useState(false);
  const [showStateRulesModal, setShowStateRulesModal] = useState(false);
  const [streakToast, setStreakToast] = useState<number | null>(null);

  const fetchDashboardData = useCallback(async (silent = false) => {
    try {
      // Only show loading spinner on initial load, not on background refreshes
      if (!silent) setLoading(true);

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

      const apiData = await response.json();

      // Transform to game-focused data structure
      const pillarOrder: PillarType[] = ['identity', 'business', 'money', 'legacy'];
      const currentPillarIndex = pillarOrder.indexOf(apiData.discovery.currentPillar);
      const completedPillars = pillarOrder.slice(0, currentPillarIndex);

      // Calculate XP and level
      const lifetimeXP = apiData.lifetimeXP || (
        (apiData.discovery.unlockedChapters?.length || 0) * 100 +
        (apiData.discovery.currentDay || 0) * 20 +
        (apiData.streak || 0) * 5 +
        (apiData.badges?.length || 0) * 50
      );
      const level = Math.min(Math.floor(lifetimeXP / 200) + 1, 5);
      const levelThresholds = [0, 100, 250, 500, 1000];
      const currentLevelXP = levelThresholds[level - 1] || 0;
      const nextLevelXP = levelThresholds[level] || 1000;
      const xpToNextLevel = Math.max(nextLevelXP - lifetimeXP, 0);

      // Build chapters data with level requirements
      const chapters = pillarOrder.map((pillar, index) => {
        const isComplete = apiData.discovery.unlockedChapters?.includes(pillar);
        const isCurrent = pillar === apiData.discovery.currentPillar;
        const progress = isComplete ? 100 : isCurrent ? (apiData.discovery.currentDay / 5) * 100 : 0;

        return {
          id: pillar,
          icon: { identity: '🎭', business: '📋', money: '💰', legacy: '⭐' }[pillar] || '📚',
          title: pillar.charAt(0).toUpperCase() + pillar.slice(1),
          progress: Math.round(progress),
          unlocked: index === 0 || level >= (index + 1),
          isComplete: isComplete || false,
          levelRequired: index + 1,
        };
      });

      // Build week activity (Monday-Sunday format)
      const today = new Date();
      const dayOfWeek = (today.getDay() + 6) % 7; // Monday = 0
      const daysThisWeek = Array(7).fill(false);

      if (apiData.weekActivity) {
        for (let i = 0; i < 7; i++) {
          daysThisWeek[i] = apiData.weekActivity[i] || false;
        }
      }

      // Determine earned achievements
      const earnedIds = new Set(apiData.badges?.map((b: any) => b.id) || []);
      const earnedAchievements = allAchievements.filter(a => earnedIds.has(a.id));
      const nextAchievement = allAchievements.find(a => !earnedIds.has(a.id));

      // State rules
      const state = apiData.user.state || 'TX';
      const sr = apiData.stateRules; // Real state rules from API (may be null)

      const transformed: DashboardData = {
        student: {
          id: apiData.user.id,
          firstName: apiData.user.fullName.split(' ')[0],
          fullName: apiData.user.fullName,
          sport: apiData.user.sport,
          school: apiData.user.school,
          state: sr?.state_name || state,
          avatarUrl: apiData.user.avatar,
        },
        gamification: {
          level,
          currentXP: lifetimeXP - currentLevelXP,
          lifetimeXP,
          xpToNextLevel,
        },
        journey: {
          currentPillar: apiData.discovery.currentPillar,
          completedPillars,
          currentPillarProgress: apiData.discovery.currentDay || 0,
          currentPillarTotal: 5,
          isComplete: apiData.discovery.isComplete,
        },
        chapters,
        streak: {
          current: apiData.streak || 0,
          longest: apiData.longestStreak || apiData.streak || 0,
          daysThisWeek,
          todayComplete: daysThisWeek[dayOfWeek],
        },
        dailyChallenge: {
          id: apiData.dailyQuestion?.id || 'dc-1',
          question: apiData.dailyQuestion?.question || 'Quick! Name ONE brand you\'d love to partner with 🎯',
          pillar: apiData.dailyQuestion?.category || apiData.dailyQuestion?.pillar || 'Identity',
          type: apiData.dailyQuestion?.type || 'text',
          hints: apiData.dailyQuestion?.hints,
          coachingContext: apiData.dailyQuestion?.coachingContext,
          completed: false,
          xpReward: 10,
        },
        achievements: {
          next: nextAchievement,
          earned: earnedAchievements,
          total: allAchievements.length,
        },
        stateRules: {
          state: sr?.state_name || state,
          stateCode: state,
          hsNilAllowed: sr?.high_school_allowed ?? true,
          canDo: sr?.summary_can_do || ['You CAN earn from NIL deals'],
          cannotDo: sr?.summary_cannot_do || [],
          mustDo: sr?.summary_must_do || [],
          watchOut: sr?.summary_warnings || ['School can\'t help with deals'],
          prohibited: sr?.prohibited_categories || ['No alcohol/gambling brands'],
          athleticAssociationName: sr?.athletic_association_name,
          athleticAssociationUrl: sr?.athletic_association_url,
          detailedSummary: sr?.detailed_summary,
          disclaimer: sr?.disclaimer,
        },
        parentConnection: {
          connected: apiData.consent?.status === 'approved',
          parentName: apiData.consent?.parentName,
          parentEmail: apiData.consent?.parentEmail,
        },
        profile: {
          strength: apiData.discovery.completionPercentage || 0,
          nextEmptyField: 'Instagram',
        },
      };

      setData(transformed);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleXPEarned = (amount: number, leveledUp?: boolean, newLevel?: number, unlocks?: string[], newStreak?: number) => {
    setXpToast(amount);

    // Show streak toast after XP toast
    if (newStreak && newStreak > 1) {
      setTimeout(() => {
        setStreakToast(newStreak);
      }, 2200);
    }

    if (leveledUp && newLevel && unlocks) {
      setTimeout(() => {
        setLevelUpData({ level: newLevel, unlocks });
        setShowLevelUp(true);
      }, 1500);
    }

    fetchDashboardData(true);
  };

  const handleChallengeSubmit = async (answer: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/daily-challenge/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          questionId: data?.dailyChallenge.id,
          answer,
          questionText: data?.dailyChallenge.question,
          questionType: data?.dailyChallenge.type || 'text',
          coachingContext: data?.dailyChallenge.coachingContext,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit answer');
      }

      const unlocks = result.leveledUp ? [`Level ${result.newLevel} unlocked!`] : undefined;
      handleXPEarned(result.xpEarned, result.leveledUp, result.newLevel, unlocks, result.newStreak);

      // Check for achievements
      if (result.achievementsEarned && result.achievementsEarned.length > 0) {
        const achievementId = result.achievementsEarned[0];
        const achievement = allAchievements.find(a => a.id === achievementId);
        if (achievement) {
          setTimeout(() => {
            setUnlockedAchievement(achievement);
            setShowAchievement(true);
          }, 3000);
        }
      }

      return result;
    } catch (err) {
      console.error('Challenge submit error:', err);
      throw err; // Re-throw so DailyChallengeModal can show error state
    }
  };

  const handleChapterClick = (chapterId: string, unlocked: boolean) => {
    if (unlocked) {
      router.push(`/chapter/${chapterId}`);
    }
    // If locked, the LockedChapterTooltip handles the display
  };

  const handleParentInviteSuccess = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="mt-4 text-gray-600 font-medium">Loading your quest...</p>
          <p className="text-sm text-gray-400 mt-1">Getting your progress ready</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-5xl">😕</span>
          <h2 className="text-xl font-bold text-gray-900 mt-4">Oops!</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div data-testid="hs-student-dashboard-v2" className="min-h-screen bg-gray-50 pb-24">
      {/* XP Toast */}
      <AnimatePresence>
        {xpToast && (
          <XPEarnedToast
            amount={xpToast}
            onComplete={() => setXpToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Level Up Modal */}
      <AnimatePresence>
        {showLevelUp && levelUpData && (
          <LevelUpModal
            newLevel={levelUpData.level}
            unlockedContent={levelUpData.unlocks}
            onClose={() => {
              setShowLevelUp(false);
              setLevelUpData(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Achievement Modal */}
      <AnimatePresence>
        {showAchievement && unlockedAchievement && (
          <AchievementUnlockedModal
            achievement={unlockedAchievement}
            onClose={() => {
              setShowAchievement(false);
              setUnlockedAchievement(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Daily Challenge Modal */}
      <AnimatePresence>
        {showChallenge && data.dailyChallenge && (
          <DailyChallengeModal
            question={data.dailyChallenge.question}
            pillar={data.dailyChallenge.pillar}
            questionType={data.dailyChallenge.type}
            hints={data.dailyChallenge.hints}
            xpReward={data.dailyChallenge.xpReward}
            onSubmit={handleChallengeSubmit}
            onClose={() => setShowChallenge(false)}
          />
        )}
      </AnimatePresence>

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
        achievements={allAchievements.map(a => ({
          ...a,
          earned: data.achievements.earned.some(e => e.id === a.id),
          earnedAt: undefined,
        }))}
        earnedCount={data.achievements.earned.length}
        totalCount={data.achievements.total}
      />

      {/* Invite Parent Modal */}
      <InviteParentModal
        isOpen={showInviteParentModal}
        onClose={() => setShowInviteParentModal(false)}
        onSuccess={handleParentInviteSuccess}
      />

      {/* State Rules Modal */}
      <StateRulesModal
        isOpen={showStateRulesModal}
        onClose={() => setShowStateRulesModal(false)}
        state={data.stateRules.stateCode}
        stateName={data.stateRules.state}
        hsNilAllowed={data.stateRules.hsNilAllowed}
        canDo={data.stateRules.canDo}
        cannotDo={data.stateRules.cannotDo}
        mustDo={data.stateRules.mustDo}
        watchOut={data.stateRules.watchOut}
        prohibited={data.stateRules.prohibited}
        detailedSummary={data.stateRules.detailedSummary}
        athleticAssociationName={data.stateRules.athleticAssociationName}
        athleticAssociationUrl={data.stateRules.athleticAssociationUrl}
        disclaimer={data.stateRules.disclaimer}
      />

      {/* Streak Toast */}
      <AnimatePresence>
        {streakToast && (
          <StreakUpdatedToast
            streak={streakToast}
            onComplete={() => setStreakToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Header with Level/XP - Always visible */}
      <HeaderBar
        firstName={data.student.firstName}
        sport={data.student.sport}
        school={data.student.school}
        level={data.gamification.level}
        currentXP={data.gamification.currentXP}
        xpToNextLevel={data.gamification.xpToNextLevel + data.gamification.currentXP}
        avatarUrl={data.student.avatarUrl}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Quest Hero - Full Width, Primary CTA */}
        <QuestHero
          currentChapter={data.journey.currentPillar}
          chapterNumber={data.journey.completedPillars.length + 1}
          totalChapters={4}
          progress={data.journey.currentPillarProgress}
          total={data.journey.currentPillarTotal}
          xpReward={25}
          onContinue={() => {
            if (data.journey.isComplete) {
              router.push('/profile');
            } else {
              router.push(`/chapter/${data.journey.currentPillar}`);
            }
          }}
        />

        {/* Quick XP Section - Full Width, Immediate Actions */}
        <QuickXPSection
          dailyChallengeAvailable={!data.dailyChallenge.completed && !data.streak.todayComplete}
          dailyChallengeXP={data.dailyChallenge.xpReward}
          profileIncomplete={data.profile.strength < 100}
          profileXP={15}
          nextProfileField={data.profile.nextEmptyField}
          onDailyChallenge={() => setShowChallenge(true)}
          onCompleteProfile={() => router.push('/profile')}
          onQuizzes={() => router.push('/quizzes')}
        />

        {/* Two Column Grid - Aligned at top */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column */}
          <div className="space-y-6">
            <StreakCard
              currentStreak={data.streak.current}
              daysThisWeek={data.streak.daysThisWeek}
              todayComplete={data.streak.todayComplete}
            />

            <ChaptersGridV2
              chapters={data.chapters}
              currentChapter={data.journey.currentPillar}
              currentLevel={data.gamification.level}
              onChapterClick={(chapterId: string, unlocked: boolean) => handleChapterClick(chapterId, unlocked)}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <AchievementsCard
              nextAchievement={data.achievements.next}
              totalEarned={data.achievements.earned.length}
              totalAvailable={data.achievements.total}
              onViewAll={() => setShowAchievementsModal(true)}
            />

            <StateRulesCompact
              state={data.stateRules.state}
              stateCode={data.stateRules.stateCode}
              canDo={data.stateRules.canDo}
              mustDo={data.stateRules.mustDo}
              watchOut={data.stateRules.watchOut}
              prohibited={data.stateRules.prohibited}
              onLearnMore={() => setShowStateRulesModal(true)}
            />

            <ParentLinkCard
              connected={data.parentConnection.connected}
              parentName={data.parentConnection.parentName}
              parentEmail={data.parentConnection.parentEmail}
              onInvite={() => setShowInviteParentModal(true)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
