'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AthleteOnlyGuard } from '@/components/guards/AthleteOnlyGuard';
import { BadgeHero } from '@/components/badges/BadgeHero';
import { BadgeTierGuide } from '@/components/badges/BadgeTierGuide';
import { HowToEarnSection } from '@/components/badges/HowToEarnSection';
import BadgeShowcase from '@/components/badges/BadgeShowcase';
import { getBadgeStats } from '@/lib/badges';
import { Trophy, Loader2 } from 'lucide-react';
import Header from '@/components/Header';

export default function BadgesPage() {
  return (
    <AthleteOnlyGuard>
      <BadgesPageContent />
    </AthleteOnlyGuard>
  );
}

function BadgesPageContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBadges: 0,
    earnedCount: 0,
    totalPoints: 0,
    completionPercentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const badgeStats = await getBadgeStats(user.id);
      setStats(badgeStats);
    } catch (error) {
      console.error('Error loading badge stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-6 min-h-screen">
        <div className="text-center">
          <Trophy className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign In Required</h2>
          <p className="text-gray-600 text-lg">
            Please sign in to view your badges and track your NIL learning progress
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your badge collection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <Header />

      {/* Main Content */}
      <div className="overflow-y-auto bg-gradient-to-br from-orange-50/30 via-white to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Hero Section */}
          <BadgeHero stats={stats} />

          {/* Badge Tier Guide */}
          <BadgeTierGuide />

          {/* How to Earn Section */}
          <HowToEarnSection />

          {/* All Badges Section */}
          <div className="mb-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Your Badge Collection
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Browse all available badges, filter by status, and track your progress. Click any badge to see more details!
              </p>
            </div>

            <BadgeShowcase userId={user.id} />
          </div>
        </div>
      </div>
    </>
  );
}

