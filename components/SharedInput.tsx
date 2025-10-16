'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, X, FileText, Image, File, Mic, MicOff } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  preview?: string;
}

interface SharedInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  placeholder?: string;
  disabled?: boolean;
  attachedFiles: UploadedFile[];
  onAddFile: (file: UploadedFile) => void;
  onRemoveFile: (fileId: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  mode?: 'chat' | 'library';
  className?: string;
}

export default function SharedInput({
  inputValue,
  setInputValue,
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
  attachedFiles,
  onAddFile,
  onRemoveFile,
  onFocus,
  onBlur,
  mode = 'chat',
  className = ''
}: SharedInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

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
        alert(`File "${file.name}" is too large. Maximum size is 50MB.`);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        alert(`File type "${file.type}" is not supported.`);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  // Different styles based on mode
  const isLibraryMode = mode === 'library';

  const inputStyles = isLibraryMode
    ? "flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-full bg-gray-50 hover:bg-gray-200 transition-colors"
    : `w-full pl-14 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 placeholder-gray-500 shadow-lg hover:shadow-xl focus:shadow-xl transition-all text-sm ${
        speechSupported ? 'pr-28' : 'pr-14'
      }`;

  return (
    <div className={`relative ${className}`}>
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

      {/* Input Container */}
      {isLibraryMode ? (
        // Library mode - horizontal layout
        <div className={inputStyles}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
          >
            <Plus className="w-5 h-5 text-gray-400" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
          />
          <button
            onClick={onSendMessage}
            disabled={disabled || (!inputValue.trim() && attachedFiles.length === 0)}
            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-gray-400" />
          </button>
          {speechSupported && (
            <button
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`p-1.5 rounded-full transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'hover:bg-gray-200 text-gray-400'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      ) : (
        // Chat mode - textarea layout (existing Composer style)
        <>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={inputStyles}
            rows={1}
            style={{
              minHeight: '48px',
              maxHeight: '160px',
              lineHeight: '1.5'
            }}
          />

          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-3 bottom-3 w-9 h-9 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all flex items-center justify-center"
          >
            <Plus className="h-5 w-5" />
          </button>

          {/* Voice Recording Button */}
          {speechSupported && (
            <button
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`absolute right-16 bottom-3 w-9 h-9 rounded-xl transition-all flex items-center justify-center ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg'
                  : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'
              }`}
            >
              {isRecording ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Send Button */}
          <button
            onClick={onSendMessage}
            disabled={disabled || (!inputValue.trim() && attachedFiles.length === 0)}
            className="absolute right-3 bottom-3 w-9 h-9 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-sm hover:shadow-md disabled:shadow-none flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}

export type { UploadedFile };