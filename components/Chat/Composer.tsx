'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, X, FileText, Image, File, Mic, MicOff, AlertTriangle } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  preview?: string;
}

interface ComposerProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  disabled?: boolean;
  attachedFiles: UploadedFile[];
  onAddFile: (file: UploadedFile) => void;
  onRemoveFile: (fileId: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function Composer({
  inputValue,
  setInputValue,
  onSendMessage,
  disabled = false,
  attachedFiles,
  onAddFile,
  onRemoveFile,
  onFocus,
  onBlur
}: ComposerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const submitTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(inputValue + (inputValue ? ' ' : '') + transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [inputValue, setInputValue]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
    return File;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxSize = 50 * 1024 * 1024; // 50MB limit
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        setFileError(`File "${file.name}" is too large. Maximum size is 50MB.`);
        setTimeout(() => setFileError(null), 4000);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setFileError(`File type not supported. Please use PDF, Word, text, or images.`);
        setTimeout(() => setFileError(null), 4000);
        return;
      }

      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      onAddFile(uploadedFile);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    onRemoveFile(fileId);
  };

  const startVoiceRecording = () => {
    if (recognitionRef.current && speechSupported) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = () => {
    // Prevent duplicate submissions
    if (isSubmitting || disabled || isComposing) return;
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    // Debounce: prevent rapid re-submission
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    setIsSubmitting(true);
    onSendMessage();

    // Reset submission state after delay
    submitTimeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
      // Keep focus in composer after send
      textareaRef.current?.focus();
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't send during IME composition (for Japanese, Chinese, Korean input)
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* File Error Toast */}
      {fileError && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl shadow-lg">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-800">{fileError}</span>
            <button
              onClick={() => setFileError(null)}
              className="ml-2 p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {/* File Upload Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Attached Files Display */}
      {attachedFiles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachedFiles.map((file) => {
            const IconComponent = getFileIcon(file.type);
            return (
              <div key={file.id} className="flex items-center bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 max-w-xs">
                <IconComponent className="h-4 w-4 text-orange-600 mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-orange-900 truncate">{file.name}</p>
                  <p className="text-xs text-orange-600">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="ml-2 p-1 hover:bg-orange-100 rounded transition-colors"
                >
                  <X className="h-3 w-3 text-orange-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input with buttons horizontally inside - Splash page style */}
      <div className="relative">
        {/* Upload button - left corner */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all flex items-center justify-center z-10"
          aria-label="Attach file"
        >
          <Plus className="h-5 w-5" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Message ChatNIL..."
          disabled={disabled || isSubmitting}
          className="w-full resize-none rounded-2xl border border-gray-300 pl-12 pr-20 py-3.5 text-base leading-relaxed shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
          rows={1}
          style={{
            minHeight: '52px',
            maxHeight: '160px'
          }}
        />

        {/* Voice Recording Button - right side, before send */}
        {speechSupported && (
          <button
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`absolute right-12 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all flex items-center justify-center z-10 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg'
                : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'
            }`}
            aria-label={isRecording ? "Stop recording" : "Start voice input"}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Send Button - right corner */}
        <button
          onClick={handleSubmit}
          disabled={disabled || isSubmitting || isComposing || (!inputValue.trim() && attachedFiles.length === 0)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-40 text-white rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center z-10"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}