'use client';

interface StatusBadgeProps {
  status: 'protected' | 'attention' | 'at_risk' | 'good' | 'warning' | 'critical';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  label?: string;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  label,
  className = ''
}: StatusBadgeProps) {
  const statusConfig = {
    protected: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: '✓',
      defaultLabel: 'Protected'
    },
    good: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: '✓',
      defaultLabel: 'Good'
    },
    attention: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: '!',
      defaultLabel: 'Needs Attention'
    },
    warning: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: '!',
      defaultLabel: 'Warning'
    },
    at_risk: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: '✕',
      defaultLabel: 'At Risk'
    },
    critical: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: '✕',
      defaultLabel: 'Critical'
    }
  };

  const sizeConfig = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const config = statusConfig[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium border
        ${config.bg} ${config.text} ${config.border} ${sizeConfig[size]}
        ${className}
      `}
    >
      {showIcon && (
        <span className="flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold">
          {config.icon}
        </span>
      )}
      {label || config.defaultLabel}
    </span>
  );
}
