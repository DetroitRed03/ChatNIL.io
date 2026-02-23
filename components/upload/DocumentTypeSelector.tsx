'use client';

import { DOCUMENT_CATEGORIES } from '@/lib/documents/categories';

interface DocumentTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
  className?: string;
}

export function DocumentTypeSelector({ value, onChange, className = '' }: DocumentTypeSelectorProps) {
  const dealDocs = Object.values(DOCUMENT_CATEGORIES).filter(c => c.requiresComplianceReview);
  const otherDocs = Object.values(DOCUMENT_CATEGORIES).filter(c => !c.requiresComplianceReview);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        What type of document is this?
      </label>

      <div className="space-y-4">
        {/* Deal Documents */}
        <div>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full" />
            Deal Documents (requires compliance review)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {dealDocs.map(doc => (
              <button
                key={doc.id}
                type="button"
                onClick={() => onChange(doc.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  value === doc.id
                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <span className="font-medium text-sm">{doc.label}</span>
                <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Other Documents */}
        <div>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full" />
            Other Documents (no review needed)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {otherDocs.map(doc => (
              <button
                key={doc.id}
                type="button"
                onClick={() => onChange(doc.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  value === doc.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium text-xs">{doc.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selection indicator */}
      {value && (
        <div className={`mt-3 p-2 rounded text-sm ${
          DOCUMENT_CATEGORIES[value]?.requiresComplianceReview
            ? 'bg-orange-50 text-orange-700'
            : 'bg-gray-50 text-gray-600'
        }`}>
          {DOCUMENT_CATEGORIES[value]?.requiresComplianceReview
            ? 'This document will be sent for compliance review'
            : 'This document will be saved to your files (no review needed)'
          }
        </div>
      )}
    </div>
  );
}
