'use client';

import { motion } from 'framer-motion';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { MessageTimestamp } from '../shared/MessageTimestamp';
import type { DirectMessage, MessageDeliveryStatus } from '@/types/messaging';

interface MessageBubbleProps {
  message: DirectMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  senderName?: string;
  senderAvatar?: string | null;
  deliveryStatus?: MessageDeliveryStatus;
}

/**
 * Individual message bubble with professional styling
 * - Own messages: Right-aligned, orange background
 * - Other messages: Left-aligned, gray background
 * - Flat corner on avatar side for visual connection
 */
export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true,
  senderName,
  senderAvatar,
  deliveryStatus = 'sent',
}: MessageBubbleProps) {
  const initials = senderName
    ? senderName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'flex gap-2 px-4',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      {showAvatar ? (
        <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
          {senderAvatar && <AvatarImage src={senderAvatar} alt={senderName} />}
          <AvatarFallback className={cn(
            'text-xs font-medium',
            isOwn ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 flex-shrink-0" /> // Spacer for alignment
      )}

      {/* Message content */}
      <div className={cn('flex flex-col max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-2.5 text-sm',
            isOwn
              ? 'bg-orange-500 text-white rounded-2xl rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.message_text}</p>
        </div>

        {/* Timestamp and read receipt */}
        {showTimestamp && (
          <div className={cn(
            'flex items-center gap-1.5 mt-1 px-1',
            isOwn ? 'flex-row-reverse' : 'flex-row'
          )}>
            <MessageTimestamp timestamp={message.created_at} />
            {isOwn && <DeliveryIndicator status={deliveryStatus} isRead={message.is_read} />}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Delivery status indicator
 * Clock = Sending, Check = Sent, CheckCheck = Delivered, CheckCheck (orange) = Read
 */
function DeliveryIndicator({
  status,
  isRead,
}: {
  status: MessageDeliveryStatus;
  isRead: boolean;
}) {
  if (status === 'sending') {
    return <Clock className="w-3.5 h-3.5 text-gray-400" />;
  }

  if (isRead || status === 'read') {
    return <CheckCheck className="w-3.5 h-3.5 text-orange-500" />;
  }

  if (status === 'delivered') {
    return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
  }

  // Sent
  return <Check className="w-3.5 h-3.5 text-gray-400" />;
}

/**
 * Typing indicator (bouncing dots)
 */
export function TypingIndicator({ name }: { name?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1 bg-gray-100 px-4 py-3 rounded-2xl">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      {name && (
        <span className="text-xs text-gray-500">{name} is typing...</span>
      )}
    </div>
  );
}
