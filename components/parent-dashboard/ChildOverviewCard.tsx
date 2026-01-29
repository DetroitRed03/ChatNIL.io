'use client';

interface Child {
  id: string;
  name: string;
  email: string;
  school: string;
  sport: string;
  grade: string;
  state: string;
  status: 'active' | 'inactive' | 'suspended';
  isOnline: boolean;
  lastActive: string;
  currentChapter: string;
  currentChapterTitle: string;
  progressPercent: number;
  questionsCompleted: number;
  questionsTotal: number;
  badgesEarned: number;
  currentStreak: number;
}

interface ChildOverviewCardProps {
  child: Child;
  onViewProgress: () => void;
  onParentalControls: () => void;
}

export function ChildOverviewCard({ child, onViewProgress, onParentalControls }: ChildOverviewCardProps) {
  const getLastActiveText = () => {
    if (child.isOnline) {
      return { text: 'Online now', color: 'text-green-600', dot: 'bg-green-500' };
    }

    const lastActive = new Date(child.lastActive);
    const now = new Date();
    const diffMs = now.getTime() - lastActive.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return { text: `Active ${diffMins}m ago`, color: 'text-green-600', dot: 'bg-green-400' };
    }
    if (diffHours < 24) {
      return { text: `Active ${diffHours}h ago`, color: 'text-gray-600', dot: 'bg-gray-400' };
    }
    if (diffDays === 1) {
      return { text: 'Active yesterday', color: 'text-gray-500', dot: 'bg-gray-300' };
    }
    if (diffDays < 7) {
      return { text: `Active ${diffDays} days ago`, color: 'text-gray-500', dot: 'bg-gray-300' };
    }
    return { text: `Active ${diffDays} days ago`, color: 'text-orange-500', dot: 'bg-orange-400' };
  };

  const lastActive = getLastActiveText();

  const chapterEmojis: Record<string, string> = {
    identity: '🎭',
    business: '📋',
    money: '💰',
    legacy: '⭐'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {child.name.charAt(0)}
              </div>
              {child.isOnline && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{child.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  child.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  ✓ Active
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                {child.school} • {child.sport} • {child.grade}
              </p>
            </div>
          </div>

          {/* Last Active */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${lastActive.dot} ${child.isOnline ? 'animate-pulse' : ''}`} />
            <span className={`text-sm ${lastActive.color}`}>{lastActive.text}</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-5">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Currently Learning</span>
            <span className="text-sm font-medium text-purple-600">
              {child.questionsCompleted}/{child.questionsTotal} complete
            </span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{chapterEmojis[child.currentChapter] || '📚'}</span>
            <span className="font-semibold">{child.currentChapterTitle}</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${child.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 py-3 border-t border-b">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {child.badgesEarned > 0 ? child.badgesEarned : '—'}
            </div>
            <div className="text-xs text-gray-500">Badges Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {child.currentStreak > 0 ? `${child.currentStreak}🔥` : '—'}
            </div>
            <div className="text-xs text-gray-500">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {child.progressPercent > 0 ? `${child.progressPercent}%` : 'Starting'}
            </div>
            <div className="text-xs text-gray-500">Chapter Progress</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onViewProgress}
            className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
          >
            See {child.name.split(' ')[0]}&apos;s Progress →
          </button>
          <button
            onClick={onParentalControls}
            className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            title="Parental Controls"
          >
            ⚙️
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChildOverviewCard;
