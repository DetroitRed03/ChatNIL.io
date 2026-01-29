'use client';

import { motion } from 'framer-motion';
import { QuickXPCard } from './QuickXPCard';

interface QuickXPSectionProps {
  dailyChallengeAvailable: boolean;
  dailyChallengeXP: number;
  profileIncomplete: boolean;
  profileXP: number;
  nextProfileField?: string;
  onDailyChallenge: () => void;
  onCompleteProfile: () => void;
}

export function QuickXPSection({
  dailyChallengeAvailable,
  dailyChallengeXP,
  profileIncomplete,
  profileXP,
  nextProfileField = 'Instagram',
  onDailyChallenge,
  onCompleteProfile,
}: QuickXPSectionProps) {
  const hasActions = dailyChallengeAvailable || profileIncomplete;

  if (!hasActions) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-xl p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <div>
            <p className="font-bold text-green-800">All caught up!</p>
            <p className="text-sm text-green-600">Check back tomorrow for more ways to earn XP</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold flex items-center gap-2 text-gray-900">
          <span className="text-orange-500">⚡</span>
          Quick XP
        </h3>
        <span className="text-sm text-gray-500 font-medium">Earn now!</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dailyChallengeAvailable && (
          <QuickXPCard
            icon="💬"
            title="Daily Challenge"
            subtitle="Answer in <30 sec"
            xp={dailyChallengeXP}
            color="orange"
            onClick={onDailyChallenge}
          />
        )}

        {profileIncomplete && (
          <QuickXPCard
            icon="📝"
            title="Complete Profile"
            subtitle={`Add your ${nextProfileField}`}
            xp={profileXP}
            color="blue"
            onClick={onCompleteProfile}
          />
        )}

        {!dailyChallengeAvailable && profileIncomplete && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-medium text-green-800">Challenge Complete!</p>
              <p className="text-sm text-green-600">Come back tomorrow</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
