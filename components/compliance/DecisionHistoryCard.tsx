'use client';

import { useState } from 'react';
import { ChevronRight, CheckCircle, XCircle, AlertCircle, Clock, User, Building, DollarSign, Calendar, Gavel } from 'lucide-react';
import { SlideOutPanel } from '@/components/ui/SlideOutPanel';

function safe(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && 'name' in val) return String((val as Record<string, unknown>).name);
  return String(val);
}
import { TouchButton } from '@/components/ui/TouchButton';

export interface DecisionRecord {
  id: string;
  dealId: string;
  dealTitle: string;
  athleteId: string;
  athleteName: string;
  sport: string;
  amount: number;
  decision: string;
  decisionAt: string;
  decisionBy: string;
  athleteNotes: string | null;
  athleteNotifiedAt: string | null;
  athleteViewedAt: string | null;
  hasActiveAppeal: boolean;
  appealCount: number;
}

interface DecisionHistoryCardProps {
  record: DecisionRecord;
  onViewDeal: (dealId: string) => void;
}

const decisionConfig: Record<string, { bg: string; border: string; text: string; label: string; icon: typeof CheckCircle }> = {
  approved: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Approved', icon: CheckCircle },
  approved_with_conditions: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: 'Conditional', icon: AlertCircle },
  rejected: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Rejected', icon: XCircle },
  info_requested: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: 'Info Requested', icon: Clock },
};

export function DecisionHistoryCard({ record, onViewDeal }: DecisionHistoryCardProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  const config = decisionConfig[record.decision] || {
    bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', label: record.decision, icon: Gavel,
  };
  const Icon = config.icon;

  const athleteStatus = record.hasActiveAppeal
    ? { label: 'Appeal Pending', color: 'text-orange-600', bg: 'bg-orange-50' }
    : record.athleteViewedAt
    ? { label: 'Viewed', color: 'text-green-600', bg: 'bg-green-50' }
    : record.athleteNotifiedAt
    ? { label: 'Notified', color: 'text-blue-600', bg: 'bg-blue-50' }
    : { label: 'Not notified', color: 'text-gray-500', bg: 'bg-gray-50' };

  return (
    <>
      {/* Card - Tappable */}
      <div
        onClick={() => setPanelOpen(true)}
        className={`
          ${config.bg} ${config.border} border rounded-xl p-4
          cursor-pointer active:scale-[0.99] transition-all
          hover:shadow-md
        `}
      >
        {/* Top Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {safe(record.athleteName)}
              </h3>
              <Icon className={`w-4 h-4 ${config.text} shrink-0`} />
            </div>
            <p className="text-sm text-gray-600 truncate">
              {safe(record.dealTitle)}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 ml-2" />
        </div>

        {/* Middle Row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-bold text-gray-900">
            {formatAmount(record.amount)}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {formatDate(record.decisionAt)}
          </p>
          {record.hasActiveAppeal && (
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              Appeal Active
            </span>
          )}
        </div>
      </div>

      {/* Slide-Out Panel */}
      <SlideOutPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="Decision Details"
        footer={
          <TouchButton
            variant="primary"
            fullWidth
            onClick={() => {
              onViewDeal(record.dealId);
              setPanelOpen(false);
            }}
          >
            View Full Deal
          </TouchButton>
        }
      >
        <div className="space-y-4">
          {/* Decision Badge - Prominent */}
          <div className={`${config.bg} rounded-xl p-4 text-center`}>
            <Icon className={`w-8 h-8 ${config.text} mx-auto mb-2`} />
            <p className={`text-2xl font-bold ${config.text}`}>
              {config.label}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              by {safe(record.decisionBy)}
            </p>
          </div>

          {/* Appeal Warning */}
          {record.hasActiveAppeal && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800 text-sm">Active Appeal</p>
                  <p className="text-xs text-orange-700 mt-0.5">
                    This decision has {record.appealCount} appeal{record.appealCount !== 1 ? 's' : ''} pending review.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Deal Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <DetailRow icon={<User className="w-4 h-4" />} label="Athlete" value={safe(record.athleteName)} />
            <DetailRow icon={<Gavel className="w-4 h-4" />} label="Sport" value={safe(record.sport)} />
            <DetailRow icon={<Building className="w-4 h-4" />} label="Deal" value={safe(record.dealTitle)} />
            <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Amount" value={formatAmount(record.amount)} />
            <DetailRow icon={<Calendar className="w-4 h-4" />} label="Decided" value={formatDate(record.decisionAt)} />
          </div>

          {/* Athlete Status */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Athlete Status</p>
            <div className={`${athleteStatus.bg} rounded-xl p-3 flex items-center justify-between`}>
              <span className={`text-sm font-medium ${athleteStatus.color}`}>
                {athleteStatus.label}
              </span>
              {record.appealCount > 0 && (
                <span className="text-xs text-gray-500">
                  {record.appealCount} appeal{record.appealCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          {record.athleteNotes && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-700">{safe(record.athleteNotes)}</p>
              </div>
            </div>
          )}
        </div>
      </SlideOutPanel>
    </>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-500 shrink-0">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[55%] break-words">{value}</span>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}
