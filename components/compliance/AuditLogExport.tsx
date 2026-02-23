'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuditLogExportProps {
  athleteId?: string;
  dealId?: string;
}

export function AuditLogExport({ athleteId, dealId }: AuditLogExportProps) {
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [showOptions, setShowOptions] = useState(false);

  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(format);

    try {
      const accessToken = await getAccessToken();
      const params = new URLSearchParams();
      if (dateRange.startDate) params.set('startDate', dateRange.startDate);
      if (dateRange.endDate) params.set('endDate', dateRange.endDate);
      if (athleteId) params.set('athleteId', athleteId);
      if (dealId) params.set('dealId', dealId);

      const endpoint = format === 'csv'
        ? '/api/compliance/export/audit-log'
        : '/api/compliance/export/audit-log-pdf';

      const response = await fetch(`${endpoint}?${params}`, {
        credentials: 'include',
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'html'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
      >
        <Download className="w-4 h-4" />
        Export Audit Log
      </button>

      {showOptions && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setShowOptions(false)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white border rounded-2xl shadow-2xl p-8 w-[520px] max-w-[90vw] pointer-events-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Export Audit Log</h3>
                <button
                  onClick={() => setShowOptions(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  &times;
                </button>
              </div>

              {/* Date Range */}
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-gray-700">Date Range (optional)</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 border rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      className="w-full px-4 py-2.5 border rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={!!exporting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium"
                >
                  {exporting === 'csv' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-5 h-5" />
                  )}
                  Export CSV
                </button>

                <button
                  onClick={() => handleExport('pdf')}
                  disabled={!!exporting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium"
                >
                  {exporting === 'pdf' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                  Export Report
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-4 text-center">
                CSV includes all data. Report limited to 500 entries.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
