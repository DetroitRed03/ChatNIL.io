'use client';

import { motion } from 'framer-motion';
import { X, ArrowLeft, Lock, CheckCircle, Play, Trophy, Flame } from 'lucide-react';
import { ChildSummary } from './ChildCard';

interface PillarProgress {
  name: string;
  status: 'locked' | 'in_progress' | 'completed';
  progress: number;
  quizScore?: number;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: string;
}

interface DetailedProgress {
  pillars: PillarProgress[];
  badges: Badge[];
  streakHistory: boolean[];
}

interface ChildProgressViewProps {
  child: ChildSummary;
  detailedProgress: DetailedProgress;
  onClose: () => void;
}

export function ChildProgressView({ child, detailedProgress, onClose }: ChildProgressViewProps) {
  const getPillarIcon = (status: PillarProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Play className="w-5 h-5 text-purple-500" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPillarStatusText = (pillar: PillarProgress) => {
    if (pillar.status === 'completed' && pillar.quizScore !== undefined) {
      return `Score: ${pillar.quizScore}%`;
    }
    if (pillar.status === 'in_progress') {
      return 'In Progress';
    }
    return 'Locked';
  };

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <motion.div
        data-testid="child-progress-view"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="font-semibold text-gray-900">{child.fullName}'s Progress</h2>
            <p className="text-sm text-gray-500">{child.school}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Learning Pillars */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Learning Pillars
            </h3>
            <div className="space-y-4">
              {detailedProgress.pillars.map((pillar, index) => (
                <motion.div
                  key={pillar.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPillarIcon(pillar.status)}
                      <span className="font-medium text-gray-900 capitalize">{pillar.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{getPillarStatusText(pillar)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pillar.progress}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`h-full rounded-full ${
                        pillar.status === 'completed'
                          ? 'bg-green-500'
                          : pillar.status === 'in_progress'
                          ? 'bg-purple-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-gray-500">{pillar.progress}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Badges Earned */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Badges Earned ({detailedProgress.badges.length})
            </h3>
            {detailedProgress.badges.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                <Trophy className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No badges earned yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {detailedProgress.badges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{badge.name}</p>
                      <p className="text-xs text-gray-500">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Activity This Week */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Activity This Week
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between mb-2">
                {dayLabels.map((day, index) => (
                  <div key={day} className="text-center">
                    <p className="text-xs text-gray-500 mb-2">{day}</p>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        detailedProgress.streakHistory[index]
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {detailedProgress.streakHistory[index] ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-xs">-</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {child.learningProgress.currentStreak > 0 && (
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-gray-900">
                    {child.learningProgress.currentStreak} day streak!
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
