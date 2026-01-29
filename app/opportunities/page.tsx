'use client';

import { useRouter } from 'next/navigation';
import { Target, ArrowLeft, Sparkles } from 'lucide-react';

/**
 * Opportunities Page - PAUSED FEATURE
 *
 * The marketplace matching feature is temporarily paused while we focus on
 * compliance-first features. This page shows a "Coming Soon" message
 * and redirects users to their dashboard.
 *
 * To re-enable:
 * 1. Restore the original OpportunitiesPage component from git history
 * 2. Re-enable the Opportunities link in HeaderUserMenu and HeaderMobileMenu
 * 3. Re-enable related navigation components (FeaturedOpportunity, ActionRequiredPanel)
 */

export default function OpportunitiesComingSoonPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
            <Target className="w-12 h-12 text-orange-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Opportunities Coming Soon
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          We're building an AI-powered matching system to connect you with
          the right brands. For now, focus on validating your deals and
          staying compliant.
        </p>

        {/* Features teaser */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 text-left">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-900">What's Coming</span>
          </div>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              AI-powered brand matching based on your profile
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              Campaign invitations from verified brands
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              Fair market value recommendations
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              Compliance scoring for every opportunity
            </li>
          </ul>
        </div>

        {/* Back button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
