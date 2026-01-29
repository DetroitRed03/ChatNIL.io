'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, ArrowLeft } from 'lucide-react';
import Papa from 'papaparse';

interface CSVUploaderProps {
  onUpload: (data: Record<string, string>[], headers: string[]) => void;
  onBack: () => void;
}

export function CSVUploader({ onUpload, onBack }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback((file: File) => {
    setError(null);
    setIsProcessing(true);

    // Validate file type
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a CSV file');
      setIsProcessing(false);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setIsProcessing(false);
      return;
    }

    setSelectedFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsProcessing(false);

        if (results.errors.length > 0) {
          const errorMessages = results.errors
            .slice(0, 3)
            .map(e => e.message)
            .join('; ');
          setError(`CSV parsing errors: ${errorMessages}`);
          return;
        }

        const data = results.data as Record<string, string>[];
        const headers = results.meta.fields || [];

        if (data.length === 0) {
          setError('CSV file is empty');
          return;
        }

        if (data.length > 2000) {
          setError(`Too many rows. Maximum allowed is 2,000, received ${data.length.toLocaleString()}`);
          return;
        }

        if (headers.length === 0) {
          setError('CSV file has no headers');
          return;
        }

        onUpload(data, headers);
      },
      error: (error) => {
        setIsProcessing(false);
        setError(`Failed to parse CSV: ${error.message}`);
      },
    });
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Upload Your CSV File</h2>
        <p className="text-gray-600 mt-2">
          Drag and drop your file or click to browse
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
          ${isDragging
            ? 'border-orange-500 bg-orange-50'
            : selectedFile
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Processing file...</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center">
            <FileText className="w-12 h-12 text-green-500 mb-4" />
            <p className="font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearFile();
              }}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="font-medium text-gray-900">
              Drop your CSV file here
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse your computer
            </p>
            <p className="text-xs text-gray-400 mt-4">
              Maximum file size: 10MB | Maximum rows: 2,000
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Upload Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );
}
