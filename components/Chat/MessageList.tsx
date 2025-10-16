'use client';

import { useRef, useEffect } from 'react';
import { User, Bot, FileText, Image, File } from 'lucide-react';
import MessageFeedback from './MessageFeedback';
import { useAuth } from '@/contexts/AuthContext';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  preview?: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: UploadedFile[];
  isStreaming?: boolean;
}

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  typingText: string;
  isAnimatingResponse: boolean;
  canAutoScroll?: boolean;
  setCanAutoScroll?: (canScroll: boolean) => void;
}

export default function MessageList({
  messages,
  isTyping,
  typingText,
  isAnimatingResponse,
  canAutoScroll = true,
  setCanAutoScroll
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    if (messagesEndRef.current && scrollContainerRef.current && !isUserScrollingRef.current) {
      // Use scrollTop for immediate, reliable scrolling
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  const checkScrollPosition = () => {
    if (!scrollContainerRef.current || !setCanAutoScroll) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // More lenient threshold - within 150px of bottom (accounts for last message height)
    const shouldAutoScroll = distanceFromBottom <= 150;

    setCanAutoScroll(shouldAutoScroll);
  };

  const handleScroll = () => {
    // Mark that user is actively scrolling
    isUserScrollingRef.current = true;

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Check scroll position
    checkScrollPosition();

    // After 150ms of no scrolling, mark user as not scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 150);
  };

  // Auto-scroll to bottom when new messages arrive, but only if user is already near bottom
  useEffect(() => {
    if (canAutoScroll && messages.length > 0) {
      // Small delay to ensure DOM is updated
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages.length, canAutoScroll]); // Only trigger on new messages, not content changes

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

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

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto min-h-0"
      onScroll={handleScroll}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y'
      }}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="space-y-6 sm:space-y-8">
          {messages.map((message) => (
            <div key={message.id} className="group">
              {message.role === 'user' ? (
                /* User Message - Full Width with Background */
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-orange-500 flex items-center justify-center shadow-sm flex-shrink-0">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-orange-900 text-sm mb-1">You</div>

                      {/* Message Content */}
                      {message.content && (
                        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap text-sm sm:text-base mb-2">{message.content}</p>
                      )}

                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-2 space-y-2">
                          {message.attachments.map((file) => {
                            const IconComponent = getFileIcon(file.type);
                            return (
                              <div key={file.id} className="flex items-center bg-white border border-orange-200 rounded-lg px-3 py-2 max-w-sm">
                                <IconComponent className="h-4 w-4 text-orange-600 mr-3 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <p className="text-xs text-orange-600 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* AI Message - Clean, No Background */
                <div className="py-2">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm flex-shrink-0">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm mb-2">ChatNIL</div>
                      <div className="prose prose-sm sm:prose-base max-w-none">
                        <p className={`text-gray-900 leading-relaxed whitespace-pre-wrap m-0 transition-opacity duration-300 ${
                          message.content || message.isStreaming ? 'opacity-100' : 'opacity-100'
                        }`}>
                          {message.content}
                          {message.isStreaming && (
                            <span className="inline-block w-2 h-5 bg-gray-400 ml-1 animate-pulse"></span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {!message.isStreaming && message.content && (
                          <MessageFeedback
                            messageId={message.id}
                            userId={user?.id}
                            userRole={user?.role}
                            sessionId={`chat-${Date.now()}`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="group py-2">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm mb-2">ChatNIL</div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Small bottom padding instead of large spacer */}
        <div className="h-4" />
      </div>
      <div ref={messagesEndRef} />

      {/* "New messages ↓" pill */}
      {!canAutoScroll && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={scrollToBottom}
            className="bg-white border border-gray-200 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-shadow flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <span>New messages</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}