'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, CheckCircle, AlertTriangle, Sparkles, FileImage, FileUp } from 'lucide-react';
import type { AnalysisStatus } from '@/lib/types/deal-analysis';

interface DealUploadZoneProps {
  onFileSelected: (file: File) => void;
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

export default function DealUploadZone({ onFileSelected, isAnalyzing, currentStatus }: DealUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (file && file.type.startsWith('image/')) {
      onFileSelected(file);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

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
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileInput}
        disabled={isAnalyzing}
      />

      <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
        <AnimatePresence mode="wait">
          {isAnalyzing && statusInfo ? (
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

              {/* Progress bar */}
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
          ) : (
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
                  Contracts, DM screenshots, emails, offer letters — we'll handle the rest
                </p>
              </div>

              <button
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-orange-200/50 hover:shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Choose File
              </button>

              <p className="text-xs text-gray-400">
                JPEG, PNG, WebP, or GIF — Max 10MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
