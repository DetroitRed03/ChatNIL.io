'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Send,
  Search,
  Paperclip,
  MoreVertical,
  CheckCheck,
  Check,
  Circle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface Thread {
  thread_id: string;
  athlete_user_id: string;
  athlete: {
    id: string;
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
  };
  latest_message: string;
  latest_message_time: string;
  is_read: boolean;
  sender_id: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  is_read: boolean;
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
  };
}

export default function AgencyMessagesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect non-agencies
  useEffect(() => {
    if (user && user.role !== 'agency') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Fetch threads on load
  useEffect(() => {
    if (user?.role === 'agency') {
      fetchThreads();
    }
  }, [user]);

  // Fetch messages when thread is selected
  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.thread_id);
    }
  }, [selectedThread]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function fetchThreads() {
    try {
      const res = await fetch('/api/agency/messages/threads');
      const data = await res.json();

      if (data.success) {
        setThreads(data.threads);

        // Auto-select first thread if none selected
        if (data.threads.length > 0 && !selectedThread) {
          setSelectedThread(data.threads[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(threadId: string) {
    try {
      const res = await fetch(`/api/agency/messages/threads/${threadId}`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);

        // Update thread to mark as read
        setThreads(prev => prev.map(t =>
          t.thread_id === threadId ? { ...t, unread_count: 0 } : t
        ));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }

  async function sendMessage() {
    if (!messageInput.trim() || !selectedThread || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/agency/messages/threads/${selectedThread.thread_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_text: messageInput }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setMessageInput('');

        // Update thread with latest message
        setThreads(prev => prev.map(t =>
          t.thread_id === selectedThread.thread_id
            ? { ...t, latest_message: messageInput, latest_message_time: new Date().toISOString() }
            : t
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('❌ Failed to send message');
    } finally {
      setSending(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  const filteredThreads = threads.filter(thread => {
    if (!searchQuery) return true;
    const athleteName = `${thread.athlete?.first_name} ${thread.athlete?.last_name}`.toLowerCase();
    return athleteName.includes(searchQuery.toLowerCase());
  });

  if (user?.role !== 'agency') {
    return null;
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-warm-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-600">
              {threads.length} conversation{threads.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Threads List */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">No conversations yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Start a conversation from the discovery page
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <button
                  key={thread.thread_id}
                  onClick={() => setSelectedThread(thread)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left ${
                    selectedThread?.thread_id === thread.thread_id ? 'bg-primary-50' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {thread.athlete?.profile_photo_url ? (
                      <img
                        src={thread.athlete.profile_photo_url}
                        alt={`${thread.athlete.first_name} ${thread.athlete.last_name}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {thread.athlete?.first_name?.charAt(0)}
                          {thread.athlete?.last_name?.charAt(0)}
                        </span>
                      </div>
                    )}
                    {thread.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{thread.unread_count}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {thread.athlete?.first_name} {thread.athlete?.last_name}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(thread.latest_message_time)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${thread.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                      {thread.latest_message}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages Panel */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedThread ? (
            <>
              {/* Thread Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedThread.athlete?.profile_photo_url ? (
                    <img
                      src={selectedThread.athlete.profile_photo_url}
                      alt={`${selectedThread.athlete.first_name} ${selectedThread.athlete.last_name}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {selectedThread.athlete?.first_name?.charAt(0)}
                        {selectedThread.athlete?.last_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedThread.athlete?.first_name} {selectedThread.athlete?.last_name}
                    </h2>
                    <p className="text-sm text-gray-600">Active now</p>
                  </div>
                </div>

                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => {
                  const isFromAgency = message.sender_id !== selectedThread.athlete_user_id;
                  const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromAgency ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isFromAgency && showAvatar && (
                        <div className="mr-2">
                          {selectedThread.athlete?.profile_photo_url ? (
                            <img
                              src={selectedThread.athlete.profile_photo_url}
                              alt="Athlete"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-600">
                                {selectedThread.athlete?.first_name?.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {!isFromAgency && !showAvatar && <div className="w-8 mr-2" />}

                      <div className={`max-w-md ${isFromAgency ? 'text-right' : ''}`}>
                        <div
                          className={`inline-block px-4 py-2 rounded-2xl ${
                            isFromAgency
                              ? 'bg-primary-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.message_text}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(message.created_at)}
                          </span>
                          {isFromAgency && (
                            message.is_read ? (
                              <CheckCheck className="w-3 h-3 text-primary-600" />
                            ) : (
                              <Check className="w-3 h-3 text-gray-400" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex items-end gap-3">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>

                  <div className="flex-1">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={1}
                    />
                  </div>

                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || sending}
                    className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
