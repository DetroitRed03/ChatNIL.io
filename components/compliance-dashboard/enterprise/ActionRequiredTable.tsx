'use client';

import { useState, useCallback, useMemo } from 'react';

function safe(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null && 'name' in val) return String((val as Record<string, unknown>).name);
  return String(val);
}

interface ActionItem {
  id: string;
  athleteId: string;
  athleteName: string;
  dealId: string;
  dealTitle: string;
  severity: 'critical' | 'warning';
  issue: string;
  amount: number;
  action: string;
  sport: string;
  dueDate?: string;
  assignedTo?: string;
  assignedToName?: string;
}

interface ActionRequiredTableProps {
  items: ActionItem[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onItemClick: (item: ActionItem) => void;
  onAssign: (itemId: string) => void;
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function ActionRequiredTable({
  items,
  selectedIds,
  onSelectionChange,
  onItemClick,
  onAssign,
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange
}: ActionRequiredTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const allSelected = items.length > 0 && items.every(item => selectedIds.has(item.id));
  const someSelected = items.some(item => selectedIds.has(item.id));

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.map(item => item.id)));
    }
  }, [items, allSelected, onSelectionChange]);

  const handleSelectItem = useCallback((id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    onSelectionChange(newSelection);
  }, [selectedIds, onSelectionChange]);

  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="text-red-600 font-medium">Overdue</span>;
    if (diffDays === 0) return <span className="text-orange-600 font-medium">Today</span>;
    if (diffDays === 1) return <span className="text-yellow-600">Tomorrow</span>;
    if (diffDays <= 7) return <span className="text-gray-600">{diffDays} days</span>;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" data-testid="action-table">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Severity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Athlete
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Deal
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Issue
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Due
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Assigned
              </th>
              <th className="w-20 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map(item => (
              <tr
                key={item.id}
                className={`transition-colors ${
                  selectedIds.has(item.id) ? 'bg-orange-50' : hoveredRow === item.id ? 'bg-gray-50' : ''
                }`}
                onMouseEnter={() => setHoveredRow(item.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.severity === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.severity === 'critical' ? (
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    ) : (
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                    )}
                    {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onItemClick(item)}
                    className="text-left hover:text-orange-600 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{safe(item.athleteName)}</div>
                    <div className="text-xs text-gray-500">{safe(item.sport)}</div>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900">{safe(item.dealTitle)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600 line-clamp-2">{safe(item.issue)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {formatDate(item.dueDate)}
                </td>
                <td className="px-4 py-3">
                  {item.assignedToName ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                      <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                        {item.assignedToName.charAt(0)}
                      </span>
                      {item.assignedToName.split(' ')[0]}
                    </span>
                  ) : (
                    <button
                      onClick={() => onAssign(item.id)}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      Assign
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onItemClick(item)}
                    className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="View details"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Showing {startItem}-{endItem} of {totalItems}
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-200 rounded bg-white"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 text-sm rounded ${
                    page === pageNum
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
