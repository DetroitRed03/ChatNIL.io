'use client';

import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, Sparkles } from 'lucide-react';

/**
 * Discover Page - PAUSED FEATURE
 *
 * The athlete discovery feature for agencies is temporarily paused while we focus on
 * compliance-first features. This page shows a "Coming Soon" message.
 *
 * To re-enable:
 * 1. Restore the original DiscoverPage component from git history
 * 2. Re-enable the agency routes in NavigationShell
 * 3. Re-enable the Discover link in agency navigation
 */

export default function DiscoverComingSoonPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
            <Search className="w-12 h-12 text-orange-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Athlete Discovery Coming Soon
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          We're building powerful tools for brands and agencies to discover
          and connect with student-athletes. Stay tuned!
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
              Search athletes by sport, school, and reach
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              AI-powered match recommendations
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              Campaign invitation workflows
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              Compliance verification for all athletes
            </li>
          </ul>
        </div>

        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
