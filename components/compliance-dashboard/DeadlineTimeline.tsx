'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface DeadlineTimelineProps {
  overdue: number;
  today: number;
  tomorrow: number;
  thisWeek: number;
  nextWeek: number;
}

export function DeadlineTimeline({
  overdue,
  today,
  tomorrow,
  thisWeek,
  nextWeek,
}: DeadlineTimelineProps) {
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get('deadline');

  const segments = [
    {
      id: 'overdue' as const,
      label: 'LATE',
      count: overdue,
      sublabel: overdue > 0 ? 'past due' : 'Clear',
      severity: 'critical' as const,
    },
    {
      id: 'today' as const,
      label: 'TODAY',
      count: today,
      sublabel: today > 0 ? 'due' : 'Clear',
      severity: 'urgent' as const,
    },
    {
      id: 'tomorrow' as const,
      label: 'TMRW',
      count: tomorrow,
      sublabel: tomorrow > 0 ? 'due' : 'Clear',
      severity: 'warning' as const,
    },
    {
      id: 'thisWeek' as const,
      label: 'WEEK',
      count: thisWeek,
      sublabel: thisWeek > 0 ? 'due' : 'Clear',
      severity: 'normal' as const,
    },
    {
      id: 'nextWeek' as const,
      label: 'NEXT',
      count: nextWeek,
      sublabel: nextWeek > 0 ? 'due' : 'Clear',
      severity: 'normal' as const,
    },
  ];

  const getColors = (severity: string, count: number) => {
    if (count === 0) return { bg: 'bg-green-50', icon: 'bg-green-500 text-white', text: 'text-green-600' };
    switch (severity) {
      case 'critical': return { bg: 'bg-red-50', icon: 'bg-red-500 text-white', text: 'text-red-600' };
      case 'urgent': return { bg: 'bg-orange-50', icon: 'bg-orange-500 text-white', text: 'text-orange-600' };
      case 'warning': return { bg: 'bg-yellow-50', icon: 'bg-yellow-500 text-white', text: 'text-yellow-600' };
      default: return { bg: 'bg-blue-50', icon: 'bg-blue-500 text-white', text: 'text-blue-600' };
    }
  };

  return (
    <div data-testid="deadline-timeline" className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Overdue Alert Banner */}
      {overdue > 0 && (
        <Link
          href="/compliance/dashboard?deadline=overdue"
          className="flex items-center justify-between px-3 py-2 bg-red-50 border-b border-red-200 rounded-t-lg hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-1.5 text-red-700">
            <span className="text-sm">⚠️</span>
            <span className="font-medium text-xs">
              {overdue} deal{overdue !== 1 ? 's' : ''} past NCAA 5-day deadline
            </span>
          </div>
          <span className="text-xs text-red-600 hover:underline font-medium">
            View all →
          </span>
        </Link>
      )}

      <div className="p-3">
        <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Deadline Timeline (5-Day NCAA Rule)
        </h3>

        {/* Timeline Segments */}
        <div className="flex gap-1">
          {segments.map((segment) => {
            const isActive = activeFilter === segment.id;
            const colors = getColors(segment.severity, segment.count);

            return (
              <Link
                key={segment.id}
                href={isActive ? '/compliance/dashboard' : `/compliance/dashboard?deadline=${segment.id}`}
                className={`
                  flex-1 p-2 rounded-lg text-center
                  transition-all cursor-pointer hover:shadow-md
                  ${colors.bg}
                  ${isActive ? 'ring-2 ring-offset-1 ring-orange-500' : ''}
                `}
              >
                {/* Icon Circle */}
                <div className={`
                  w-8 h-8 mx-auto rounded-full flex items-center justify-center
                  text-xs font-bold mb-1 ${colors.icon}
                `}>
                  {segment.count > 0 ? segment.count : '✓'}
                </div>

                {/* Label */}
                <div className="text-[9px] font-semibold text-gray-700 uppercase tracking-wide">
                  {segment.label}
                </div>

                {/* Sublabel */}
                <div className={`text-[9px] mt-0.5 ${colors.text}`}>
                  {segment.sublabel}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Active filter indicator */}
        {activeFilter && (
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Filter: <strong className="text-gray-700">{activeFilter}</strong>
            </span>
            <Link
              href="/compliance/dashboard"
              className="text-orange-600 hover:underline"
            >
              Clear
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
