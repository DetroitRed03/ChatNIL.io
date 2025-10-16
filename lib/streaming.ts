import { useChatStore } from './chat-store';
import { useChatHistoryStore } from './chat-history-store';
import { supabase } from './supabase';

export interface StreamCompletionOptions {
  messageId: string;
  endpoint?: string;
  onToken?: (token: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

export async function streamCompletion(options: StreamCompletionOptions): Promise<void> {
  const {
    messageId,
    endpoint = '/api/chat',
    onToken,
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

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messagesToSend.map(msg => ({
          role: msg.role,
          content: msg.content,
          attachments: msg.attachments
        })),
        userId: user?.id,
        userRole: userProfile?.role
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

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;

          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              // Streaming complete
              historyStore.updateChatMessage(activeChat.id, messageId, {
                content: fullContent,
                isStreaming: false
              });
              store.setStreamingState('complete');
              store.setCurrentStreamingMessageId(null);
              onComplete?.(fullContent);
              return;
            }

            try {
              const parsed = JSON.parse(data);
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