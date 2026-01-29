'use client';

interface ProtectionStatusLabelProps {
  status: 'protected' | 'attention_needed' | 'at_risk';
  summary?: string;
  className?: string;
}

export function ProtectionStatusLabel({
  status,
  summary,
  className = ''
}: ProtectionStatusLabelProps) {
  const statusConfig = {
    protected: {
      title: "You're Protected",
      subtitle: summary || 'All your deals look good!',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      titleColor: 'text-emerald-700',
      subtitleColor: 'text-emerald-600'
    },
    attention_needed: {
      title: 'Attention Needed',
      subtitle: summary || 'Some deals need your review',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      titleColor: 'text-amber-700',
      subtitleColor: 'text-amber-600'
    },
    at_risk: {
      title: 'Action Required',
      subtitle: summary || 'Fix issues to stay compliant',
      bg: 'bg-red-50',
      border: 'border-red-200',
      titleColor: 'text-red-700',
      subtitleColor: 'text-red-600'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`px-4 py-3 rounded-xl border ${config.bg} ${config.border} ${className}`}>
      <h2 className={`text-xl font-bold ${config.titleColor}`}>
        {config.title}
      </h2>
      <p className={`text-sm ${config.subtitleColor} mt-0.5`}>
        {config.subtitle}
      </p>
    </div>
  );
}
