'use client';

import { MoneyDisplay } from '../shared/MoneyDisplay';
import { DateCountdown } from '../shared/DateCountdown';

interface QuarterCardProps {
  quarter: {
    quarter: number;
    quarterName: string;
    dueDate: string;
    estimatedTax: number;
    paymentStatus: 'upcoming' | 'due_soon' | 'overdue' | 'paid' | 'partial';
    amountPaid?: number;
  };
  isNext?: boolean;
  className?: string;
}

export function QuarterCard({
  quarter,
  isNext = false,
  className = ''
}: QuarterCardProps) {
  const statusConfig = {
    upcoming: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      badge: 'bg-gray-100 text-gray-600',
      badgeLabel: 'Upcoming'
    },
    due_soon: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      badgeLabel: 'Due Soon'
    },
    overdue: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-700',
      badgeLabel: 'Overdue'
    },
    paid: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700',
      badgeLabel: 'Paid'
    },
    partial: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
      badgeLabel: 'Partial'
    }
  };

  const config = statusConfig[quarter.paymentStatus];

  return (
    <div
      className={`
        relative p-4 rounded-xl border-2 transition-all
        ${config.bg} ${config.border}
        ${isNext ? 'ring-2 ring-orange-300 ring-offset-2' : ''}
        ${className}
      `}
    >
      {isNext && (
        <span className="absolute -top-2 left-3 px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded">
          Next Due
        </span>
      )}

      {/* Quarter Name */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{quarter.quarterName}</h4>
        <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.badge}`}>
          {config.badgeLabel}
        </span>
      </div>

      {/* Amount */}
      <div className="mb-2">
        <MoneyDisplay
          amount={quarter.estimatedTax}
          size="lg"
          color={quarter.paymentStatus === 'overdue' ? 'danger' : 'default'}
        />
        {quarter.paymentStatus === 'partial' && quarter.amountPaid && (
          <p className="text-sm text-gray-500 mt-1">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quarter.amountPaid)} paid
          </p>
        )}
      </div>

      {/* Due Date */}
      {quarter.paymentStatus !== 'paid' && (
        <DateCountdown date={quarter.dueDate} />
      )}

      {/* Paid Check */}
      {quarter.paymentStatus === 'paid' && (
        <div className="flex items-center gap-1 text-emerald-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Paid in full</span>
        </div>
      )}
    </div>
  );
}
