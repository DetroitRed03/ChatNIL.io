'use client';

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import ChatArea from '@/components/ChatArea';
import SignupRedirectHandler from '@/components/SignupRedirectHandler';
import AppShell from '@/components/Chat/AppShell';
import Sidebar from '@/components/Sidebar';
import SuggestionChips from '@/components/Chat/SuggestionChips';
import { MessageSquare, Send, Plus, X, FileText, Image, File, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import { UserRole } from '@/lib/types';
import { useChatHistoryStore } from '@/lib/chat-history-store';
import { useOnboardingGate } from '@/hooks/useOnboardingGate';

// File upload interface
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  preview?: string;
}

// Unified homepage component with consistent layout
function HomePage() {
  const { user, login, signup } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { createChatWithFirstMessage } = useChatHistoryStore();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login'
  });

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.error) {
      alert('Login failed: ' + result.error);
    } else {
      setAuthModal({ isOpen: false, mode: 'login' });
    }
  };

  const handleSignup = async (name: string, email: string, password: string, role: UserRole) => {
    const result = await signup({
      name,
      email,
      password,
      role,
      profileData: {}
    });
    if (result.error) {
      alert('Signup failed: ' + result.error);
    } else {
      setAuthModal({ isOpen: false, mode: 'signup' });
    }
  };

  const handleSendMessage = () => {
    if (!user) {
      setAuthModal({ isOpen: true, mode: 'login' });
      return;
    }
    // For authenticated users, create a new chat and navigate to it
    if (inputValue.trim() || attachedFiles.length > 0) {
      const chatId = createChatWithFirstMessage(inputValue.trim() || 'File attachment');
      setInputValue('');
      setAttachedFiles([]);
      // The layout will automatically show the chat interface since user is authenticated
      router.refresh(); // Refresh to show the new chat
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputFocus = () => {
    if (!inputValue.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
  };

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
    if (!user) {
      setAuthModal({ isOpen: true, mode: 'login' });
      return;
    }

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

      setAttachedFiles(prev => [...prev, uploadedFile]);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handlePlusClick = () => {
    if (!user) {
      setAuthModal({ isOpen: true, mode: 'login' });
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - always visible, non-expandable when not authenticated */}
      <Sidebar isNonAuth={!user} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {!user && (
          <header className="flex justify-end items-center p-4">
            <div className="flex gap-3">
              <button
                onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm hover:shadow-md"
              >
                Sign up for free
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl px-4">
            {!user && (
              <div className="text-center mb-8">
                <h1 className="text-4xl font-semibold text-gray-900 mb-4">ChatNIL</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Your comprehensive NIL compliance assistant. Get expert guidance on Name, Image, and Likeness rules,
                  contract negotiations, tax implications, and eligibility requirements for student-athletes.
                </p>
              </div>
            )}

            {/* Same input box used everywhere - matches chat interface */}
            <div className="relative">
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

              <input
                type="text"
                placeholder="Message ChatNIL..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="w-full pl-14 py-3 pr-14 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 placeholder-gray-500 shadow-lg hover:shadow-xl focus:shadow-xl transition-all"
                style={{
                  minHeight: '48px'
                }}
              />

              {/* File Upload Button */}
              <button
                onClick={handlePlusClick}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all flex items-center justify-center"
              >
                <Plus className="h-5 w-5" />
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() && attachedFiles.length === 0}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-sm hover:shadow-md disabled:shadow-none flex items-center justify-center"
              >
                <Send className="h-5 w-5" />
              </button>

              {/* Suggestion Chips */}
              <SuggestionChips
                show={showSuggestions}
                onSuggestionClick={handleSuggestionClick}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onSwitchMode={(mode) => setAuthModal({ isOpen: true, mode })}
      />
    </div>
  );
}

// Authenticated chat interface component
function ChatInterface() {
  const { isChecking, needsOnboarding, isReady } = useOnboardingGate();

  // Debug logging for onboarding state
  console.log('🏠 HomePage ChatInterface - Onboarding Status:', {
    isChecking,
    needsOnboarding,
    isReady
  });

  // Show loading state while checking onboarding status to prevent flash
  if (isChecking) {
    console.log('⏳ Showing onboarding check loading screen');
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Setting up your account</h3>
          <p className="text-sm text-gray-600">This will only take a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      {/* Handle signup redirects that were interrupted by Fast Refresh */}
      <SignupRedirectHandler />

      {/* Header */}
      <Header />

      {/* Main Chat Area - now flex-1 within AppShell */}
      <ChatArea />
    </AppShell>
  );
}

export default function Home() {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading ChatNIL</h3>
          <p className="text-sm text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  // Show unified homepage for non-authenticated users
  if (!user) {
    return <HomePage />;
  }

  // Show chat interface for authenticated users (with onboarding gate)
  return <ChatInterface />;
}