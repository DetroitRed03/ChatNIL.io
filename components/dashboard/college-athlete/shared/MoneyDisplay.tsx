'use client';

interface MoneyDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCents?: boolean;
  className?: string;
  color?: 'default' | 'success' | 'warning' | 'danger';
}

export function MoneyDisplay({
  amount,
  size = 'md',
  showCents = false,
  className = '',
  color = 'default'
}: MoneyDisplayProps) {
  const sizeConfig = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl'
  };

  const colorConfig = {
    default: 'text-gray-900',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-red-600'
  };

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0
  }).format(amount);

  return (
    <span className={`font-semibold ${sizeConfig[size]} ${colorConfig[color]} ${className}`}>
      {formatted}
    </span>
  );
}
