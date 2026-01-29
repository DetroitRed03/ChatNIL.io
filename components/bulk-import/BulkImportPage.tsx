'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, CheckCircle, Upload, Table, Eye, Loader2, FileCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TemplateDownload } from './TemplateDownload';
import { CSVUploader } from './CSVUploader';
import { ColumnMapper } from './ColumnMapper';
import { ImportPreview } from './ImportPreview';
import { ImportProgress } from './ImportProgress';
import { ImportResults } from './ImportResults';

type ImportStep = 'template' | 'upload' | 'map' | 'preview' | 'importing' | 'results';

interface ParsedRow {
  [key: string]: string;
}

interface ColumnMapping {
  [csvColumn: string]: string;
}

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

const STEPS: { id: ImportStep; label: string; icon: React.ReactNode }[] = [
  { id: 'template', label: 'Download Template', icon: <FileCheck className="w-5 h-5" /> },
  { id: 'upload', label: 'Upload CSV', icon: <Upload className="w-5 h-5" /> },
  { id: 'map', label: 'Map Columns', icon: <Table className="w-5 h-5" /> },
  { id: 'preview', label: 'Review', icon: <Eye className="w-5 h-5" /> },
  { id: 'importing', label: 'Import', icon: <Loader2 className="w-5 h-5" /> },
  { id: 'results', label: 'Results', icon: <CheckCircle className="w-5 h-5" /> },
];

export function BulkImportPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ImportStep>('template');
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Options for import
  const [importOptions, setImportOptions] = useState({
    skip_existing: true,
    update_existing: false,
    send_invite_emails: false,
  });

  const handleFileUpload = useCallback((data: ParsedRow[], headers: string[]) => {
    setParsedData(data);
    setCsvHeaders(headers);
    setError(null);

    // Auto-map columns based on header names
    const autoMapping: ColumnMapping = {};
    const targetFields = [
      'email', 'first_name', 'last_name', 'sport', 'state',
      'school_name', 'position', 'graduation_year', 'phone',
      'instagram', 'tiktok', 'twitter', 'date_of_birth'
    ];

    headers.forEach(header => {
      const normalized = header.toLowerCase().replace(/[\s_-]+/g, '_');
      const match = targetFields.find(field =>
        normalized === field ||
        normalized.includes(field) ||
        field.includes(normalized)
      );
      if (match) {
        autoMapping[header] = match;
      }
    });

    setColumnMapping(autoMapping);
    setCurrentStep('map');
  }, []);

  const handleValidate = useCallback(async () => {
    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch('/api/compliance/import/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: parsedData,
          column_mapping: columnMapping,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Validation failed');
      }

      setValidationResult(data.validation);
      setCurrentStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  }, [parsedData, columnMapping]);

  const handleImport = useCallback(async () => {
    setIsImporting(true);
    setCurrentStep('importing');
    setImportProgress(0);
    setError(null);

    try {
      // Apply column mapping to data
      const mappedRows = parsedData.map(row => {
        const mapped: Record<string, string> = {};
        for (const [csvCol, value] of Object.entries(row)) {
          const targetField = columnMapping[csvCol] || csvCol.toLowerCase().replace(/\s+/g, '_');
          mapped[targetField] = value;
        }
        return mapped;
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/compliance/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: mappedRows,
          options: importOptions,
        }),
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult(data);
      setCurrentStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setCurrentStep('preview');
    } finally {
      setIsImporting(false);
    }
  }, [parsedData, columnMapping, importOptions]);

  const handleBack = useCallback(() => {
    const stepOrder: ImportStep[] = ['template', 'upload', 'map', 'preview', 'importing', 'results'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep]);

  const handleStartOver = useCallback(() => {
    setParsedData([]);
    setCsvHeaders([]);
    setColumnMapping({});
    setValidationResult(null);
    setImportResult(null);
    setError(null);
    setCurrentStep('template');
  }, []);

  const getStepIndex = (step: ImportStep) => STEPS.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/compliance/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Athlete Import</h1>
          <p className="text-gray-600 mt-2">
            Import multiple athletes at once using a CSV file
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${(getStepIndex(currentStep) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>

            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = getStepIndex(currentStep) > index;
              const isDisabled = step.id === 'importing' || step.id === 'results';

              return (
                <div
                  key={step.id}
                  className={`relative flex flex-col items-center ${
                    isDisabled ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${
                      isActive
                        ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                        : isCompleted
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.icon}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isActive ? 'text-orange-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {currentStep === 'template' && (
            <TemplateDownload onContinue={() => setCurrentStep('upload')} />
          )}

          {currentStep === 'upload' && (
            <CSVUploader
              onUpload={handleFileUpload}
              onBack={handleBack}
            />
          )}

          {currentStep === 'map' && (
            <ColumnMapper
              headers={csvHeaders}
              mapping={columnMapping}
              onMappingChange={setColumnMapping}
              onValidate={handleValidate}
              onBack={handleBack}
              isValidating={isValidating}
              rowCount={parsedData.length}
            />
          )}

          {currentStep === 'preview' && validationResult && (
            <ImportPreview
              validation={validationResult}
              options={importOptions}
              onOptionsChange={setImportOptions}
              onImport={handleImport}
              onBack={handleBack}
              isImporting={isImporting}
            />
          )}

          {currentStep === 'importing' && (
            <ImportProgress
              progress={importProgress}
              totalRows={parsedData.length}
            />
          )}

          {currentStep === 'results' && importResult && (
            <ImportResults
              result={importResult}
              onStartOver={handleStartOver}
              onGoToDashboard={() => router.push('/compliance/dashboard')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
