'use client';

interface ProgramHealthCardProps {
  percentage: number;
  trend: number;
  totalAthletes: number;
  totalDeals: number;
}

export function ProgramHealthCard({
  percentage,
  trend,
  totalAthletes,
  totalDeals
}: ProgramHealthCardProps) {
  const getHealthColor = (pct: number) => {
    if (pct >= 90) return 'bg-green-500';
    if (pct >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getHealthBgColor = (pct: number) => {
    if (pct >= 90) return 'bg-green-100';
    if (pct >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getTrendColor = (t: number) => {
    if (t > 0) return 'text-green-600';
    if (t < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const formatNumber = (n: number) => {
    return n.toLocaleString();
  };

  return (
    <div
      data-testid="program-health-card"
      className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
    >
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Program Health
      </h3>

      {/* Large Percentage */}
      <div className="mb-3">
        <span className="text-5xl font-bold text-gray-900">
          {percentage.toFixed(1)}
        </span>
        <span className="text-2xl font-medium text-gray-400">%</span>
      </div>

      {/* Progress Bar */}
      <div className={`h-2 rounded-full ${getHealthBgColor(percentage)} mb-3`}>
        <div
          className={`h-full rounded-full ${getHealthColor(percentage)} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Trend */}
      <div className="flex items-center gap-1 mb-4">
        {trend !== 0 && (
          <>
            <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
              {trend > 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">vs last week</span>
          </>
        )}
        {trend === 0 && (
          <span className="text-sm text-gray-500">No change from last week</span>
        )}
      </div>

      {/* Stats */}
      <p className="text-sm text-gray-600">
        <span className="font-medium">{formatNumber(totalAthletes)}</span> athletes
        <span className="mx-2 text-gray-300">•</span>
        <span className="font-medium">{formatNumber(totalDeals)}</span> active deals
      </p>
    </div>
  );
}
