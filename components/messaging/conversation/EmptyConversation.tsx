'use client';

import { MessageSquare, Lightbulb } from 'lucide-react';
import type { ThreadParticipant } from '@/types/messaging';

interface EmptyConversationProps {
  participant: ThreadParticipant;
  viewerRole: 'agency' | 'athlete';
}

/**
 * Empty state for new conversations with helpful prompts
 */
export function EmptyConversation({ participant, viewerRole }: EmptyConversationProps) {
  const isAgency = viewerRole === 'agency';

  const starterPrompts = isAgency
    ? [
        'Introduce yourself and your brand',
        'Explain the partnership opportunity',
        'Share why this athlete is a great fit',
      ]
    : [
        'Thank them for reaching out',
        'Ask about the opportunity details',
        'Share your availability',
      ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      {/* Icon */}
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-orange-500" />
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Start your conversation with {participant.display_name}
      </h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        {isAgency
          ? 'Send a professional message to introduce yourself and share why you think this athlete would be a great fit for your brand.'
          : 'This is the beginning of your conversation. Feel free to ask questions about the opportunity.'}
      </p>

      {/* Starter prompts */}
      <div className="bg-gray-50 rounded-xl p-4 max-w-sm w-full">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-gray-700">Conversation starters</span>
        </div>
        <ul className="space-y-2">
          {starterPrompts.map((prompt, index) => (
            <li
              key={index}
              className="text-sm text-gray-600 flex items-start gap-2"
            >
              <span className="text-orange-400 mt-0.5">•</span>
              {prompt}
            </li>
          ))}
        </ul>
      </div>

      {/* Response time hint */}
      {viewerRole === 'athlete' && participant.role === 'agency' && (
        <p className="text-xs text-gray-400 mt-6">
          {participant.company_name || participant.display_name} typically responds within 24 hours
        </p>
      )}
    </div>
  );
}
