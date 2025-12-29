import { useChatStore } from './chat-store';
import { useChatHistoryStore, type MessageSources, flushPendingSave } from './chat-history-store';
import { supabase } from './supabase';

export interface StreamCompletionOptions {
  messageId: string;
  endpoint?: string;
  onToken?: (token: string) => void;
  onSources?: (sources: MessageSources) => void;
  onStatus?: (status: string, message: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

export async function streamCompletion(options: StreamCompletionOptions): Promise<void> {
  const {
    messageId,
    endpoint = '/api/chat/ai',  // Use the real AI route with RAG and sources
    onToken,
    onSources,
    onStatus,
    onComplete,
    onError,
    signal
  } = options;

  const store = useChatStore.getState();
  const historyStore = useChatHistoryStore.getState();

  try {
    // Set streaming state
    store.setStreamingState('streaming');
    store.setCurrentStreamingMessageId(messageId);

    // Get active chat and update message streaming status
    const activeChat = historyStore.getActiveChat();
    if (!activeChat) {
      throw new Error('No active chat found');
    }

    // Mark the message as streaming in the chat history
    historyStore.updateChatMessage(activeChat.id, messageId, { isStreaming: true });

    // Filter messages to exclude empty streaming assistant messages
    const messagesToSend = activeChat.messages.filter(msg => {
      // Exclude assistant messages that are currently streaming or empty
      if (msg.role === 'assistant' && (msg.isStreaming || !msg.content.trim())) {
        return false;
      }
      return true;
    });

    // Get user information for analytics
    const { data: { user } } = await supabase.auth.getUser();
    let userProfile = null;

    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      userProfile = profile;
    }

    // Get the last user message to extract documentIds
    const lastUserMessage = messagesToSend.filter(m => m.role === 'user').pop();
    const documentIds = (lastUserMessage as any)?.documentIds || [];

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messagesToSend.map(msg => ({
          role: msg.role,
          content: msg.content,
          attachments: msg.attachments,
          documentIds: (msg as any).documentIds, // Include document IDs if present
        })),
        userId: user?.id,
        userRole: userProfile?.role,
        documentIds, // Top-level for easy access in the API route
      }),
      signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let messageSources: MessageSources | undefined;
    let sseBuffer = ''; // Buffer to accumulate incomplete SSE lines

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Accumulate chunks and split on double newlines (SSE message delimiter)
        sseBuffer += decoder.decode(value, { stream: true });
        const messages = sseBuffer.split('\n\n');

        // Keep the last potentially incomplete message in the buffer
        sseBuffer = messages.pop() || '';

        for (const message of messages) {
          const lines = message.split('\n');

          for (const line of lines) {
            if (line.trim() === '') continue;

            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                console.log('🏁 Streaming [DONE] - messageSources:', messageSources ? {
                  knowledge: messageSources.knowledge?.length || 0,
                  memories: messageSources.memories?.length || 0,
                  documents: messageSources.documents?.length || 0,
                  hasRealTimeData: messageSources.hasRealTimeData
                } : 'undefined');

                // Streaming complete - include sources in the final update
                historyStore.updateChatMessage(activeChat.id, messageId, {
                  content: fullContent,
                  isStreaming: false,
                  sources: messageSources
                });
                // Flush localStorage immediately to ensure sources are persisted
                flushPendingSave();

                // Sync message content and sources to database if we have a user
                if (user?.id) {
                  // Helper to check if ID is a database UUID
                  const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

                  // Function to save/update the assistant message with content and sources
                  const trySaveMessage = async (attempt: number = 1): Promise<void> => {
                    // Re-fetch the current active chat to get the updated session ID
                    const currentActiveChat = historyStore.getActiveChat();
                    const sessionId = currentActiveChat?.id || activeChat.id;

                    // If session ID is still local format and we haven't retried too much, wait and retry
                    // Increased to 8 attempts (4 seconds total) to handle slower DB syncs
                    if (!isUUID(sessionId) && attempt < 8) {
                      console.log(`⏳ Session ID still local format, retrying in 500ms (attempt ${attempt}/8)`);
                      await new Promise(resolve => setTimeout(resolve, 500));
                      return trySaveMessage(attempt + 1);
                    }

                    if (!isUUID(sessionId)) {
                      console.warn('⚠️ Could not get DB session ID after 8 retries, message not saved to DB');
                      return;
                    }

                    console.log('📤 Syncing assistant message to DB - sessionId:', sessionId);

                    // First try PATCH to update existing message with sources
                    const patchResponse = await fetch('/api/chat/messages', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: user.id,
                        messageId: messageId,
                        sessionId: sessionId,
                        sources: messageSources
                      })
                    });

                    if (patchResponse.ok) {
                      console.log('✅ Sources saved to DB via PATCH');
                      return;
                    }

                    // If PATCH fails (message doesn't exist), POST the full message
                    if (patchResponse.status === 404 && fullContent) {
                      console.log('📝 Message not found in DB, creating via POST...');
                      const postResponse = await fetch('/api/chat/messages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: user.id,
                          session_id: sessionId,
                          role: 'assistant',
                          content: fullContent,
                          metadata: messageSources ? { sources: messageSources } : undefined
                        })
                      });

                      if (postResponse.ok) {
                        console.log('✅ Assistant message created in DB with sources');
                      } else {
                        console.warn('⚠️ Failed to create message in DB:', postResponse.status);
                      }
                    } else {
                      console.warn('⚠️ Failed to save sources to DB:', patchResponse.status);
                    }
                  };

                  // Fire and forget - don't block on this
                  trySaveMessage().catch(err => console.warn('Failed to sync message to DB:', err));
                }

                store.setStreamingState('complete');
                store.setCurrentStreamingMessageId(null);
                onComplete?.(fullContent);
                return;
              }

              try {
                const parsed = JSON.parse(data);

                // Debug: Log all event types received
                if (parsed.type) {
                  console.log('📨 SSE Event received:', parsed.type, parsed.type === 'sources' ? JSON.stringify(parsed.sources).substring(0, 100) : '');
                }

                // Handle different event types from the server
                if (parsed.type === 'sources') {
                  // Sources event - store for later and call callback
                  console.log('✅ Sources event captured:', {
                    knowledge: parsed.sources?.knowledge?.length || 0,
                    memories: parsed.sources?.memories?.length || 0,
                    documents: parsed.sources?.documents?.length || 0,
                    hasRealTimeData: parsed.sources?.hasRealTimeData
                  });
                  messageSources = parsed.sources as MessageSources;
                  onSources?.(messageSources);
                  // Update message with sources immediately so they show during streaming
                  historyStore.updateChatMessage(activeChat.id, messageId, { sources: messageSources });
                  continue;
                }

                if (parsed.type === 'status') {
                  // Status event - call callback for UI updates
                  onStatus?.(parsed.status, parsed.message);
                  continue;
                }

                // Token event (default) - handle content streaming
                const token = parsed.choices?.[0]?.delta?.content || parsed.token || '';

                if (token) {
                  fullContent += token;

                  // Update the message with current content in chat history
                  historyStore.updateChatMessage(activeChat.id, messageId, { content: fullContent });

                  // Call token callback
                  onToken?.(token);

                  // Auto-scroll will be handled by MessageList useEffect watching messages array
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming data:', data);
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

  } catch (error) {
    console.error('Streaming error:', error);

    // Update state on error
    store.setStreamingState('error');
    store.setCurrentStreamingMessageId(null);

    // Update message in chat history if we have an active chat
    const activeChat = historyStore.getActiveChat();
    if (activeChat) {
      historyStore.updateChatMessage(activeChat.id, messageId, { isStreaming: false });
    }

    onError?.(error as Error);
  }
}

export function stopStreaming(): void {
  const store = useChatStore.getState();
  const historyStore = useChatHistoryStore.getState();
  const currentMessageId = store.currentStreamingMessageId;

  if (currentMessageId) {
    const activeChat = historyStore.getActiveChat();
    if (activeChat) {
      historyStore.updateChatMessage(activeChat.id, currentMessageId, { isStreaming: false });
    }
  }

  store.setStreamingState('complete');
  store.setCurrentStreamingMessageId(null);
}