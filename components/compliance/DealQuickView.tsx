'use client';

import { AlertTriangle, FileText, User, Building, Calendar, DollarSign } from 'lucide-react';

function safe(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && 'name' in val) return String((val as Record<string, unknown>).name);
  return String(val);
}

interface DealQuickViewProps {
  item: {
    id: string;
    athleteName: string;
    companyName: string;
    amount: number;
    riskScore: number;
    status: string;
    submittedAt: string;
    sport?: string;
    dealType?: string;
  };
}

export function DealQuickView({ item }: DealQuickViewProps) {
  const riskColor = item.riskScore >= 70 ? 'text-red-600' :
                    item.riskScore >= 40 ? 'text-yellow-600' : 'text-green-600';
  const riskBg = item.riskScore >= 70 ? 'bg-red-100' :
                 item.riskScore >= 40 ? 'bg-yellow-100' : 'bg-green-100';

  return (
    <div className="space-y-4">
      {/* Risk Score - Prominent */}
      <div className={`${riskBg} rounded-xl p-4 text-center`}>
        <p className="text-sm text-gray-600 mb-1">Risk Score</p>
        <p className={`text-4xl font-bold ${riskColor}`}>
          {item.riskScore}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {item.riskScore >= 70 ? 'High Risk - Review Carefully' :
           item.riskScore >= 40 ? 'Medium Risk' : 'Low Risk'}
        </p>
      </div>

      {/* Warning Flags */}
      {item.riskScore >= 60 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 text-sm">FMV Advisory</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Deal amount exceeds estimated fair market value. Verify terms before approving.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deal Details */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <DetailRow icon={<User className="w-4 h-4" />} label="Athlete" value={safe(item.athleteName)} />
        <DetailRow icon={<Building className="w-4 h-4" />} label="Company" value={safe(item.companyName)} />
        <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Amount" value={`$${item.amount.toLocaleString()}`} />
        {item.sport && <DetailRow icon={<User className="w-4 h-4" />} label="Sport" value={safe(item.sport)} />}
        {item.dealType && <DetailRow icon={<FileText className="w-4 h-4" />} label="Type" value={safe(item.dealType)} />}
        <DetailRow icon={<Calendar className="w-4 h-4" />} label="Submitted" value={new Date(item.submittedAt).toLocaleDateString()} />
      </div>

      {/* Documents */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Documents</p>
        <div className="space-y-2">
          <DocumentRow name="Contract.pdf" size="245 KB" />
          <DocumentRow name="Offer_Letter.pdf" size="128 KB" />
        </div>
      </div>

      {/* Quick Notes */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Add Note (Optional)</p>
        <textarea
          placeholder="Add a note for the athlete or internal team..."
          className="w-full p-3 border rounded-xl text-sm min-h-[80px] resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>
    </div>
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

function DocumentRow({ name, size }: { name: string; size: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <FileText className="w-5 h-5 text-gray-400" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-500">{size}</p>
      </div>
    </div>
  );
}
