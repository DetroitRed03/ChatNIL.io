'use client';

import { useRef, useEffect, useState } from 'react';
import { User, Bot, FileText, Image, File, Edit2, Trash2, Check, X, RefreshCw, AlertTriangle, BookOpen, Brain, FileCheck, Globe } from 'lucide-react';
import MessageFeedback from './MessageFeedback';
import { useAuth } from '@/contexts/AuthContext';
import { useChatHistoryStore, type MessageSources } from '@/lib/chat-history-store';

// Simplified attachment type compatible with chat-history-store
interface MessageAttachment {
  type: 'image' | 'file';
  url: string;
  name?: string;
  mimeType?: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: MessageAttachment[];
  isStreaming?: boolean;
  sources?: MessageSources;
}

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  typingText: string;
  typingStatus?: string; // Status message to show (e.g., "Searching knowledge base...")
  isAnimatingResponse: boolean;
  canAutoScroll?: boolean;
  setCanAutoScroll?: (canScroll: boolean) => void;
  onRegenerateMessage?: (messageId: string) => void;
}

// Helper function to safely format timestamps
const formatTimestamp = (timestamp: Date | string | undefined): string => {
  if (!timestamp) return '';
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Component to display message sources with numbered references matching [1], [2], etc. in the text
function SourcesDisplay({ sources }: { sources: MessageSources }) {
  const hasKnowledge = sources.knowledge && sources.knowledge.length > 0;
  const hasDocuments = sources.documents && sources.documents.length > 0;
  const hasRealTime = sources.hasRealTimeData;

  // Only show sources when we have meaningful external sources
  // Personal memories are noise — they show as "Personal Memory" which confuses users
  if (!hasKnowledge && !hasDocuments && !hasRealTime) {
    return null;
  }

  // Combine all sources into a numbered list for citations
  const allSources: { title: string; category: string; type: 'knowledge' | 'memory' | 'document' | 'realtime' }[] = [];

  if (hasKnowledge) {
    sources.knowledge.forEach(source => {
      allSources.push({ title: source.title, category: source.category, type: 'knowledge' });
    });
  }
  if (hasDocuments) {
    sources.documents.forEach(doc => {
      allSources.push({ title: doc.fileName, category: doc.documentType || 'Document', type: 'document' });
    });
  }
  // Memories are intentionally excluded from the Sources UI
  // They showed as "Personal Memory" tags which confused users during regular conversation
  if (hasRealTime) {
    allSources.push({ title: 'Live web search results', category: 'Real-time', type: 'realtime' });
  }

  const getSourceStyle = (type: string) => {
    switch (type) {
      case 'knowledge':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'document':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'memory':
        return 'bg-violet-50 text-violet-800 border-violet-200';
      case 'realtime':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getNumberStyle = (type: string) => {
    switch (type) {
      case 'knowledge':
        return 'bg-blue-600 text-white';
      case 'document':
        return 'bg-emerald-600 text-white';
      case 'memory':
        return 'bg-violet-600 text-white';
      case 'realtime':
        return 'bg-orange-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <div className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-200">
          <BookOpen className="h-4 w-4 text-gray-500" />
        </div>
        <span className="font-semibold">Sources Used</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {allSources.map((source, idx) => (
          <div
            key={`source-${idx}`}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-sm border ${getSourceStyle(source.type)}`}
          >
            <span>{source.title}</span>
            <span className="text-xs opacity-60">({source.category})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MessageList({
  messages,
  isTyping,
  typingText,
  typingStatus,
  isAnimatingResponse,
  canAutoScroll = true,
  setCanAutoScroll,
  onRegenerateMessage
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Message editing state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { activeChatId, editMessage, deleteMessage } = useChatHistoryStore();

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingMessageId]);

  const handleStartEdit = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditingContent(currentContent);
  };

  const handleSaveEdit = async () => {
    if (editingMessageId && editingContent.trim() && activeChatId) {
      try {
        await editMessage(activeChatId, editingMessageId, editingContent.trim());
        setEditingMessageId(null);
        setEditingContent('');
      } catch (error) {
        console.error('Failed to edit message:', error);
        setToastMessage('Failed to edit message. Please try again.');
        setTimeout(() => setToastMessage(null), 4000);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeChatId) return;

    const confirmed = window.confirm('Are you sure you want to delete this message?');
    if (!confirmed) return;

    try {
      await deleteMessage(activeChatId, messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
      setToastMessage('Failed to delete message. Please try again.');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleRegenerateMessage = (messageId: string) => {
    if (onRegenerateMessage) {
      onRegenerateMessage(messageId);
    }
  };

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

    // ChatGPT-style threshold - within 64px of bottom
    const shouldAutoScroll = distanceFromBottom <= 64;

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

  // Auto-scroll to bottom when new messages arrive OR during streaming updates
  useEffect(() => {
    if (canAutoScroll) {
      // Use double requestAnimationFrame for smoother scroll during streaming
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      });
    }
  }, [messages, canAutoScroll]); // Trigger on messages array changes (including content updates during streaming)

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

  const getFileIcon = (attachmentType: 'image' | 'file', mimeType?: string) => {
    if (attachmentType === 'image') return Image;
    if (mimeType && (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text'))) return FileText;
    return File;
  };

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto min-h-0 relative"
      onScroll={handleScroll}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y'
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl shadow-lg">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-800">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5 text-red-600" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="space-y-6 sm:space-y-8">
          {messages.map((message) => (
            <div key={message.id} className="group">
              {message.role === 'user' ? (
                /* User Message - Full Width with Background */
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 sm:p-6 relative">
                  {/* Action Buttons (show on hover) */}
                  {!editingMessageId && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => handleStartEdit(message.id, message.content)}
                        className="p-1.5 bg-white hover:bg-gray-100 rounded-lg shadow-sm border border-gray-200 transition-colors"
                        title="Edit message"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-1.5 bg-white hover:bg-red-50 rounded-lg shadow-sm border border-gray-200 transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-orange-500 flex items-center justify-center shadow-sm flex-shrink-0">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-orange-900 text-sm mb-1">You</div>

                      {/* Editing UI */}
                      {editingMessageId === message.id ? (
                        <div className="space-y-2">
                          <textarea
                            ref={editInputRef}
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.metaKey) handleSaveEdit();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="w-full px-3 py-2 text-sm border border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            >
                              <X className="h-3.5 w-3.5" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Message Content */}
                          {message.content && (
                            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap text-sm sm:text-base mb-2">{message.content}</p>
                          )}

                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mb-2 space-y-2">
                              {message.attachments.map((attachment, idx) => {
                                const IconComponent = getFileIcon(attachment.type, attachment.mimeType);
                                return (
                                  <div key={attachment.url || idx} className="flex items-center bg-white border border-orange-200 rounded-lg px-3 py-2 max-w-sm">
                                    <IconComponent className="h-4 w-4 text-orange-600 mr-3 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-gray-900 truncate">{attachment.name || 'Attachment'}</p>
                                      <p className="text-xs text-gray-600">{attachment.type === 'image' ? 'Image' : 'File'}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <p className="text-xs text-orange-600 mt-2">
                            {formatTimestamp(message.timestamp)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* AI Message - Clean, No Background */
                <div className="py-2" aria-live={message.isStreaming ? "polite" : "off"}>
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
                            <span className="inline-block w-2 h-5 bg-gray-400 ml-1 animate-pulse" aria-label="generating"></span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(message.timestamp)}
                        </p>
                        {!message.isStreaming && message.content && (
                          <>
                            <MessageFeedback
                              messageId={message.id}
                              userId={user?.id}
                              userRole={user?.role}
                              sessionId={`chat-${Date.now()}`}
                            />
                            {onRegenerateMessage && (
                              <button
                                onClick={() => handleRegenerateMessage(message.id)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="Regenerate response"
                              >
                                <RefreshCw className="h-3.5 w-3.5 text-gray-600" />
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Sources Display - Show after message completes */}
                      {!message.isStreaming && message.sources && (
                        <SourcesDisplay sources={message.sources} />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator - only show when no message is streaming yet */}
          {isTyping && !messages.some(m => m.isStreaming) && (
            <div className="group py-2">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm mb-2">ChatNIL</div>
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    {typingStatus && (
                      <span className="text-sm text-gray-500 animate-pulse">{typingStatus}</span>
                    )}
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