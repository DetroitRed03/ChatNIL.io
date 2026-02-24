'use client';

import { useState } from 'react';
import { ChevronRight, AlertTriangle, Clock, User, Building, DollarSign, Calendar, FileText, Paperclip, Gavel } from 'lucide-react';
import { SlideOutPanel } from '@/components/ui/SlideOutPanel';
import { TouchButton } from '@/components/ui/TouchButton';

// Safety: ensure value is a renderable string
function safe(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && 'name' in val) return String((val as Record<string, unknown>).name);
  return String(val);
}

export interface Appeal {
  id: string;
  dealId: string;
  dealTitle: string;
  amount: number;
  athleteId: string;
  athleteName: string;
  sport: string;
  originalDecision: string;
  originalDecisionAt: string;
  appealReason: string;
  appealDocuments: string[];
  additionalContext?: string;
  submittedAt: string;
  status: string;
  daysOpen: number;
}

interface AppealCardProps {
  appeal: Appeal;
  onReview: (appeal: Appeal) => void;
}

const urgencyConfig = (daysOpen: number) => {
  if (daysOpen >= 7) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: `${daysOpen}d - Urgent` };
  if (daysOpen >= 3) return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: `${daysOpen}d open` };
  return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: `${daysOpen}d open` };
};

const decisionLabels: Record<string, string> = {
  approved: 'Approved',
  approved_with_conditions: 'Conditional',
  rejected: 'Rejected',
};

export function AppealCard({ appeal, onReview }: AppealCardProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  const urgency = urgencyConfig(appeal.daysOpen);

  return (
    <>
      {/* Card - Tappable */}
      <div
        onClick={() => setPanelOpen(true)}
        className={`
          ${urgency.bg} ${urgency.border} border rounded-xl p-4
          cursor-pointer active:scale-[0.99] transition-all
          hover:shadow-md
        `}
      >
        {/* Top Row */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {safe(appeal.athleteName)}
              </h3>
              {appeal.daysOpen >= 7 && (
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              )}
              {appeal.daysOpen >= 3 && appeal.daysOpen < 7 && (
                <Clock className="w-4 h-4 text-yellow-500 shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">
              {safe(appeal.dealTitle)}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 ml-2" />
        </div>

        {/* Amount + Urgency */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-bold text-gray-900">
            {formatAmount(appeal.amount)}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${urgency.text} ${urgency.bg}`}>
            {urgency.label}
          </span>
        </div>

        {/* Appeal Reason Preview */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {safe(appeal.appealReason)}
        </p>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Submitted {formatDate(appeal.submittedAt)}
          </p>
          <div className="flex items-center gap-2">
            {appeal.appealDocuments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Paperclip className="w-3 h-3" />
                {appeal.appealDocuments.length}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              appeal.status === 'under_review'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {appeal.status === 'under_review' ? 'Under Review' : 'New'}
            </span>
          </div>
        </div>
      </div>

      {/* Slide-Out Panel */}
      <SlideOutPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        title="Appeal Details"
        footer={
          <TouchButton
            variant="primary"
            fullWidth
            onClick={() => {
              onReview(appeal);
              setPanelOpen(false);
            }}
          >
            Review Appeal
          </TouchButton>
        }
      >
        <div className="space-y-4">
          {/* Urgency Banner */}
          <div className={`${urgency.bg} rounded-xl p-4 text-center`}>
            {appeal.daysOpen >= 7 ? (
              <AlertTriangle className={`w-8 h-8 ${urgency.text} mx-auto mb-2`} />
            ) : (
              <Clock className={`w-8 h-8 ${urgency.text} mx-auto mb-2`} />
            )}
            <p className={`text-2xl font-bold ${urgency.text}`}>
              {appeal.daysOpen} Day{appeal.daysOpen !== 1 ? 's' : ''} Open
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {appeal.daysOpen >= 7 ? 'Requires immediate attention' : 'Awaiting review'}
            </p>
          </div>

          {/* Original Decision */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Original Decision</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              appeal.originalDecision === 'rejected' ? 'bg-red-100 text-red-700' :
              appeal.originalDecision === 'approved_with_conditions' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {decisionLabels[appeal.originalDecision] || safe(appeal.originalDecision)}
            </span>
          </div>

          {/* Deal Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <DetailRow icon={<User className="w-4 h-4" />} label="Athlete" value={safe(appeal.athleteName)} />
            <DetailRow icon={<Gavel className="w-4 h-4" />} label="Sport" value={safe(appeal.sport)} />
            <DetailRow icon={<Building className="w-4 h-4" />} label="Deal" value={safe(appeal.dealTitle)} />
            <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Amount" value={formatAmount(appeal.amount)} />
            <DetailRow icon={<Calendar className="w-4 h-4" />} label="Original Decision" value={formatDate(appeal.originalDecisionAt)} />
            <DetailRow icon={<Calendar className="w-4 h-4" />} label="Appeal Filed" value={formatDate(appeal.submittedAt)} />
          </div>

          {/* Appeal Reason */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Appeal Reason</p>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{safe(appeal.appealReason)}</p>
            </div>
          </div>

          {/* Additional Context */}
          {appeal.additionalContext && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Additional Context</p>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{safe(appeal.additionalContext)}</p>
              </div>
            </div>
          )}

          {/* Documents */}
          {appeal.appealDocuments.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Attachments ({appeal.appealDocuments.length})
              </p>
              <div className="space-y-2">
                {appeal.appealDocuments.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 truncate">{safe(doc)}</span>
                  </div>
                ))}
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
