/**
 * Recent Chats Widget - Learning Hub Component
 *
 * Displays recent AI coach conversations:
 * - 3 most recent chat sessions
 * - Chat title with message preview
 * - Timestamp and pin indicators
 * - CTA to start new chat
 *
 * Features:
 * - Warm orange/amber gradient header (matches dashboard theme)
 * - Loading, error, and empty states
 * - Smooth animations with Framer Motion
 * - Responsive design
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Pin, Clock, Plus, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { useRecentChats } from '@/hooks/useDashboardData';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface RecentChatsWidgetProps {
  userId?: string;
  className?: string;
}

// Loading skeleton component
function ChatHistorySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
        <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

// Error state component
function ErrorState() {
  return (
    <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
          <MessageCircle className="h-6 w-6 text-red-600" />
        </div>
        <p className="text-red-600 font-medium">Failed to load chat history</p>
        <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 px-6 py-6">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Your AI Coach 🤖
        </h3>
        <p className="text-white/90 text-sm mt-1">Get expert NIL guidance 24/7</p>
      </div>

      {/* Empty Content */}
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
          <Sparkles className="h-10 w-10 text-orange-600" />
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">Chat with Your AI NIL Coach!</h4>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Ask anything about contracts, earnings, compliance, taxes, and NIL strategies. Get instant expert answers.
        </p>
        <Link href="/">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 hover:from-orange-500 hover:via-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="h-5 w-5" />
            Start Your First Chat
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export function RecentChatsWidget({ userId, className = '' }: RecentChatsWidgetProps) {
  const { data, isLoading, error } = useRecentChats(userId);

  // Loading state
  if (isLoading) return <ChatHistorySkeleton />;

  // Error state
  if (error) return <ErrorState />;

  // Handle API response - may be wrapped in { chats: [...] } or direct array
  const chats = Array.isArray(data) ? data : (data?.chats || []);

  // Empty state
  if (!chats || chats.length === 0) return <EmptyState />;

  // Get 3 most recent chats
  const recentChats = chats.slice(0, 3);
  const totalChats = chats.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Gradient Header with Animation */}
      <div className="relative bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 px-6 py-6 overflow-hidden">
        {/* Animated shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />

        {/* Header Content */}
        <div className="relative">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Your AI Coach 🤖
          </h3>
          <p className="text-white/90 text-sm mt-1">
            {totalChats} {totalChats === 1 ? 'conversation' : 'conversations'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-100">
        {/* Chat List */}
        {recentChats.map((chat: any, index: number) => {
          const chatId = chat.id || chat.chatId;
          const title = chat.title || 'Untitled Chat';
          const lastMessage = chat.lastMessage || chat.preview || '';
          const isPinned = chat.isPinned || false;
          const messageCount = chat.messageCount || chat.messages?.length || 0;
          const timestamp = chat.updatedAt || chat.timestamp || chat.createdAt;

          // Truncate preview to 50 chars
          const preview = lastMessage.length > 50
            ? lastMessage.substring(0, 50) + '...'
            : lastMessage;

          return (
            <Link key={chatId || index} href={`/?chatId=${chatId}`}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="p-4 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  {/* Icon with background */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
                      <MessageSquare className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate flex items-center gap-2">
                        {title}
                        {isPinned && (
                          <Pin className="h-3 w-3 text-orange-500 flex-shrink-0" />
                        )}
                      </h4>
                    </div>

                    {/* Preview */}
                    {preview && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                        {preview}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timestamp
                          ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
                          : 'Recently'}
                      </span>
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Footer with CTA */}
      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 hover:from-orange-500 hover:via-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-5 w-5" />
              Start New Chat
            </button>
          </Link>
        </motion.div>

        {/* View all link */}
        {totalChats > 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-3"
          >
            <Link href="/" className="text-sm text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-1">
              View all {totalChats} conversations
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
