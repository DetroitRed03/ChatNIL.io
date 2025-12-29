'use client';

import { MessageSquare } from 'lucide-react';
import { useChatStore } from '@/lib/stores/chat';
import { useChatHistoryStore } from '@/lib/chat-history-store';
import { streamCompletion } from '@/lib/streaming';
import { supabase } from '@/lib/supabase';
import MessageList from './Chat/MessageList';
import Composer from './Chat/Composer';
import SuggestionChips from './Chat/SuggestionChips';

export default function ChatArea() {
  // Chat history store for multi-chat functionality
  const {
    getActiveChat,
    addMessageToChat,
    updateChatMessage,
    activeChatId,
    newChat,
    createChatWithFirstMessage,
    getDraft,
    setDraft: setHistoryDraft
  } = useChatHistoryStore();

  // Legacy chat store for UI state (keeping some for backward compatibility)
  const {
    attachedFiles,
    addAttachedFile,
    removeAttachedFile,
    updateAttachedFile,
    clearAttachedFiles,
    streamingState,
    setStreamingState,
    currentStreamingMessageId,
    // Legacy state for backward compatibility
    isTyping,
    setIsTyping,
    isAnimatingResponse,
    setIsAnimatingResponse,
    typingText,
    setTypingText,
    typingStatus,
    setTypingStatus,
    showSuggestions,
    setShowSuggestions,
    canAutoScroll,
    setCanAutoScroll
  } = useChatStore();

  // Use the new draft system
  const draft = getDraft();
  const setDraft = setHistoryDraft;

  // Get the active chat and its messages
  const activeChat = getActiveChat();
  const messages = activeChat?.messages || [];

  // Helper to get auth token
  const getAuthToken = async (): Promise<string | undefined> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  };

  // Process attached files by uploading to server for text extraction
  const processAttachedFiles = async (files: typeof attachedFiles): Promise<string[]> => {
    const authToken = await getAuthToken();
    if (!authToken) {
      console.warn('No auth token - files will not be processed for AI');
      return [];
    }

    const documentIds: string[] = [];
    const supportedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/plain',
    ];

    for (const file of files) {
      // Skip unsupported file types
      if (!supportedTypes.includes(file.type)) {
        continue;
      }

      try {
        // Update status to processing
        updateAttachedFile(file.id, { processingStatus: 'processing' });

        // Upload to server
        const formData = new FormData();
        formData.append('file', file.file);
        formData.append('source', 'chat_attachment');

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();

        if (result.success && result.documentId) {
          documentIds.push(result.documentId);
          updateAttachedFile(file.id, {
            processingStatus: 'ready',
            documentId: result.documentId,
          });
          console.log(`✅ Processed attachment: ${file.name} → ${result.documentId}`);
        } else {
          throw new Error(result.error || 'Processing failed');
        }
      } catch (error: any) {
        console.error(`❌ Failed to process ${file.name}:`, error);
        updateAttachedFile(file.id, {
          processingStatus: 'failed',
          processingError: error.message,
        });
      }
    }

    return documentIds;
  };

  const handleSendMessage = async () => {
    if (!draft.trim() && attachedFiles.length === 0) return;
    if (streamingState === 'streaming' || streamingState === 'submitting' || streamingState === 'processing_attachments') return;

    let chatId = activeChatId;

    // Process attached files first (extract text, generate embeddings)
    let documentIds: string[] = [];
    if (attachedFiles.length > 0) {
      setStreamingState('processing_attachments');
      documentIds = await processAttachedFiles(attachedFiles);
    }

    // If no active chat, create one with the first message (ChatGPT-style)
    if (!activeChatId) {
      chatId = createChatWithFirstMessage(draft);
    } else {
      // Add message to existing chat
      // Transform attachedFiles from UploadedFile to the format expected by chat-history-store
      const transformedAttachments = attachedFiles.length > 0
        ? attachedFiles.map(file => ({
            type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
            url: file.preview || '',
            name: file.name,
            mimeType: file.type,
            documentId: file.documentId, // Include the server document ID
          }))
        : undefined;
      const newMessage = {
        id: Date.now().toString(),
        content: draft,
        role: 'user' as const,
        timestamp: new Date(),
        attachments: transformedAttachments,
        documentIds, // Include document IDs for the AI to fetch
      };
      addMessageToChat(activeChatId, newMessage);
    }

    setDraft('');
    clearAttachedFiles();
    setStreamingState('submitting');

    // Create assistant message for streaming
    const aiResponse = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant' as const,
      timestamp: new Date(),
      isStreaming: true,
    };
    addMessageToChat(chatId!, aiResponse);

    try {
      await streamCompletion({
        messageId: aiResponse.id,
        onStatus: (status, message) => {
          // Update typing status for UI feedback
          console.log('📊 Status update:', status, message);
          setTypingStatus(message);
        },
        onSources: (sources) => {
          // Sources are automatically stored in message by streaming.ts
          console.log('📚 Sources received:', sources);
        },
        onError: (error) => {
          console.error('Streaming error:', error);
          updateChatMessage(chatId!, aiResponse.id, {
            content: 'Sorry, I encountered an error. Please try again.',
            isStreaming: false
          });
          setStreamingState('error');
          setTypingStatus(''); // Clear status on error
        },
        onComplete: () => {
          setStreamingState('complete');
          setTypingStatus(''); // Clear status when complete
        }
      });
    } catch (error) {
      console.error('Failed to start streaming:', error);
      updateChatMessage(chatId!, aiResponse.id, {
        content: 'Sorry, I encountered an error. Please try again.',
        isStreaming: false
      });
      setStreamingState('error');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setDraft(suggestion);
    setShowSuggestions(false);
  };

  const DisclaimerText = () => (
    <p className="text-xs text-gray-500 text-center mt-3 sm:mt-4 px-2">
      ChatNIL can make mistakes. Consider checking important information.
    </p>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white overflow-hidden">
      {messages.length === 0 ? (
        /* EMPTY STATE - ChatGPT Style */
        <div className="flex-1 flex flex-col items-center px-4 sm:px-6 pt-8 sm:pt-12">
          {/* Main Welcome Section */}
          <div className="text-center max-w-4xl mb-6 sm:mb-8" style={{ marginTop: 'max(8vh, 1.5rem)' }}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-xl">
              <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Hello! How can I help you with NIL today?
            </h1>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-6 sm:mb-8">
              I'm ChatNIL, your specialized assistant for Name, Image, and Likeness (NIL) guidance. I can help you navigate NIL compliance, understand regulations, explore opportunities, review contracts, and build your personal brand as a student-athlete.
            </p>
          </div>

          {/* Centered Input Field */}
          <div className="w-full max-w-4xl mt-4 relative">
            <Composer
              inputValue={draft}
              setInputValue={setDraft}
              onSendMessage={handleSendMessage}
              disabled={streamingState === 'streaming' || streamingState === 'submitting' || streamingState === 'processing_attachments'}
              attachedFiles={attachedFiles}
              onAddFile={addAttachedFile}
              onRemoveFile={removeAttachedFile}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            <SuggestionChips
              show={showSuggestions && draft === ''}
              onSuggestionClick={handleSuggestionClick}
            />
            <DisclaimerText />
          </div>
        </div>
      ) : (
        /* CHAT STATE - Standard Flow */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Container */}
          <MessageList
            messages={messages}
            isTyping={isTyping}
            typingText={typingText}
            typingStatus={typingStatus}
            isAnimatingResponse={isAnimatingResponse}
            canAutoScroll={canAutoScroll}
            setCanAutoScroll={setCanAutoScroll}
          />

          {/* Bottom Fixed Input Area - Sticky */}
          <div className="border-t border-gray-100 bg-white px-3 sm:px-4 py-4 sm:py-6 pb-safe flex-shrink-0"
               style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
            <div className="max-w-4xl mx-auto relative">
              <Composer
                inputValue={draft}
                setInputValue={setDraft}
                onSendMessage={handleSendMessage}
                disabled={streamingState === 'streaming' || streamingState === 'submitting' || streamingState === 'processing_attachments'}
                attachedFiles={attachedFiles}
                onAddFile={addAttachedFile}
                onRemoveFile={removeAttachedFile}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              />
              <SuggestionChips
                show={showSuggestions && draft === ''}
                onSuggestionClick={handleSuggestionClick}
              />
              <DisclaimerText />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}