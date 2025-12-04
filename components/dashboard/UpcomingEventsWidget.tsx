/**
 * Upcoming Events Widget - Design System V4 - HIGH ENERGY
 *
 * Bold, vibrant list of upcoming events with visual hierarchy.
 * Matches the FMVScoreCard aesthetic with gradient header and colored accents.
 *
 * Features:
 * - Gradient header with shimmer effect
 * - Colored left borders for event types
 * - Larger urgent events (today/tomorrow) with gradient backgrounds
 * - Visual countdown badges
 * - Larger text (text-base for titles)
 * - Dramatic hover effects
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Zap, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';

// Event type configuration - with warm colors and gradients
const eventTypeConfig = {
  content: {
    icon: '📸',
    label: 'Content',
    borderColor: 'border-l-orange-500',
    gradient: 'from-orange-500 to-red-500',
    shadow: 'shadow-orange-500/30',
  },
  appearance: {
    icon: '🍔',
    label: 'Appearance',
    borderColor: 'border-l-amber-500',
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/30',
  },
  deadline: {
    icon: '📋',
    label: 'Deadline',
    borderColor: 'border-l-red-500',
    gradient: 'from-red-500 to-orange-500',
    shadow: 'shadow-red-500/30',
  },
  payment: {
    icon: '💰',
    label: 'Payment',
    borderColor: 'border-l-yellow-500',
    gradient: 'from-yellow-500 to-amber-500',
    shadow: 'shadow-yellow-500/30',
  },
  networking: {
    icon: '🤝',
    label: 'Networking',
    borderColor: 'border-l-orange-600',
    gradient: 'from-orange-600 to-amber-600',
    shadow: 'shadow-orange-600/30',
  }
} as const;

type EventType = keyof typeof eventTypeConfig;

interface Event {
  id: string;
  title: string;
  date: Date;
  type: EventType;
  location?: string;
  deal_title?: string;
}

// Map API event type to component event type
function mapEventType(apiType: string): EventType {
  if (apiType === 'deliverable') return 'deadline';
  if (apiType === 'payment') return 'payment';
  return 'deadline'; // Default
}

// Helper function to format date
function formatDate(date: Date): string {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `${diffDays}d`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Helper to check if event is urgent (today or tomorrow)
function isUrgent(date: Date): boolean {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 1;
}

export function UpcomingEventsWidget() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const userId = user.id; // Capture for use in async function

    async function fetchEvents() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/dashboard/events?userId=${userId}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();

        // Extract events array from response
        const eventsData = data.events || data;

        // Transform API events to component format
        const transformedEvents: Event[] = eventsData.map((item: any) => ({
          id: item.id,
          title: item.title,
          date: new Date(item.date),
          type: mapEventType(item.type),
          location: item.deal_title || 'NIL Deal',
          deal_title: item.deal_title,
        }));

        setEvents(transformedEvents);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [user?.id]);

  const hasEvents = events.length > 0;

  return (
    <Card className="bg-gradient-to-br from-orange-50/20 via-white to-amber-50/15 border border-orange-100/40 overflow-hidden shadow-sm shadow-orange-100/30">
      {/* Warm Gradient Header with Shimmer */}
      <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-6 py-6 overflow-hidden">
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
          <h3 className="font-bold text-2xl text-white">Your Schedule 📅</h3>
          <p className="text-white/90 text-sm font-medium mt-1">What's coming up</p>
        </div>
      </div>

      <div className="p-0">
        {isLoading ? (
          <div className="px-6 py-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="px-6 py-8">
            <EmptyState
              variant="simple"
              icon={<AlertCircle className="w-10 h-10 text-red-400" />}
              title="Error loading events"
              description={error}
            />
          </div>
        ) : !hasEvents ? (
          <div className="px-6 py-8">
            <EmptyState
              variant="simple"
              icon={<Calendar className="w-10 h-10 text-gray-400" />}
              title="No events scheduled"
              description="Your calendar is clear"
            />
          </div>
        ) : (
          <div className="divide-y divide-orange-100/30">
            {events.map((event, index) => {
              const config = eventTypeConfig[event.type];
              const urgent = isUrgent(event.date);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 4, scale: 1.01 }}
                  className={`group relative cursor-pointer transition-all ${
                    urgent
                      ? 'bg-gradient-to-br from-orange-100/40 to-amber-100/30 border-l-4 border-orange-500 shadow-md shadow-orange-200/50 hover:from-orange-100/60 hover:to-amber-100/50'
                      : 'bg-white/80 border border-orange-100/30 hover:bg-gradient-to-br hover:from-orange-50/30 hover:to-amber-50/20 hover:border-orange-200/50'
                  }`}
                >
                  {/* Colored left border (4px) */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.borderColor}`} />

                  <div className="px-6 py-4 pl-8">
                    <div className="flex items-start gap-4">
                      {/* Icon and Badge */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl flex-shrink-0">{config.icon}</span>
                        <span className={`text-xs font-bold text-white bg-gradient-to-r ${config.gradient} px-3 py-1 rounded-full shadow-md flex-shrink-0`}>
                          {config.label}
                        </span>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className={`${urgent ? 'text-lg' : 'text-base'} font-bold text-gray-900 truncate`}>
                            {event.title}
                          </h4>
                          {/* Countdown Badge */}
                          {urgent && (
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${config.gradient} shadow-lg ${config.shadow}`}>
                              <Zap className="w-4 h-4 text-white" />
                              <span className="text-xs font-bold text-white">{formatDate(event.date)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{!urgent && formatDate(event.date)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate font-medium">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </Card>
  );
}
