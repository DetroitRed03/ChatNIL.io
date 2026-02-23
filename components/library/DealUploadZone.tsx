'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, CheckCircle, AlertTriangle, Sparkles, FileImage, FileUp, ArrowLeft } from 'lucide-react';
import type { AnalysisStatus } from '@/lib/types/deal-analysis';
import { ACCEPT_STRING, ACCEPTED_MIME_TYPES } from '@/lib/uploads/file-types';
import { DOCUMENT_CATEGORIES, requiresComplianceReview } from '@/lib/documents/categories';

interface DealUploadZoneProps {
  onFileSelected: (file: File) => void;
  onNonDealUpload?: (file: File, documentType: string) => void;
  isAnalyzing: boolean;
  currentStatus: AnalysisStatus | null;
}

const STATUS_MESSAGES: Record<AnalysisStatus, { icon: any; message: string; color: string }> = {
  pending: { icon: Loader2, message: 'Preparing...', color: 'text-gray-500' },
  uploading: { icon: Upload, message: 'Uploading your document...', color: 'text-blue-600' },
  extracting: { icon: Sparkles, message: 'AI is extracting deal terms...', color: 'text-orange-600' },
  scoring: { icon: Sparkles, message: 'Running compliance check...', color: 'text-amber-600' },
  completed: { icon: CheckCircle, message: 'Analysis complete!', color: 'text-green-600' },
  failed: { icon: AlertTriangle, message: 'Analysis failed. Please try again.', color: 'text-red-600' },
};

export default function DealUploadZone({ onFileSelected, onNonDealUpload, isAnalyzing, currentStatus }: DealUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [documentType, setDocumentType] = useState<string>('');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const needsReview = documentType ? requiresComplianceReview(documentType) : true;

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (isAnalyzing) return;

    const file = e.dataTransfer?.files?.[0];
    if (file && ACCEPTED_MIME_TYPES.includes(file.type)) {
      handleFileChosen(file);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChosen(file);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFileChosen = (file: File) => {
    if (documentType && !needsReview && onNonDealUpload) {
      // Non-deal document — skip compliance, just store
      onNonDealUpload(file, documentType);
      setDocumentType('');
      setShowTypeSelector(false);
    } else {
      // Deal document — run analysis pipeline
      onFileSelected(file);
      setDocumentType('');
      setShowTypeSelector(false);
    }
  };

  const dealDocs = Object.values(DOCUMENT_CATEGORIES).filter(c => c.requiresComplianceReview);
  const otherDocs = Object.values(DOCUMENT_CATEGORIES).filter(c => !c.requiresComplianceReview);
  const statusInfo = currentStatus ? STATUS_MESSAGES[currentStatus] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
        isAnalyzing
          ? 'border-orange-300 bg-gradient-to-br from-orange-50/80 to-amber-50/80'
          : dragActive
          ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50 scale-[1.02] shadow-lg shadow-orange-100/50'
          : 'border-orange-200 bg-gradient-to-br from-white to-orange-50/30 hover:border-orange-300 hover:shadow-md'
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_STRING}
        className="hidden"
        onChange={handleFileInput}
        disabled={isAnalyzing}
      />

      <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
        <AnimatePresence mode="wait">
          {isAnalyzing && statusInfo ? (
            /* --- Analyzing state --- */
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                animate={currentStatus === 'extracting' || currentStatus === 'scoring'
                  ? { scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }
                  : {}
                }
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {currentStatus === 'completed' ? (
                  <CheckCircle className="w-12 h-12 text-green-500" />
                ) : currentStatus === 'failed' ? (
                  <AlertTriangle className="w-12 h-12 text-red-500" />
                ) : (
                  <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                )}
              </motion.div>
              <p className={`text-lg font-semibold ${statusInfo.color}`}>
                {statusInfo.message}
              </p>
              {currentStatus !== 'completed' && currentStatus !== 'failed' && (
                <div className="w-64 h-2 bg-orange-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{
                      width: currentStatus === 'uploading' ? '30%'
                        : currentStatus === 'extracting' ? '60%'
                        : currentStatus === 'scoring' ? '85%'
                        : '100%',
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              )}
            </motion.div>
          ) : showTypeSelector ? (
            /* --- Document Type Selection --- */
            <motion.div
              key="type-selector"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl"
            >
              <button
                onClick={() => { setShowTypeSelector(false); setDocumentType(''); }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                What type of document is this?
              </h3>

              {/* Deal documents */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full" />
                  Deal Documents (compliance review)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {dealDocs.map(doc => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => { setDocumentType(doc.id); inputRef.current?.click(); }}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        documentType === doc.id
                          ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                      }`}
                    >
                      <span className="font-medium text-sm">{doc.label}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Other documents */}
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
                      onClick={() => { setDocumentType(doc.id); inputRef.current?.click(); }}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        documentType === doc.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-xs">{doc.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            /* --- Idle state (default) --- */
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3 cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              <motion.div
                className="p-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {dragActive ? (
                  <FileImage className="w-10 h-10 text-orange-600" />
                ) : (
                  <FileUp className="w-10 h-10 text-orange-600" />
                )}
              </motion.div>

              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {dragActive ? 'Drop it right here' : 'Drop or upload any deal document'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Contracts, DM screenshots, emails, offer letters — we&apos;ll handle the rest
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-orange-200/50 hover:shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Analyze Deal
                </button>

                {onNonDealUpload && (
                  <button
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTypeSelector(true);
                    }}
                  >
                    Save Other Document
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-400">
                PDF, Word, images (JPEG, PNG, WebP) — Max 25MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
