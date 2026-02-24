'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  read: boolean;
  created_at: string;
}

interface Reminder {
  id: string;
  title: string;
  reminder_date: string;
  reminder_type: string;
}

export function NotificationBell({ className = '' }: { className?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch data on mount and every 5 minutes
  const isAthlete = user?.role === 'college_athlete' || user?.role === 'athlete';

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const promises: Promise<Response | null>[] = [
          fetch('/api/notifications?limit=5', { credentials: 'include' }).catch(() => null),
        ];
        // Only fetch reminders for athlete roles
        if (isAthlete) {
          promises.push(
            fetch('/api/reminders', { credentials: 'include' }).catch(() => null)
          );
        }

        const [notifRes, reminderRes] = await Promise.all(promises);

        if (notifRes?.ok) {
          const data = await notifRes.json();
          const items = data.notifications || [];
          setNotifications(items.slice(0, 5));
        }

        if (reminderRes?.ok) {
          const data = await reminderRes.json();
          setReminders((data.reminders || []).slice(0, 5));
        }
      } catch {
        // Silently fail
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [user, isAthlete]);

  // Calculate total badge count
  useEffect(() => {
    const unreadNotifs = notifications.filter(n => !n.read).length;
    const now = new Date();
    const dueReminders = reminders.filter(r => new Date(r.reminder_date) <= now).length;
    setTotalCount(unreadNotifs + dueReminders);
  }, [notifications, reminders]);

  if (!user) return null;

  const handleNotificationClick = (notif: Notification) => {
    // Mark as read
    fetch('/api/notifications', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_ids: [notif.id] }),
    }).catch(() => {});

    setNotifications(prev =>
      prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
    );

    if (notif.action_url) {
      router.push(notif.action_url);
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: unreadIds }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      // Silently fail
    }
  };

  const handleCompleteReminder = async (id: string) => {
    try {
      await fetch('/api/reminders', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder_id: id, action: 'complete' }),
      });
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch {
      // Silently fail
    }
  };

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const hasItems = notifications.length > 0 || reminders.length > 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        aria-label={`Notifications ${totalCount > 0 ? `(${totalCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5 text-gray-600" />

        {totalCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-md"
          >
            {totalCount > 99 ? '99+' : totalCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {notifications.some(n => !n.read) && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {!hasItems ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <>
                  {/* Reminders */}
                  {reminders.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Reminders
                      </p>
                      {reminders.map(r => {
                        const isOverdue = new Date(r.reminder_date) < new Date();
                        return (
                          <div
                            key={r.id}
                            className={`px-4 py-3 flex items-start gap-3 border-b border-gray-50 ${
                              isOverdue ? 'bg-red-50' : ''
                            }`}
                          >
                            <span className="text-lg mt-0.5">
                              {r.reminder_type === 'tax_payment' ? '💰' :
                               r.reminder_type === 'deal_submission' ? '📄' :
                               r.reminder_type === 'deadline' ? '⏰' : '🔔'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                              <p className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                {isOverdue ? 'Overdue' : new Date(r.reminder_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            <button
                              onClick={() => handleCompleteReminder(r.id)}
                              className="p-1 text-emerald-500 hover:bg-emerald-50 rounded transition-colors"
                              title="Complete"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Notifications */}
                  {notifications.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Updates
                      </p>
                      {notifications.map(n => (
                        <button
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                            !n.read ? 'bg-orange-50/50' : ''
                          }`}
                        >
                          {!n.read && (
                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!n.read ? 'font-medium text-gray-900' : 'text-gray-700'} truncate`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  router.push('/dashboard');
                  setIsOpen(false);
                }}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium w-full text-center"
              >
                View Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
