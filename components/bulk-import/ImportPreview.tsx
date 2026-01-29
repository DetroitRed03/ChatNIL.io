'use client';

import { ArrowLeft, AlertCircle, AlertTriangle, CheckCircle, Loader2, Play, UserCheck, UserX, Users } from 'lucide-react';

interface ValidationResult {
  is_valid: boolean;
  summary: {
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    rows_with_warnings: number;
    duplicates_in_file: number;
    existing_users: number;
    total_errors: number;
    total_warnings: number;
  };
  errors: Array<{
    row: number;
    field: string;
    value: string;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    value: string;
    message: string;
  }>;
  preview: Array<{
    row_number: number;
    email: string;
    first_name: string;
    last_name: string;
    sport: string;
    state: string;
    is_valid: boolean;
    errors: Array<{ field: string; message: string }>;
    warnings: Array<{ field: string; message: string }>;
  }>;
}

interface ImportOptions {
  skip_existing: boolean;
  update_existing: boolean;
  send_invite_emails: boolean;
}

interface ImportPreviewProps {
  validation: ValidationResult;
  options: ImportOptions;
  onOptionsChange: (options: ImportOptions) => void;
  onImport: () => void;
  onBack: () => void;
  isImporting: boolean;
}

export function ImportPreview({
  validation,
  options,
  onOptionsChange,
  onImport,
  onBack,
  isImporting,
}: ImportPreviewProps) {
  const { summary, errors, warnings, preview } = validation;

  const canImport = summary.valid_rows > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
          validation.is_valid ? 'bg-green-100' : 'bg-amber-100'
        }`}>
          {validation.is_valid ? (
            <CheckCircle className="w-8 h-8 text-green-500" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {validation.is_valid ? 'Ready to Import' : 'Review Issues'}
        </h2>
        <p className="text-gray-600 mt-2">
          {validation.is_valid
            ? `All ${summary.valid_rows.toLocaleString()} athletes are ready to import`
            : `${summary.invalid_rows.toLocaleString()} rows have errors that need attention`
          }
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-700">{summary.valid_rows}</p>
          <p className="text-sm text-green-600">Valid Rows</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <UserX className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-700">{summary.invalid_rows}</p>
          <p className="text-sm text-red-600">Invalid Rows</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-700">{summary.rows_with_warnings}</p>
          <p className="text-sm text-amber-600">With Warnings</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-700">{summary.existing_users}</p>
          <p className="text-sm text-blue-600">Already Exist</p>
        </div>
      </div>

      {/* Errors Section */}
      {errors.length > 0 && (
        <div className="border border-red-200 rounded-xl overflow-hidden">
          <div className="bg-red-50 px-4 py-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">
              Errors ({summary.total_errors})
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-red-700">Row</th>
                  <th className="px-4 py-2 text-left text-red-700">Field</th>
                  <th className="px-4 py-2 text-left text-red-700">Issue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {errors.slice(0, 50).map((error, idx) => (
                  <tr key={idx} className="hover:bg-red-50">
                    <td className="px-4 py-2 text-red-600">{error.row}</td>
                    <td className="px-4 py-2 font-mono text-red-600">{error.field}</td>
                    <td className="px-4 py-2 text-red-700">{error.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {errors.length > 50 && (
              <p className="px-4 py-2 text-sm text-red-600 bg-red-50">
                + {errors.length - 50} more errors
              </p>
            )}
          </div>
        </div>
      )}

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <div className="border border-amber-200 rounded-xl overflow-hidden">
          <div className="bg-amber-50 px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-800">
              Warnings ({summary.total_warnings})
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-amber-700">Row</th>
                  <th className="px-4 py-2 text-left text-amber-700">Field</th>
                  <th className="px-4 py-2 text-left text-amber-700">Warning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {warnings.slice(0, 50).map((warning, idx) => (
                  <tr key={idx} className="hover:bg-amber-50">
                    <td className="px-4 py-2 text-amber-600">{warning.row}</td>
                    <td className="px-4 py-2 font-mono text-amber-600">{warning.field}</td>
                    <td className="px-4 py-2 text-amber-700">{warning.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {warnings.length > 50 && (
              <p className="px-4 py-2 text-sm text-amber-600 bg-amber-50">
                + {warnings.length - 50} more warnings
              </p>
            )}
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3">
          <span className="font-medium text-gray-900">Data Preview (First 10 Rows)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-gray-600">Row</th>
                <th className="px-3 py-2 text-left text-gray-600">Status</th>
                <th className="px-3 py-2 text-left text-gray-600">Email</th>
                <th className="px-3 py-2 text-left text-gray-600">Name</th>
                <th className="px-3 py-2 text-left text-gray-600">Sport</th>
                <th className="px-3 py-2 text-left text-gray-600">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {preview.map((row) => (
                <tr key={row.row_number} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-500">{row.row_number}</td>
                  <td className="px-3 py-2">
                    {row.is_valid ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        Invalid
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{row.email}</td>
                  <td className="px-3 py-2">{row.first_name} {row.last_name}</td>
                  <td className="px-3 py-2">{row.sport}</td>
                  <td className="px-3 py-2">{row.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Options */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Import Options</h3>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.skip_existing}
              onChange={(e) => onOptionsChange({
                ...options,
                skip_existing: e.target.checked,
                update_existing: e.target.checked ? false : options.update_existing,
              })}
              className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 mt-0.5"
            />
            <div>
              <span className="font-medium text-gray-900">Skip existing users</span>
              <p className="text-sm text-gray-600">
                Athletes with matching emails will be skipped (not updated)
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.update_existing}
              onChange={(e) => onOptionsChange({
                ...options,
                update_existing: e.target.checked,
                skip_existing: e.target.checked ? false : options.skip_existing,
              })}
              className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 mt-0.5"
            />
            <div>
              <span className="font-medium text-gray-900">Update existing users</span>
              <p className="text-sm text-gray-600">
                Athletes with matching emails will have their information updated
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer opacity-50">
            <input
              type="checkbox"
              checked={options.send_invite_emails}
              onChange={(e) => onOptionsChange({
                ...options,
                send_invite_emails: e.target.checked,
              })}
              disabled
              className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 mt-0.5"
            />
            <div>
              <span className="font-medium text-gray-900">Send invite emails</span>
              <p className="text-sm text-gray-600">
                Send welcome emails to newly created athletes (coming soon)
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isImporting}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mapping
        </button>
        <button
          onClick={onImport}
          disabled={!canImport || isImporting}
          className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-colors ${
            canImport && !isImporting
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isImporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Import {summary.valid_rows.toLocaleString()} Athletes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
