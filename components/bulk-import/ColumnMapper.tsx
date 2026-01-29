'use client';

import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ColumnMapperProps {
  headers: string[];
  mapping: Record<string, string>;
  onMappingChange: (mapping: Record<string, string>) => void;
  onValidate: () => void;
  onBack: () => void;
  isValidating: boolean;
  rowCount: number;
}

const TARGET_FIELDS = [
  { id: 'email', label: 'Email', required: true },
  { id: 'first_name', label: 'First Name', required: true },
  { id: 'last_name', label: 'Last Name', required: true },
  { id: 'sport', label: 'Sport', required: true },
  { id: 'state', label: 'State', required: true },
  { id: 'school_name', label: 'School Name', required: false },
  { id: 'position', label: 'Position', required: false },
  { id: 'graduation_year', label: 'Graduation Year', required: false },
  { id: 'phone', label: 'Phone', required: false },
  { id: 'instagram', label: 'Instagram', required: false },
  { id: 'tiktok', label: 'TikTok', required: false },
  { id: 'twitter', label: 'Twitter/X', required: false },
  { id: 'date_of_birth', label: 'Date of Birth', required: false },
];

export function ColumnMapper({
  headers,
  mapping,
  onMappingChange,
  onValidate,
  onBack,
  isValidating,
  rowCount,
}: ColumnMapperProps) {
  const handleMappingChange = (csvColumn: string, targetField: string) => {
    const newMapping = { ...mapping };

    // Remove any existing mapping to this target field
    for (const [key, value] of Object.entries(newMapping)) {
      if (value === targetField && key !== csvColumn) {
        delete newMapping[key];
      }
    }

    if (targetField === '') {
      delete newMapping[csvColumn];
    } else {
      newMapping[csvColumn] = targetField;
    }

    onMappingChange(newMapping);
  };

  const getMappedTarget = (csvColumn: string) => mapping[csvColumn] || '';

  const isTargetMapped = (targetId: string) => {
    return Object.values(mapping).includes(targetId);
  };

  const requiredFieldsMapped = TARGET_FIELDS
    .filter(f => f.required)
    .every(f => isTargetMapped(f.id));

  const mappedCount = Object.keys(mapping).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Map Your Columns</h2>
        <p className="text-gray-600 mt-2">
          Match your CSV columns to the required athlete fields
        </p>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 p-4 bg-gray-50 rounded-xl">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{rowCount.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Athletes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{headers.length}</p>
          <p className="text-sm text-gray-600">Columns</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-500">{mappedCount}</p>
          <p className="text-sm text-gray-600">Mapped</p>
        </div>
      </div>

      {/* Mapping Status */}
      {!requiredFieldsMapped && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Required fields missing</p>
            <p>
              Please map all required fields:{' '}
              {TARGET_FIELDS
                .filter(f => f.required && !isTargetMapped(f.id))
                .map(f => f.label)
                .join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Mapping Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Your CSV Column
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                Maps To
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Target Field
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {headers.map((header) => {
              const mappedTarget = getMappedTarget(header);
              const targetField = TARGET_FIELDS.find(f => f.id === mappedTarget);

              return (
                <tr key={header} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {header}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ArrowRight className={`w-5 h-5 mx-auto ${mappedTarget ? 'text-green-500' : 'text-gray-300'}`} />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={mappedTarget}
                      onChange={(e) => handleMappingChange(header, e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        mappedTarget
                          ? targetField?.required
                            ? 'border-green-300 bg-green-50'
                            : 'border-blue-300 bg-blue-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <option value="">-- Do not import --</option>
                      <optgroup label="Required Fields">
                        {TARGET_FIELDS
                          .filter(f => f.required)
                          .map(field => (
                            <option
                              key={field.id}
                              value={field.id}
                              disabled={isTargetMapped(field.id) && mappedTarget !== field.id}
                            >
                              {field.label} {isTargetMapped(field.id) && mappedTarget !== field.id ? '(already mapped)' : ''}
                            </option>
                          ))
                        }
                      </optgroup>
                      <optgroup label="Optional Fields">
                        {TARGET_FIELDS
                          .filter(f => !f.required)
                          .map(field => (
                            <option
                              key={field.id}
                              value={field.id}
                              disabled={isTargetMapped(field.id) && mappedTarget !== field.id}
                            >
                              {field.label} {isTargetMapped(field.id) && mappedTarget !== field.id ? '(already mapped)' : ''}
                            </option>
                          ))
                        }
                      </optgroup>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
          <span className="text-gray-600">Required field mapped</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded" />
          <span className="text-gray-600">Optional field mapped</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded" />
          <span className="text-gray-600">Not mapped</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onValidate}
          disabled={!requiredFieldsMapped || isValidating}
          className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-colors ${
            requiredFieldsMapped && !isValidating
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              Validate Data
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
