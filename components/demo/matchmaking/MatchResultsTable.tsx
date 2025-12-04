'use client';

import React, { useState, useMemo } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface AthleteMatch {
  athlete_id: string;
  athlete_name: string;
  sport: string;
  fmv_score: number;
  fmv_tier: string;
  match_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  recommended_offer_low: number; // cents
  recommended_offer_high: number; // cents
  avatar_url?: string;
  state?: string;
}

interface MatchResultsTableProps {
  matches: AthleteMatch[];
  onAthleteClick: (match: AthleteMatch) => void;
  className?: string;
}

type SortKey = 'athlete_name' | 'sport' | 'fmv_score' | 'match_score' | 'confidence_level';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  }
  return `$${dollars.toLocaleString()}`;
}

function getConfidenceBadgeVariant(level: string): 'success' | 'warning' | 'gray' {
  switch (level) {
    case 'high':
      return 'success';
    case 'medium':
      return 'warning';
    default:
      return 'gray';
  }
}

function getTierBadgeVariant(tier: string): 'accent' | 'primary' | 'success' | 'warning' | 'gray' {
  switch (tier) {
    case 'elite':
      return 'accent';
    case 'high':
      return 'primary';
    case 'medium':
      return 'success';
    case 'developing':
      return 'warning';
    default:
      return 'gray';
  }
}

export function MatchResultsTable({ matches, onAthleteClick, className }: MatchResultsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('match_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Sort matches
  const sortedMatches = useMemo(() => {
    const sorted = [...matches].sort((a, b) => {
      let aValue: any = a[sortKey];
      let bValue: any = b[sortKey];

      // Handle string comparisons
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle confidence level sorting
      if (sortKey === 'confidence_level') {
        const confidenceOrder = { high: 3, medium: 2, low: 1 };
        aValue = confidenceOrder[a.confidence_level];
        bValue = confidenceOrder[b.confidence_level];
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [matches, sortKey, sortDirection]);

  // Paginate matches
  const totalPages = Math.ceil(sortedMatches.length / ITEMS_PER_PAGE);
  const paginatedMatches = sortedMatches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table */}
      <div className="overflow-x-auto bg-white border border-border rounded-lg shadow-sm">
        <table className="w-full">
          <thead className="bg-background-secondary border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-text-primary">
                Athlete
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('sport')}
                  className="flex items-center gap-2 text-sm font-semibold text-text-primary hover:text-primary-600 transition-colors"
                >
                  Sport
                  <SortIcon columnKey="sport" />
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('fmv_score')}
                  className="flex items-center gap-2 text-sm font-semibold text-text-primary hover:text-primary-600 transition-colors"
                >
                  FMV
                  <SortIcon columnKey="fmv_score" />
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('match_score')}
                  className="flex items-center gap-2 text-sm font-semibold text-text-primary hover:text-primary-600 transition-colors"
                >
                  Match %
                  <SortIcon columnKey="match_score" />
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => handleSort('confidence_level')}
                  className="flex items-center gap-2 text-sm font-semibold text-text-primary hover:text-primary-600 transition-colors"
                >
                  Confidence
                  <SortIcon columnKey="confidence_level" />
                </button>
              </th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-text-primary">
                Recommended Offer
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedMatches.map((match) => (
              <tr
                key={match.athlete_id}
                onClick={() => onAthleteClick(match)}
                className="hover:bg-background-hover cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={match.avatar_url}
                      alt={match.athlete_name}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-text-primary">
                        {match.athlete_name}
                      </p>
                      {match.state && (
                        <p className="text-xs text-text-tertiary">{match.state}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-text-secondary">{match.sport}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">
                      {match.fmv_score}
                    </span>
                    <Badge variant={getTierBadgeVariant(match.fmv_tier)} size="sm">
                      {match.fmv_tier}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 max-w-[100px]">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${match.match_score}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-text-primary">
                      {match.match_score}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={getConfidenceBadgeVariant(match.confidence_level)}
                    size="sm"
                  >
                    {match.confidence_level}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="text-sm font-medium text-text-primary">
                    {formatCurrency(match.recommended_offer_low)} -{' '}
                    {formatCurrency(match.recommended_offer_high)}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4">
          <p className="text-sm text-text-secondary">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, sortedMatches.length)} of{' '}
            {sortedMatches.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-border hover:bg-background-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-border hover:bg-background-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
