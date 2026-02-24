'use client';

import { useState } from 'react';
import { ChevronRight, AlertTriangle, AlertCircle } from 'lucide-react';
import { SlideOutPanel } from '@/components/ui/SlideOutPanel';
import { TouchButton } from '@/components/ui/TouchButton';
import { DealQuickView } from './DealQuickView';

function safe(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && 'name' in val) return String((val as Record<string, unknown>).name);
  return String(val);
}

export interface ActionItem {
  id: string;
  athleteName: string;
  athleteId: string;
  companyName: string;
  amount: number;
  riskScore: number;
  status: 'pending' | 'urgent' | 'critical';
  submittedAt: string;
  sport?: string;
  dealType?: string;
}

interface ActionItemCardProps {
  item: ActionItem;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRequestInfo?: (id: string) => void;
}

const statusConfig = {
  pending: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: 'Pending' },
  urgent: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'Urgent' },
  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Critical' },
};

export function ActionItemCard({
  item,
  onApprove,
  onReject,
  onRequestInfo,
}: ActionItemCardProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  const config = statusConfig[item.status];

  const riskColor = item.riskScore >= 70 ? 'text-red-600' :
                    item.riskScore >= 40 ? 'text-yellow-600' : 'text-green-600';

  const riskBg = item.riskScore >= 70 ? 'bg-red-50' :
                 item.riskScore >= 40 ? 'bg-yellow-50' : 'bg-green-50';

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
                {safe(item.athleteName)}
              </h3>
              {item.status === 'critical' && (
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              )}
              {item.status === 'urgent' && (
                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">
              {safe(item.companyName)}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 ml-2" />
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            ${item.amount.toLocaleString()}
          </span>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${riskBg}`}>
            <span className="text-xs text-gray-500">Risk</span>
            <span className={`text-sm font-bold ${riskColor}`}>
              {item.riskScore}
            </span>
          </div>
        </div>

        {/* Time */}
        <p className="text-xs text-gray-400 mt-2">
          {formatRelativeTime(item.submittedAt)}
        </p>
      </div>

      {/* Slide-Out Panel */}
      <SlideOutPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="Deal Review"
        footer={
          <div className="space-y-2">
            <TouchButton
              variant="success"
              fullWidth
              onClick={() => {
                onApprove?.(item.id);
                setPanelOpen(false);
              }}
            >
              Approve Deal
            </TouchButton>
            <div className="grid grid-cols-2 gap-2">
              <TouchButton
                variant="outline"
                fullWidth
                onClick={() => {
                  onRequestInfo?.(item.id);
                  setPanelOpen(false);
                }}
              >
                Request Info
              </TouchButton>
              <TouchButton
                variant="danger"
                fullWidth
                onClick={() => {
                  onReject?.(item.id);
                  setPanelOpen(false);
                }}
              >
                Reject
              </TouchButton>
            </div>
          </div>
        }
      >
        <DealQuickView item={item} />
      </SlideOutPanel>
    </>
  );
}

function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} min ago`;
  return 'Just now';
}
