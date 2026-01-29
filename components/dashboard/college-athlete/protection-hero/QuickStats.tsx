'use client';

import { MoneyDisplay } from '../shared/MoneyDisplay';

interface QuickStatsProps {
  activeDeals: number;
  totalValue: number;
  pendingIssues: number;
  submissionsDue?: number;
  className?: string;
  onStatClick?: (type: 'deals' | 'value' | 'issues' | 'submissions') => void;
}

export function QuickStats({
  activeDeals,
  totalValue,
  pendingIssues,
  submissionsDue = 0,
  className = '',
  onStatClick,
}: QuickStatsProps) {
  const stats: Array<{
    label: string;
    value: string | null;
    displayValue?: React.ReactNode;
    icon: React.ReactNode;
    color: string;
    highlight?: boolean;
    clickType: 'deals' | 'value' | 'issues' | 'submissions';
  }> = [
    {
      label: 'Active Deals',
      value: activeDeals.toString(),
      clickType: 'deals',
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'text-blue-600'
    },
    {
      label: 'Total Value',
      value: null,
      displayValue: <MoneyDisplay amount={totalValue} size="md" />,
      clickType: 'value',
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-emerald-600'
    },
    {
      label: 'Issues to Fix',
      value: pendingIssues.toString(),
      clickType: 'issues',
      icon: pendingIssues > 0 ? (
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: pendingIssues > 0 ? 'text-amber-600' : 'text-emerald-600',
      highlight: pendingIssues > 0
    }
  ];

  // Add submissions due if any
  if (submissionsDue > 0) {
    stats.push({
      label: 'Due for Submission',
      value: submissionsDue.toString(),
      clickType: 'submissions',
      icon: (
        <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-orange-600',
      highlight: true
    });
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-${stats.length} gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <button
          key={index}
          onClick={() => onStatClick?.(stat.clickType)}
          className={`
            flex items-center gap-3 p-3 rounded-xl border text-left transition-all
            ${stat.highlight ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
            ${onStatClick ? 'cursor-pointer' : 'cursor-default'}
          `}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
            {stat.icon}
          </div>
          <div>
            <p className={`text-lg font-bold ${stat.color}`}>
              {stat.displayValue || stat.value}
            </p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
