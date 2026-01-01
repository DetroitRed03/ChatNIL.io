'use client';

import { useAuth } from '@/contexts/AuthContext';
import SignupRedirectHandler from '@/components/SignupRedirectHandler';
import { Sparkles, Lightbulb, Shield, TrendingUp, MessageSquare, Loader2, Square, Search, Brain, Newspaper, BookOpen } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOnboardingGate } from '@/hooks/useOnboardingGate';
import { useChatHistoryStore } from '@/lib/chat-history-store';
import { useChatSync } from '@/hooks/useChatSync';
import MessageList from '@/components/Chat/MessageList';
import Composer from '@/components/Chat/Composer';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  preview?: string;
}

// Suggested prompts for the welcome screen
const EXAMPLE_PROMPTS = [
  "Explain NIL compliance rules for college athletes",
  "How do I evaluate a brand deal offer?",
  "What are the tax implications of NIL income?",
  "Help me understand NCAA eligibility requirements"
];

const CAPABILITIES = [
  {
    icon: Shield,
    title: "Compliance Guidance",
    description: "Get expert advice on NIL regulations and NCAA rules"
  },
  {
    icon: TrendingUp,
    title: "Deal Evaluation",
    description: "Analyze brand partnerships and sponsorship opportunities"
  },
  {
    icon: Lightbulb,
    title: "Educational Resources",
    description: "Learn about contracts, taxes, and legal requirements"
  },
  {
    icon: Sparkles,
    title: "Personalized Support",
    description: "Tailored guidance for athletes, parents, and coaches"
  }
];

// Types for streaming events from API
interface StreamingStatus {
  type: 'status';
  status: 'thinking' | 'searching_knowledge' | 'searching_memory' | 'searching_news' | 'generating';
  message: string;
}

interface StreamingSources {
  type: 'sources';
  sources: {
    knowledge: { title: string; category: string }[];
    memories: { content: string; type: string }[];
    documents: { fileName: string; documentType: string }[];
    hasRealTimeData: boolean;
  };
}

// Status indicator component
function StatusIndicator({ status, message }: { status: string; message: string }) {
  const getIcon = () => {
    switch (status) {
      case 'thinking':
        return <Brain className="w-4 h-4 animate-pulse" />;
      case 'searching_knowledge':
        return <BookOpen className="w-4 h-4 animate-pulse" />;
      case 'searching_memory':
        return <Search className="w-4 h-4 animate-pulse" />;
      case 'searching_news':
        return <Newspaper className="w-4 h-4 animate-pulse" />;
      case 'generating':
        return <Sparkles className="w-4 h-4 animate-pulse" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 animate-in fade-in duration-200">
      {getIcon()}
      <span>{message}</span>
    </div>
  );
}

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { isChecking, needsOnboarding, isReady } = useOnboardingGate();
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ status: string; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize chat sync hook - CRITICAL for chat persistence
  useChatSync();

  const {
    activeChatId,
    getActiveChat,
    createChatWithFirstMessage,
    addMessageToChat,
    getDraft,
    setDraft
  } = useChatHistoryStore();

  const activeChat = getActiveChat();
  const hasMessages = activeChat && activeChat.messages.length > 0;

  // Redirect unauthenticated users to homepage
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  // Handle initial message from query params
  useEffect(() => {
    const initialMessage = searchParams?.get('initialMessage');
    if (initialMessage && !activeChatId) {
      setInputValue(decodeURIComponent(initialMessage));
    }
  }, [searchParams, activeChatId]);

  // Load draft when active chat changes
  useEffect(() => {
    const draft = getDraft();
    setInputValue(draft);
  }, [activeChatId, getDraft]);

  // Show loading state while checking auth or onboarding
  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">Loading AI Coach</h3>
          <p className="text-sm text-text-secondary">Please wait...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    const messageContent = inputValue.trim();
    const userMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const assistantMessageId = `msg_${Date.now() + 1}_ai_${Math.random().toString(36).substr(2, 9)}`;

    // OPTIMISTIC UI: Clear input and draft immediately for better UX
    setInputValue('');
    setDraft('');
    const currentAttachments = [...attachedFiles];
    setAttachedFiles([]);

    let currentChatId = activeChatId;

    // If no active chat, create one with this first message
    if (!activeChatId) {
      currentChatId = createChatWithFirstMessage(messageContent, 'athlete');
    } else {
      // OPTIMISTIC UI: Add user message immediately
      const messageAttachments = currentAttachments.map(f => ({
        type: f.type.startsWith('image/') ? 'image' as const : 'file' as const,
        url: f.preview || URL.createObjectURL(f.file),
        name: f.name,
        mimeType: f.type
      }));
      const userMessage = {
        id: userMessageId,
        content: messageContent,
        role: 'user' as const,
        timestamp: new Date(),
        attachments: messageAttachments
      };
      addMessageToChat(activeChatId, userMessage);
    }

    // OPTIMISTIC UI: Create assistant placeholder immediately with isStreaming: true
    const assistantPlaceholder = {
      id: assistantMessageId,
      content: '',
      role: 'assistant' as const,
      timestamp: new Date(),
      isStreaming: true
    };

    if (currentChatId) {
      addMessageToChat(currentChatId, assistantPlaceholder);
    }
    setIsTyping(true);
    setErrorMessage(null);
    setStatusMessage(null);

    // Create AbortController for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Build messages array for API
      const chatHistory = activeChat?.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })) || [];

      const messages = [
        ...chatHistory,
        { role: 'user' as const, content: messageContent }
      ];

      // Call the AI API with streaming
      const response = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          userRole: user?.role || 'athlete',
          userId: user?.id
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let capturedSources: StreamingSources['sources'] | null = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);

                // Handle status events
                if (parsed.type === 'status') {
                  setStatusMessage({ status: parsed.status, message: parsed.message });
                  continue;
                }

                // Handle sources events
                if (parsed.type === 'sources') {
                  capturedSources = parsed.sources;
                  continue;
                }

                // Support both 'token' and 'content'
                const contentChunk = parsed.token || parsed.content;

                if (contentChunk) {
                  // Clear status when we start getting content
                  if (accumulatedContent === '') {
                    setStatusMessage(null);
                  }
                  accumulatedContent += contentChunk;

                  // Update the message with accumulated content
                  const { updateChatMessage, activeChatId: storeActiveChatId } = useChatHistoryStore.getState();
                  const chatIdToUpdate = storeActiveChatId || currentChatId;
                  if (chatIdToUpdate) {
                    updateChatMessage(chatIdToUpdate, assistantMessageId, {
                      content: accumulatedContent,
                      isStreaming: true
                    });
                  }
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', data);
                setErrorMessage('Connection error. Please try again.');
                const { updateChatMessage, activeChatId: storeActiveChatId } = useChatHistoryStore.getState();
                const chatIdToUpdate = storeActiveChatId || currentChatId;
                if (chatIdToUpdate) {
                  updateChatMessage(chatIdToUpdate, assistantMessageId, {
                    content: 'Error: Failed to receive response. Please retry.',
                    isStreaming: false
                  });
                }
                break;
              }
            }
          }
        }
      }

      // Finalize the message
      const { updateChatMessage, activeChatId: finalChatId } = useChatHistoryStore.getState();
      const chatIdToUpdate = finalChatId || currentChatId;
      if (chatIdToUpdate) {
        updateChatMessage(chatIdToUpdate, assistantMessageId, {
          content: accumulatedContent,
          isStreaming: false,
          sources: capturedSources || undefined
        });
      }
      setIsTyping(false);
      setStatusMessage(null);
      abortControllerRef.current = null;

      // Save AI response to database for UUID sessions only
      const dbChatId = chatIdToUpdate;
      const isUUID = dbChatId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dbChatId) : false;
      if (user?.id && dbChatId && accumulatedContent && isUUID) {
        try {
          const response = await fetch('/api/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              session_id: dbChatId,
              content: accumulatedContent,
              role: 'assistant',
              metadata: capturedSources ? { sources: capturedSources } : undefined
            })
          });

          if (!response.ok) {
            console.error('Failed to save AI response:', await response.text());
          }
        } catch (err) {
          console.error('Failed to persist AI message:', err);
        }
      }

    } catch (error: any) {
      const { updateChatMessage, activeChatId: errorChatId } = useChatHistoryStore.getState();
      const chatIdToUpdate = errorChatId || currentChatId;

      if (error.name === 'AbortError') {
        // Keep partial content on stop
        if (chatIdToUpdate) {
          updateChatMessage(chatIdToUpdate, assistantMessageId, {
            isStreaming: false
          });
        }
      } else {
        console.error('AI API error:', error);
        setErrorMessage('Failed to get response. Please try again.');
        setLastFailedPrompt(messageContent);
        if (chatIdToUpdate) {
          updateChatMessage(chatIdToUpdate, assistantMessageId, {
            content: 'Error: Could not generate response. Please try again.',
            isStreaming: false
          });
        }
      }
      setIsTyping(false);
      setStatusMessage(null);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRetry = () => {
    if (lastFailedPrompt) {
      setInputValue(lastFailedPrompt);
      setDraft(lastFailedPrompt);
      setErrorMessage(null);
      setLastFailedPrompt('');
    }
  };

  const handleAddFile = (file: UploadedFile) => {
    setAttachedFiles(prev => [...prev, file]);
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    setDraft(prompt);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setDraft(value);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Handle signup redirects that were interrupted by Fast Refresh */}
      <SignupRedirectHandler />

      {/* Show welcome screen if no messages yet */}
      {!hasMessages ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
          <div className="w-full max-w-3xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-9 w-9 text-white" />
                </div>
                <h1 className="text-5xl font-bold text-text-primary">ChatNIL</h1>
              </div>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                Your AI-Powered NIL Companion
              </p>
              <p className="text-base text-text-tertiary max-w-xl mx-auto mt-3 mb-8">
                Get expert guidance on Name, Image, and Likeness rules, contract negotiations, tax implications, and eligibility requirements.
              </p>

              {/* Composer (centered on welcome screen) */}
              <div className="max-w-2xl mx-auto">
                <Composer
                  inputValue={inputValue}
                  setInputValue={handleInputChange}
                  onSendMessage={handleSendMessage}
                  disabled={isTyping}
                  attachedFiles={attachedFiles}
                  onAddFile={handleAddFile}
                  onRemoveFile={handleRemoveFile}
                />
              </div>
            </div>

            {/* Example Prompts */}
            <div className="mb-12">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide mb-4 text-center">
                Try asking about
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXAMPLE_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handlePromptClick(prompt)}
                    className="group px-4 py-3 text-left border border-border rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-sm text-text-secondary hover:text-primary-600 bg-background-card"
                  >
                    <span className="block">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide mb-6 text-center">
                What ChatNIL can do
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CAPABILITIES.map((capability, index) => {
                  const Icon = capability.icon;
                  return (
                    <div
                      key={index}
                      className="p-5 border border-border rounded-xl bg-background-card hover:border-primary-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-text-primary mb-1">
                            {capability.title}
                          </h4>
                          <p className="text-sm text-text-tertiary">
                            {capability.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Message List - scrollable area */}
          <div className="flex-1 overflow-y-auto">
            <MessageList
              messages={activeChat?.messages || []}
              isTyping={isTyping}
              typingText={typingText}
              typingStatus={statusMessage?.message}
              isAnimatingResponse={false}
            />
          </div>
          {/* Composer - fixed at bottom, always visible */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white">
            {/* Error message with Retry button */}
            {errorMessage && (
              <div className="bg-red-50 border-b border-red-200">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-800">{errorMessage}</span>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="px-3 py-1.5 text-sm font-medium text-red-700 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Status indicator and Stop button during streaming */}
            {isTyping && (
              <div className="bg-orange-50 border-b border-orange-200">
                <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
                  {/* Status indicator */}
                  <div className="flex-1">
                    {statusMessage && (
                      <StatusIndicator status={statusMessage.status} message={statusMessage.message} />
                    )}
                  </div>
                  {/* Stop button */}
                  <button
                    onClick={handleStopStreaming}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-300 text-orange-700 hover:bg-orange-100 rounded-lg transition-colors font-medium text-sm flex-shrink-0"
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </button>
                </div>
              </div>
            )}

            {/* Centered composer container */}
            <div className="max-w-3xl mx-auto px-4 py-3">
              <Composer
                inputValue={inputValue}
                setInputValue={handleInputChange}
                onSendMessage={handleSendMessage}
                disabled={isTyping}
                attachedFiles={attachedFiles}
                onAddFile={handleAddFile}
                onRemoveFile={handleRemoveFile}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
