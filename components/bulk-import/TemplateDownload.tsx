'use client';

import { Download, FileText, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface TemplateDownloadProps {
  onContinue: () => void;
}

const REQUIRED_FIELDS = [
  { name: 'email', description: 'Athlete\'s email address (must be unique)' },
  { name: 'first_name', description: 'Athlete\'s first name' },
  { name: 'last_name', description: 'Athlete\'s last name' },
  { name: 'sport', description: 'Primary sport (e.g., Basketball, Soccer)' },
  { name: 'state', description: 'State code (e.g., CA, NY, TX)' },
];

const OPTIONAL_FIELDS = [
  { name: 'school_name', description: 'School or university name' },
  { name: 'position', description: 'Position in sport (e.g., Point Guard)' },
  { name: 'graduation_year', description: 'Expected graduation year' },
  { name: 'phone', description: 'Contact phone number' },
  { name: 'instagram', description: 'Instagram handle (without @)' },
  { name: 'tiktok', description: 'TikTok handle (without @)' },
  { name: 'twitter', description: 'Twitter/X handle (without @)' },
  { name: 'date_of_birth', description: 'Date of birth (YYYY-MM-DD format)' },
];

export function TemplateDownload({ onContinue }: TemplateDownloadProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch('/api/compliance/import/template');
      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'athlete_import_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Download CSV Template</h2>
        <p className="text-gray-600 mt-2">
          Start by downloading our template to ensure your data is formatted correctly
        </p>
      </div>

      {/* Download Button */}
      <div className="flex justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center gap-3 px-6 py-4 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-md"
        >
          <Download className="w-5 h-5" />
          Download Template (.csv)
        </button>
      </div>

      {/* Field Documentation */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Required Fields */}
        <div className="bg-orange-50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Required Fields</h3>
          </div>
          <div className="space-y-3">
            {REQUIRED_FIELDS.map(field => (
              <div key={field.name} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-mono text-sm text-gray-900">{field.name}</span>
                  <p className="text-sm text-gray-600">{field.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Fields */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Optional Fields</h3>
          </div>
          <div className="space-y-3">
            {OPTIONAL_FIELDS.map(field => (
              <div key={field.name} className="flex items-start gap-2">
                <div className="w-4 h-4 border border-gray-300 rounded mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-mono text-sm text-gray-900">{field.name}</span>
                  <p className="text-sm text-gray-600">{field.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Tips for Success</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Ensure all emails are unique - duplicates will be flagged</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Use 2-letter state codes (CA, NY, TX) for the state field</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Maximum of 2,000 athletes per import</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Social media handles should not include the @ symbol</span>
          </li>
        </ul>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={onContinue}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          Continue to Upload
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
