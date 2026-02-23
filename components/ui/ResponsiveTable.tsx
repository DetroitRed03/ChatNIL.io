'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  hideOnMobile?: boolean;
  className?: string;
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  mobileCardRender?: (row: T) => React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  onRowClick,
  emptyMessage = 'No data available',
  mobileCardRender,
  isLoading,
  className,
}: ResponsiveTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((row) => (
          <div
            key={String(row[keyField])}
            onClick={() => onRowClick?.(row)}
            className={cn(
              'bg-white rounded-xl border p-4',
              onRowClick && 'cursor-pointer active:scale-[0.99] hover:shadow-md transition-all'
            )}
          >
            {mobileCardRender ? (
              mobileCardRender(row)
            ) : (
              <DefaultMobileCard row={row} columns={columns} />
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'text-left text-sm font-semibold text-gray-600 py-3 px-4',
                    column.hideOnMobile && 'hidden lg:table-cell',
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={String(row[keyField])}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b last:border-0 hover:bg-gray-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'py-4 px-4 text-sm text-gray-700',
                      column.hideOnMobile && 'hidden lg:table-cell',
                      column.className
                    )}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DefaultMobileCard<T extends Record<string, any>>({
  row,
  columns,
}: {
  row: T;
  columns: Column<T>[];
}) {
  const visibleColumns = columns.filter((c) => !c.hideOnMobile);
  const primaryColumn = visibleColumns[0];
  const secondaryColumns = visibleColumns.slice(1, 4);

  return (
    <div>
      <div className="font-semibold text-gray-900 mb-2">
        {primaryColumn?.render ? primaryColumn.render(row) : row[primaryColumn?.key]}
      </div>
      <div className="space-y-1">
        {secondaryColumns.map((column) => (
          <div key={column.key} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{column.header}</span>
            <span className="text-gray-700">
              {column.render ? column.render(row) : row[column.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
