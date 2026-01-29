'use client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  earned: boolean;
  earnedAt?: string;
}

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  earnedCount: number;
  totalCount: number;
}

export function AchievementsModal({
  isOpen,
  onClose,
  achievements,
  earnedCount,
  totalCount
}: AchievementsModalProps) {
  if (!isOpen) return null;

  const earnedAchievements = achievements.filter(a => a.earned);
  const lockedAchievements = achievements.filter(a => !a.earned);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-5 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🏆 Achievements
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-white/80 mt-1">{earnedCount} of {totalCount} unlocked</p>

          {/* Progress bar */}
          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(earnedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Achievements List */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          {/* Earned Section */}
          {earnedAchievements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                ✨ Unlocked
              </h3>
              <div className="space-y-3">
                {earnedAchievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-xl"
                  >
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{achievement.name}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      {achievement.earnedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className="text-green-500 text-xl">✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Section */}
          {lockedAchievements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                🔒 Keep Going!
              </h3>
              <div className="space-y-3">
                {lockedAchievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl opacity-70"
                  >
                    <div className="text-3xl grayscale">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-600">{achievement.name}</h4>
                      <p className="text-sm text-gray-500">{achievement.requirement}</p>
                    </div>
                    <span className="text-gray-400">🔒</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
          >
            Keep Earning! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

export default AchievementsModal;
