'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
  metadata?: Record<string, unknown>;
}

interface ChildInfo {
  id: string;
  name: string;
}

export default function ChildActivityPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [childInfo, setChildInfo] = useState<ChildInfo | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'chapter_started': return '📚';
      case 'chapter_completed': return '🎉';
      case 'question_answered': return '✍️';
      case 'badge_earned': return '🏆';
      case 'streak_milestone': return '🔥';
      case 'daily_challenge': return '💬';
      case 'login': return '👋';
      case 'profile_updated': return '📝';
      case 'parent_approved': return '✅';
      case 'chapter_progress': return '📖';
      default: return '📌';
    }
  };

  const fetchActivities = useCallback(async (currentOffset: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      }

      // Get access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const headers: HeadersInit = accessToken
        ? { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };

      const res = await fetch(
        `/api/parent/children/${childId}/activity?limit=${limit}&offset=${currentOffset}`,
        { credentials: 'include', headers }
      );

      if (!res.ok) {
        throw new Error('Failed to load activities');
      }

      const data = await res.json();

      if (append) {
        setActivities(prev => [...prev, ...data.activities]);
      } else {
        setActivities(data.activities);
        setChildInfo({ id: childId, name: data.childName });
      }

      setHasMore(data.pagination?.hasMore || false);
      setOffset(currentOffset + limit);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [childId]);

  useEffect(() => {
    // First get child name from dashboard API
    const fetchChildInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const headers: HeadersInit = accessToken
        ? { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };

      const dashRes = await fetch('/api/parent/dashboard', {
        credentials: 'include',
        headers
      });

      if (dashRes.ok) {
        const dashData = await dashRes.json();
        const child = dashData.children?.find((c: ChildInfo) => c.id === childId);
        if (child) {
          setChildInfo(child);
        }
      }
    };

    fetchChildInfo();
    fetchActivities(0);
  }, [childId, fetchActivities]);

  const loadMore = () => {
    fetchActivities(offset, true);
  };

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const getDayLabel = (dateStr: string) => {
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={() => router.push('/parent/dashboard')}
            className="mt-4 text-purple-600 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/parent/dashboard')}
            className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">{childInfo?.name}&apos;s Activity</h1>
          <p className="text-gray-500">Complete activity history</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {activities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-gray-500">No activity yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Activity will appear here as {childInfo?.name} uses ChatNIL
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <div key={date}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {getDayLabel(date)}
                </h2>
                <div className="bg-white rounded-xl shadow-sm divide-y">
                  {dayActivities.map(activity => (
                    <div key={activity.id} className="p-4 flex items-start gap-3">
                      <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800">{activity.title}</p>
                        {activity.description && (
                          <p className="text-sm text-gray-500">{activity.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {activity.timeAgo || new Date(activity.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
