'use client';

import { useState } from 'react';
import { MoneyDisplay } from '../shared/MoneyDisplay';
import { QuarterCard } from './QuarterCard';
import { DateCountdown } from '../shared/DateCountdown';

interface Quarter {
  quarter: number;
  quarterName: string;
  dueDate: string;
  estimatedTax: number;
  paymentStatus: 'upcoming' | 'due_soon' | 'overdue' | 'paid' | 'partial';
  amountPaid?: number;
}

interface TaxTrackerSectionProps {
  taxData: {
    currentYear: number;
    totalIncome: number;
    estimatedTax: number;
    quarters: Quarter[];
    setAsidePerDeal: number;
    nextDueDate: string;
    nextDueAmount: number;
  };
  className?: string;
}

export function TaxTrackerSection({
  taxData,
  className = ''
}: TaxTrackerSectionProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Find the next unpaid quarter
  const nextQuarter = taxData.quarters.find(q =>
    q.paymentStatus !== 'paid'
  );

  const w9Required = taxData.totalIncome >= 600;

  return (
    <section className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Tax Tracker</h2>
              <p className="text-sm text-white/80">{taxData.currentYear} Tax Year</p>
            </div>
          </div>
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-sm text-white/80 hover:text-white flex items-center gap-1"
          >
            {showBreakdown ? 'Hide' : 'Show'} Details
            <svg className={`w-4 h-4 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Total Income</p>
          <MoneyDisplay amount={taxData.totalIncome} size="lg" />
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Est. Tax (~25%)</p>
          <MoneyDisplay amount={taxData.estimatedTax} size="lg" color="warning" />
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Set Aside Per Deal</p>
          <MoneyDisplay amount={taxData.setAsidePerDeal} size="lg" color="success" />
        </div>
      </div>

      {/* W9 Alert */}
      {w9Required && (
        <div className="mx-4 my-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-grow">
            <h4 className="font-medium text-amber-800 text-sm">W-9 Required</h4>
            <p className="text-sm text-amber-700 mt-0.5">
              You've earned over $600 this year. Brands must send you a 1099 form for taxes.
              Make sure you've submitted your W-9 to each brand.
            </p>
          </div>
        </div>
      )}

      {/* Next Payment Due */}
      {nextQuarter && (
        <div className="px-4 py-3 bg-orange-50 border-y border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">
                Next quarterly payment: {nextQuarter.quarterName}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <MoneyDisplay amount={nextQuarter.estimatedTax} color="warning" />
                <DateCountdown date={nextQuarter.dueDate} urgentThresholdDays={7} />
              </div>
            </div>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors">
              Set Reminder
            </button>
          </div>
        </div>
      )}

      {/* Quarterly Breakdown */}
      {showBreakdown && (
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quarterly Timeline</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {taxData.quarters.map((quarter, index) => (
              <QuarterCard
                key={quarter.quarter}
                quarter={quarter}
                isNext={nextQuarter?.quarter === quarter.quarter}
              />
            ))}
          </div>

          {/* Tax Tip */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Pro Tip</h4>
                <p className="text-sm text-blue-700 mt-0.5">
                  Set aside 25% of each deal payment into a separate savings account.
                  That's about <MoneyDisplay amount={taxData.setAsidePerDeal} size="sm" className="inline" /> per deal to cover your taxes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
