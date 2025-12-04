'use client';

import { FMVScoreHistory } from '@/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreHistoryChartProps {
  history: FMVScoreHistory[];
}

export function ScoreHistoryChart({ history }: ScoreHistoryChartProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No score history available yet.</p>
        <p className="text-sm mt-1">Your score history will appear here after multiple calculations.</p>
      </div>
    );
  }

  // Sort by date (oldest first for chart)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.date || (a as any).calculated_at).getTime() - new Date(b.date || (b as any).calculated_at).getTime()
  );

  // Calculate chart dimensions
  const maxScore = Math.max(...sortedHistory.map(h => h.score));
  const minScore = Math.min(...sortedHistory.map(h => h.score));
  const scoreRange = maxScore - minScore || 20; // Minimum range of 20 points
  const chartHeight = 200;
  const chartPadding = 20;

  // Calculate change from first to last
  const firstScore = sortedHistory[0].score;
  const lastScore = sortedHistory[sortedHistory.length - 1].score;
  const totalChange = lastScore - firstScore;
  const percentChange = firstScore > 0 ? ((totalChange / firstScore) * 100).toFixed(1) : '0.0';

  // Generate SVG path
  const points = sortedHistory.map((item, index) => {
    const x = (index / (sortedHistory.length - 1 || 1)) * 100;
    const y = chartHeight - (((item.score - minScore + chartPadding) / (scoreRange + chartPadding * 2)) * chartHeight);
    return { x, y, score: item.score, date: item.date || (item as any).calculated_at };
  });

  const pathD = points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  // Area fill path (for gradient under line)
  const areaPathD = `${pathD} L 100 ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">Current Score</div>
          <div className="text-2xl font-bold text-gray-900">{lastScore}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">Total Change</div>
          <div className={`text-2xl font-bold flex items-center gap-1 ${
            totalChange > 0 ? 'text-green-600' : totalChange < 0 ? 'text-red-600' : 'text-gray-900'
          }`}>
            {totalChange > 0 && <TrendingUp className="w-5 h-5" />}
            {totalChange < 0 && <TrendingDown className="w-5 h-5" />}
            {totalChange === 0 && <Minus className="w-5 h-5" />}
            {totalChange > 0 ? '+' : ''}{totalChange}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">% Change</div>
          <div className={`text-2xl font-bold ${
            Number(percentChange) > 0 ? 'text-green-600' : Number(percentChange) < 0 ? 'text-red-600' : 'text-gray-900'
          }`}>
            {Number(percentChange) > 0 ? '+' : ''}{percentChange}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <svg
          viewBox={`0 0 100 ${chartHeight}`}
          className="w-full"
          style={{ height: '250px' }}
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={(y / 100) * chartHeight}
              y2={(y / 100) * chartHeight}
              stroke="#E5E7EB"
              strokeWidth="0.5"
            />
          ))}

          {/* Area fill */}
          <path
            d={areaPathD}
            fill="url(#gradient)"
            opacity="0.2"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="#3B82F6"
                stroke="white"
                strokeWidth="2"
                className="hover:r-4 cursor-pointer"
              />
              <title>
                {new Date(point.date).toLocaleDateString()}: {point.score} points
              </title>
            </g>
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* X-axis labels (dates) */}
        <div className="flex justify-between mt-2 px-2">
          <span className="text-xs text-gray-500">
            {new Date(sortedHistory[0].date || (sortedHistory[0] as any).calculated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(sortedHistory[sortedHistory.length - 1].date || (sortedHistory[sortedHistory.length - 1] as any).calculated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Score Timeline</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedHistory.slice().reverse().map((item, index) => {
            const prevScore = index < sortedHistory.length - 1 ? sortedHistory[sortedHistory.length - index - 2].score : item.score;
            const change = item.score - prevScore;

            return (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.score} points</div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.date || (item as any).calculated_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
                {change !== 0 && index < sortedHistory.length - 1 && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {change > 0 ? '+' : ''}{change}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Mini chart for dashboards/cards
 */
export function ScoreHistoryMini({ history }: { history: FMVScoreHistory[] }) {
  if (!history || history.length < 2) return null;

  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.date || (a as any).calculated_at).getTime() - new Date(b.date || (b as any).calculated_at).getTime()
  );

  const maxScore = Math.max(...sortedHistory.map(h => h.score));
  const minScore = Math.min(...sortedHistory.map(h => h.score));
  const scoreRange = maxScore - minScore || 10;

  const points = sortedHistory.map((item, index) => {
    const x = (index / (sortedHistory.length - 1)) * 60;
    const y = 30 - (((item.score - minScore) / scoreRange) * 20);
    return { x, y };
  });

  const pathD = points.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  const lastScore = sortedHistory[sortedHistory.length - 1].score;
  const firstScore = sortedHistory[0].score;
  const isIncreasing = lastScore > firstScore;

  return (
    <div className="flex items-center gap-2">
      <svg width="60" height="30" className="flex-shrink-0">
        <path
          d={pathD}
          fill="none"
          stroke={isIncreasing ? '#10B981' : '#EF4444'}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <div className={`text-xs font-medium ${isIncreasing ? 'text-green-600' : 'text-red-600'}`}>
        {isIncreasing ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
        {lastScore - firstScore > 0 ? '+' : ''}{lastScore - firstScore}
      </div>
    </div>
  );
}
