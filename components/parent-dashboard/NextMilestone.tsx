'use client';

interface Milestone {
  type: string;
  name: string;
  description: string;
  progress: number;
  total: number;
}

interface NextMilestoneProps {
  milestone: Milestone;
}

export function NextMilestone({ milestone }: NextMilestoneProps) {
  const remaining = milestone.total - milestone.progress;
  const progressPercent = (milestone.progress / milestone.total) * 100;

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'badge': return '🏆';
      case 'chapter': return '📚';
      case 'streak': return '🔥';
      case 'level': return '⚡';
      default: return '🎯';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="font-bold flex items-center gap-2 mb-4">
        🎯 Next Milestone
      </h3>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center text-3xl">
          {getMilestoneIcon(milestone.type)}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{milestone.name}</h4>
          <p className="text-sm text-gray-500">{milestone.description}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium">{milestone.progress}/{milestone.total}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {remaining === 1
            ? 'Just 1 more to go!'
            : `${remaining} more to reach this milestone`}
        </p>
      </div>
    </div>
  );
}

export default NextMilestone;
