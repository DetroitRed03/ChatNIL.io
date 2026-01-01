'use client';

import { MessageSquare, Loader2, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  status?: 'sending' | 'sent' | 'failed';
}

interface DrawerBodyProps {
  messages: Message[];
  currentUserId: string;
  recipientName: string;
  isLoading: boolean;
  error: string | null;
}

function EmptyConversationState({ recipientName }: { recipientName: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-orange-600" />
      </div>
      <h4 className="font-semibold text-gray-900 mb-2">Start the conversation</h4>
      <p className="text-gray-500 text-sm mb-6">
        Send a message to introduce yourself and explain the opportunity.
      </p>
      <div className="bg-white rounded-lg p-4 border border-gray-200 text-left w-full max-w-xs">
        <p className="text-sm font-medium text-gray-700 mb-2">Conversation starters:</p>
        <ul className="text-sm text-gray-600 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-orange-500">•</span>
            <span>Introduce yourself and your brand</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500">•</span>
            <span>Explain the partnership opportunity</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500">•</span>
            <span>Share why they&apos;re a great fit</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isOwn
            ? 'bg-orange-500 text-white rounded-br-md'
            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={`flex items-center gap-1 mt-1 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}
        >
          <span
            className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-400'}`}
          >
            {time}
          </span>
          {isOwn && message.status === 'sending' && (
            <Loader2 className="w-3 h-3 animate-spin text-white/70" />
          )}
          {isOwn && message.status === 'failed' && (
            <AlertCircle className="w-3 h-3 text-red-300" />
          )}
        </div>
      </div>
    </div>
  );
}

export function DrawerBody({
  messages,
  currentUserId,
  recipientName,
  isLoading,
  error,
}: DrawerBodyProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-sm text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-sm text-gray-700 font-medium">Failed to load conversation</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 bg-gray-50">
        <EmptyConversationState recipientName={recipientName} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.sender_id === currentUserId}
        />
      ))}
    </div>
  );
}
