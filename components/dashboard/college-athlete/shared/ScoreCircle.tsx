'use client';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ScoreCircle({
  score,
  size = 'md',
  showLabel = false,
  label,
  className = ''
}: ScoreCircleProps) {
  const sizeConfig = {
    sm: { dimension: 48, strokeWidth: 4, fontSize: 'text-sm', labelSize: 'text-xs' },
    md: { dimension: 64, strokeWidth: 5, fontSize: 'text-lg', labelSize: 'text-xs' },
    lg: { dimension: 96, strokeWidth: 6, fontSize: 'text-2xl', labelSize: 'text-sm' },
    xl: { dimension: 128, strokeWidth: 8, fontSize: 'text-4xl', labelSize: 'text-base' }
  };

  const config = sizeConfig[size];
  const radius = (config.dimension - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Color based on score
  const getColor = (score: number) => {
    if (score >= 80) return { stroke: '#10B981', text: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (score >= 50) return { stroke: '#F59E0B', text: 'text-amber-600', bg: 'bg-amber-50' };
    return { stroke: '#EF4444', text: 'text-red-600', bg: 'bg-red-50' };
  };

  const colors = getColor(score);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg
        width={config.dimension}
        height={config.dimension}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={config.strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Score text in center */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ width: config.dimension, height: config.dimension }}
      >
        <span className={`font-bold ${config.fontSize} ${colors.text}`}>
          {score}
        </span>
      </div>
      {/* Optional label below */}
      {showLabel && (
        <span className={`mt-1 ${config.labelSize} text-gray-500 font-medium`}>
          {label || 'Score'}
        </span>
      )}
    </div>
  );
}
