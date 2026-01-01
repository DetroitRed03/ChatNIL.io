'use client';

import { BarChart3, TrendingUp, Users, DollarSign, Target, Bell } from 'lucide-react';
import Link from 'next/link';
import { AgencyOnlyGuard } from '@/components/guards/AgencyOnlyGuard';

export default function AnalyticsPage() {
  return (
    <AgencyOnlyGuard>
      <AnalyticsComingSoon />
    </AgencyOnlyGuard>
  );
}

function AnalyticsComingSoon() {
  const upcomingFeatures = [
    {
      icon: TrendingUp,
      title: 'Campaign Performance',
      description: 'Track ROI, engagement rates, and conversion metrics across all your campaigns.',
    },
    {
      icon: Users,
      title: 'Athlete Insights',
      description: 'Deep analytics on athlete performance, audience demographics, and growth trends.',
    },
    {
      icon: DollarSign,
      title: 'Deal Analytics',
      description: 'Monitor deal values, completion rates, and payment tracking in one place.',
    },
    {
      icon: Target,
      title: 'Matchmaking Metrics',
      description: 'See which athlete types perform best for your campaigns and brand.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl mb-6 shadow-lg">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Analytics Coming Soon
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're building powerful analytics tools to help you track campaign performance,
            measure ROI, and make data-driven decisions for your NIL partnerships.
          </p>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {upcomingFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-orange-100/50 p-6 hover:border-orange-200 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notify Me Section */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 text-center text-white">
          <Bell className="w-10 h-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-2">Get Notified When It Launches</h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            We'll let you know as soon as analytics is ready. In the meantime, explore
            your dashboard for quick insights.
          </p>
          <Link
            href="/agency/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Quick Stats Preview */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">Preview of what's coming</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Reach', value: '--', suffix: '' },
              { label: 'Avg. Engagement', value: '--', suffix: '%' },
              { label: 'Active Deals', value: '--', suffix: '' },
              { label: 'Total Spend', value: '--', suffix: '' },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-4"
              >
                <div className="text-2xl font-bold text-gray-300">{stat.value}{stat.suffix}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
