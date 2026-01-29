'use client';

import { CheckCircle, AlertCircle, RotateCcw, ArrowRight, Download, UserPlus, UserCheck, SkipForward, UserX } from 'lucide-react';

interface ImportResult {
  success: boolean;
  import_id: string;
  summary: {
    total_rows: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  results: Array<{
    row_number: number;
    email: string;
    status: 'created' | 'updated' | 'skipped' | 'failed';
    error?: string;
  }>;
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;
}

interface ImportResultsProps {
  result: ImportResult;
  onStartOver: () => void;
  onGoToDashboard: () => void;
}

export function ImportResults({ result, onStartOver, onGoToDashboard }: ImportResultsProps) {
  const { summary, errors, results } = result;
  const successRate = summary.total_rows > 0
    ? Math.round(((summary.created + summary.updated) / summary.total_rows) * 100)
    : 0;

  const handleExportErrors = () => {
    if (errors.length === 0) return;

    const csvContent = [
      'Row,Email,Error',
      ...errors.map(e => `${e.row},"${e.email}","${e.error.replace(/"/g, '""')}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_errors_${result.import_id}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
          summary.failed === 0 ? 'bg-green-100' : 'bg-amber-100'
        }`}>
          {summary.failed === 0 ? (
            <CheckCircle className="w-8 h-8 text-green-500" />
          ) : (
            <AlertCircle className="w-8 h-8 text-amber-500" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Import Complete</h2>
        <p className="text-gray-600 mt-2">
          Successfully imported {(summary.created + summary.updated).toLocaleString()} athletes ({successRate}% success rate)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <UserPlus className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-700">{summary.created}</p>
          <p className="text-sm text-green-600">Created</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <UserCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-700">{summary.updated}</p>
          <p className="text-sm text-blue-600">Updated</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <SkipForward className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-700">{summary.skipped}</p>
          <p className="text-sm text-gray-600">Skipped</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <UserX className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-700">{summary.failed}</p>
          <p className="text-sm text-red-600">Failed</p>
        </div>
      </div>

      {/* Import ID */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Import ID (for reference)</p>
            <p className="font-mono text-sm text-gray-900">{result.import_id}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(result.import_id)}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Errors Section */}
      {errors.length > 0 && (
        <div className="border border-red-200 rounded-xl overflow-hidden">
          <div className="bg-red-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">
                Failed Imports ({errors.length})
              </span>
            </div>
            <button
              onClick={handleExportErrors}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
            >
              <Download className="w-4 h-4" />
              Export Errors
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-red-700">Row</th>
                  <th className="px-4 py-2 text-left text-red-700">Email</th>
                  <th className="px-4 py-2 text-left text-red-700">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {errors.slice(0, 50).map((error, idx) => (
                  <tr key={idx} className="hover:bg-red-50">
                    <td className="px-4 py-2 text-red-600">{error.row}</td>
                    <td className="px-4 py-2 font-mono text-red-600">{error.email}</td>
                    <td className="px-4 py-2 text-red-700">{error.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {errors.length > 50 && (
              <p className="px-4 py-2 text-sm text-red-600 bg-red-50">
                + {errors.length - 50} more errors (download to see all)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recent Results */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3">
          <span className="font-medium text-gray-900">Recent Import Results</span>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-gray-600">Row</th>
                <th className="px-4 py-2 text-left text-gray-600">Email</th>
                <th className="px-4 py-2 text-left text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.slice(0, 20).map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-500">{row.row_number}</td>
                  <td className="px-4 py-2 font-mono text-xs">{row.email}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.status === 'created'
                        ? 'bg-green-100 text-green-700'
                        : row.status === 'updated'
                        ? 'bg-blue-100 text-blue-700'
                        : row.status === 'skipped'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {row.status === 'created' && <UserPlus className="w-3 h-3" />}
                      {row.status === 'updated' && <UserCheck className="w-3 h-3" />}
                      {row.status === 'skipped' && <SkipForward className="w-3 h-3" />}
                      {row.status === 'failed' && <UserX className="w-3 h-3" />}
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onStartOver}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Import More Athletes
        </button>
        <button
          onClick={onGoToDashboard}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
