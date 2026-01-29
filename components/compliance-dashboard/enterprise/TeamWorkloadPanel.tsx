'use client';

import { useState } from 'react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  openItems: number;
  completedThisWeek: number;
  overdueItems: number;
  avgResolutionHours?: number;
}

interface TeamWorkloadPanelProps {
  members: TeamMember[];
  totalOpenItems: number;
  onMemberClick: (memberId: string) => void;
  onRebalance?: () => void;
}

export function TeamWorkloadPanel({
  members,
  totalOpenItems,
  onMemberClick,
  onRebalance
}: TeamWorkloadPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const maxOpenItems = Math.max(...members.map(m => m.openItems), 1);

  const getWorkloadColor = (openItems: number, overdueItems: number) => {
    if (overdueItems > 0) return 'text-red-600';
    if (openItems > 15) return 'text-orange-600';
    if (openItems > 8) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getWorkloadLabel = (openItems: number) => {
    if (openItems > 15) return 'Heavy';
    if (openItems > 8) return 'Moderate';
    if (openItems > 0) return 'Light';
    return 'Clear';
  };

  // Calculate team averages
  const avgOpenItems = members.length > 0
    ? Math.round(members.reduce((sum, m) => sum + m.openItems, 0) / members.length)
    : 0;
  const totalOverdue = members.reduce((sum, m) => sum + m.overdueItems, 0);
  const totalCompletedThisWeek = members.reduce((sum, m) => sum + m.completedThisWeek, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" data-testid="team-workload">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Team Workload</h3>
            <p className="text-xs text-gray-500">{members.length} members</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        <div className="px-4 py-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalOpenItems}</p>
          <p className="text-xs text-gray-500">Open Items</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className={`text-2xl font-bold ${totalOverdue > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {totalOverdue}
          </p>
          <p className="text-xs text-gray-500">Overdue</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-2xl font-bold text-green-600">{totalCompletedThisWeek}</p>
          <p className="text-xs text-gray-500">This Week</p>
        </div>
      </div>

      {/* Team Members */}
      <div className={`divide-y divide-gray-100 ${!isExpanded ? 'max-h-64 overflow-y-auto' : ''}`}>
        {members.map(member => (
          <button
            key={member.id}
            onClick={() => onMemberClick(member.id)}
            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}

              {/* Info */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-gray-900 truncate">{member.name}</p>
                  <span className={`text-xs font-medium ${getWorkloadColor(member.openItems, member.overdueItems)}`}>
                    {getWorkloadLabel(member.openItems)}
                  </span>
                </div>

                {/* Workload Bar */}
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-grow h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        member.overdueItems > 0
                          ? 'bg-red-500'
                          : member.openItems > 15
                          ? 'bg-orange-500'
                          : member.openItems > 8
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${(member.openItems / maxOpenItems) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 tabular-nums w-6 text-right">
                    {member.openItems}
                  </span>
                </div>
              </div>

              {/* Overdue Badge */}
              {member.overdueItems > 0 && (
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {member.overdueItems}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Footer with Rebalance */}
      {onRebalance && members.length > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onRebalance}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Rebalance Workload
          </button>
        </div>
      )}
    </div>
  );
}
