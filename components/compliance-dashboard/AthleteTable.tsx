'use client';

import { motion } from 'framer-motion';
import { ChevronRight, AlertTriangle, AlertCircle, CheckCircle, User, Clock, DollarSign } from 'lucide-react';
import { ScoreBadge } from '@/components/compliance/ScoreBadge';

interface Athlete {
  id: string;
  name: string;
  sport: string;
  dealCount: number;
  worstScore: number | null;
  worstStatus: string | null;
  totalEarnings: number;
  lastDealDate: string | null;
}

interface AthleteTableProps {
  athletes: Athlete[];
  onViewAthlete: (athleteId: string) => void;
  loading?: boolean;
}

// Safety: ensure value is a renderable string
function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'name' in value) {
    return String((value as Record<string, unknown>).name);
  }
  return String(value);
}

export function AthleteTable({ athletes, onViewAthlete, loading }: AthleteTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
          <User className="w-3.5 h-3.5" />
          No Deals
        </span>
      );
    }

    switch (status) {
      case 'red':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" />
            RED
          </span>
        );
      case 'yellow':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            <AlertCircle className="w-3.5 h-3.5" />
            YELLOW
          </span>
        );
      case 'green':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            GREEN
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusCardStyle = (status: string | null) => {
    switch (status) {
      case 'red':
        return 'border-red-200 bg-red-50/30';
      case 'yellow':
        return 'border-amber-200 bg-amber-50/30';
      case 'green':
        return 'border-green-200 bg-green-50/30';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  if (loading) {
    return (
      <div data-testid="athlete-table" className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-8 text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading athletes...</p>
        </div>
      </div>
    );
  }

  if (athletes.length === 0) {
    return (
      <div data-testid="athlete-table" className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-8 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No athletes found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="athlete-table">
      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {athletes.map((athlete, index) => (
          <motion.button
            key={athlete.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.02 }}
            onClick={() => onViewAthlete(athlete.id)}
            className={`w-full text-left border rounded-xl p-4 active:scale-[0.99] transition-all hover:shadow-md ${getStatusCardStyle(athlete.worstStatus)}`}
          >
            {/* Top Row: Name + Chevron */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {safeString(athlete.name)}
                </h3>
                <p className="text-sm text-gray-500">{safeString(athlete.sport)}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 ml-2" />
            </div>

            {/* Middle Row: Score Badge + Status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {athlete.worstScore !== null && athlete.worstStatus && (
                  <ScoreBadge
                    totalScore={athlete.worstScore}
                    status={athlete.worstStatus as 'green' | 'yellow' | 'red'}
                  />
                )}
                {getStatusBadge(athlete.worstStatus)}
              </div>
              <span className="text-sm font-medium text-gray-600">
                {athlete.dealCount} deal{athlete.dealCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Bottom Row: Earnings + Last Deal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-gray-900">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-lg">
                  {athlete.totalEarnings > 0 ? formatCurrency(athlete.totalEarnings) : '$0'}
                </span>
              </div>
              {athlete.lastDealDate && (
                <span className="text-xs text-gray-400">
                  Last: {formatDate(athlete.lastDealDate)}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Athlete</div>
          <div className="col-span-2">Sport</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1 text-center">Deals</div>
          <div className="col-span-2 text-right">Earnings</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {athletes.map((athlete, index) => (
            <motion.button
              key={athlete.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => onViewAthlete(athlete.id)}
              className="w-full grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors text-left"
            >
              {/* Athlete Name */}
              <div className="col-span-4">
                <p className="font-medium text-gray-900">{safeString(athlete.name)}</p>
                {athlete.worstScore !== null && athlete.worstStatus && (
                  <div className="mt-0.5">
                    <ScoreBadge
                      totalScore={athlete.worstScore}
                      status={athlete.worstStatus as 'green' | 'yellow' | 'red'}
                    />
                  </div>
                )}
              </div>

              {/* Sport */}
              <div className="col-span-2">
                <span className="text-gray-700">{safeString(athlete.sport)}</span>
              </div>

              {/* Status */}
              <div className="col-span-2 flex justify-center">
                {getStatusBadge(athlete.worstStatus)}
              </div>

              {/* Deal Count */}
              <div className="col-span-1 text-center">
                <span className="text-gray-900 font-medium">{athlete.dealCount}</span>
              </div>

              {/* Earnings */}
              <div className="col-span-2 text-right">
                <span className="text-gray-900 font-medium">
                  {athlete.totalEarnings > 0 ? formatCurrency(athlete.totalEarnings) : '-'}
                </span>
                {athlete.lastDealDate && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Last: {formatDate(athlete.lastDealDate)}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <div className="col-span-1 flex justify-end">
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
