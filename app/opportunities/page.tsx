'use client';

import { Target, Building, Users, TrendingUp, Calendar, Star, DollarSign } from 'lucide-react';
import { ProtectedRoute } from '@/components/AuthGuard';
import AppShell from '@/components/Chat/AppShell';
import Header from '@/components/Header';

function OpportunitiesPageContent() {
  return (
    <AppShell>
      <Header />
      <div className="min-h-full bg-gradient-to-br from-blue-50 to-purple-50 py-8 sm:py-12 px-4 sm:px-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto text-center">
          {/* Coming Soon Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <Target className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Star className="h-4 w-4 text-yellow-800" />
            </div>
          </div>

          {/* Main Content */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            NIL Opportunities
          </h1>

          <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-200 rounded-full text-blue-800 font-medium mb-6">
            <Calendar className="h-4 w-4 mr-2" />
            Coming Soon
          </div>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Connect with businesses, brands, and sponsors looking for student-athletes like you.
            Discover sponsorship deals, social media campaigns, and collaboration opportunities.
          </p>

          {/* Feature Preview Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* For Athletes */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-left">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                For Athletes
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Sponsorship Deals</h4>
                    <p className="text-gray-600 text-sm">Find brands that match your values and audience</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Social Media Campaigns</h4>
                    <p className="text-gray-600 text-sm">Monetize your social media presence</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Collaborations</h4>
                    <p className="text-gray-600 text-sm">Partner with local businesses and startups</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Businesses */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-left">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                For Businesses
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Targeted Marketing</h4>
                    <p className="text-gray-600 text-sm">Reach engaged student-athlete audiences</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Brand Ambassadors</h4>
                    <p className="text-gray-600 text-sm">Find authentic voices for your brand</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">ROI Tracking</h4>
                    <p className="text-gray-600 text-sm">Measure campaign performance and engagement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Features */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Platform Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Matching</h3>
                <p className="text-gray-600 text-sm">AI-powered matching between athletes and opportunities</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure Payments</h3>
                <p className="text-gray-600 text-sm">Safe and transparent payment processing</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Contract Management</h3>
                <p className="text-gray-600 text-sm">Legal templates and agreement tracking</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-semibold mb-2">Ready to unlock your NIL potential?</h3>
            <p className="mb-6 opacity-90 max-w-2xl mx-auto">
              Complete your profile now to get priority access when the opportunities marketplace launches.
              The more complete your profile, the better we can match you with relevant opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/profile'}
                className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Complete Profile
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function OpportunitiesPage() {
  return (
    <ProtectedRoute>
      <OpportunitiesPageContent />
    </ProtectedRoute>
  );
}