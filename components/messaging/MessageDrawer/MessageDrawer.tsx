'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useMessageDrawer } from '@/contexts/MessageDrawerContext';
import { useAuth } from '@/contexts/AuthContext';
import { DrawerHeader } from './DrawerHeader';
import { DrawerBody } from './DrawerBody';
import { DrawerComposer } from './DrawerComposer';

interface Message {
  id: string;
  content: string;
  message_text?: string; // API uses message_text, we normalize to content
  sender_id: string;
  created_at: string;
  status?: 'sending' | 'sent' | 'failed';
}

export function MessageDrawer() {
  const { isOpen, recipient, threadId, closeDrawer, setThreadId } = useMessageDrawer();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeDrawer]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fetch or create thread when drawer opens
  const fetchOrCreateThread = useCallback(async () => {
    if (!recipient || !user?.id) return;

    setIsLoading(true);
    setError(null);
    setMessages([]);

    try {
      // Try to create/get thread with this recipient
      const response = await fetch('/api/agency/messages/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id,
        },
        credentials: 'include',
        body: JSON.stringify({ athlete_user_id: recipient.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await response.json();
      const newThreadId = data.thread?.id;

      if (newThreadId) {
        setThreadId(newThreadId);

        // Fetch messages for this thread
        const messagesResponse = await fetch(
          `/api/agency/messages/threads/${newThreadId}`,
          {
            headers: { 'X-User-ID': user.id },
            credentials: 'include',
          }
        );

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          // Normalize message_text to content for consistent usage
          const normalizedMessages = (messagesData.messages || []).map((msg: Record<string, unknown>) => ({
            ...msg,
            content: msg.message_text || msg.content || '',
          }));
          setMessages(normalizedMessages);
        }
      }
    } catch (err) {
      console.error('Error fetching thread:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, [recipient, user?.id, setThreadId]);

  // Fetch thread when drawer opens with recipient
  useEffect(() => {
    if (isOpen && recipient && user?.id) {
      fetchOrCreateThread();
    }
  }, [isOpen, recipient, user?.id, fetchOrCreateThread]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSend = async (content: string) => {
    if (!threadId || !user?.id) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content,
      sender_id: user.id,
      created_at: new Date().toISOString(),
      status: 'sending',
    };

    // Optimistic update
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await fetch(`/api/agency/messages/threads/${threadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id,
        },
        credentials: 'include',
        body: JSON.stringify({ message_text: content }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Replace temp message with real one, normalizing message_text to content
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...data.message, content: data.message.message_text || content, status: 'sent' as const }
            : m
        )
      );
    } catch (err) {
      console.error('Error sending message:', err);
      // Mark as failed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, status: 'failed' as const } : m
        )
      );
    }
  };

  // Don't render if no recipient
  if (!recipient) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`
          fixed z-50 bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.12)] flex flex-col
          transition-transform duration-300 ease-out

          /* Mobile: Bottom sheet */
          inset-x-0 bottom-0 h-[85vh] rounded-t-2xl
          sm:inset-x-auto sm:bottom-auto sm:rounded-none

          /* Desktop: Right panel */
          sm:top-0 sm:right-0 sm:h-full sm:w-[400px] sm:border-l sm:border-gray-200

          ${isOpen
            ? 'translate-y-0 sm:translate-y-0 sm:translate-x-0'
            : 'translate-y-full sm:translate-y-0 sm:translate-x-full'
          }
        `}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <DrawerHeader
          recipient={recipient}
          onClose={closeDrawer}
          isMobile={isMobile}
        />

        {/* Body */}
        <DrawerBody
          messages={messages}
          currentUserId={user?.id || ''}
          recipientName={recipient.name}
          isLoading={isLoading}
          error={error}
        />

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />

        {/* Composer */}
        <DrawerComposer
          recipientName={recipient.name}
          onSend={handleSend}
          disabled={isLoading || !threadId}
        />
      </div>
    </>
  );
}
