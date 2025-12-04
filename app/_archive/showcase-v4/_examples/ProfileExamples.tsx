'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  MapPin, Calendar, Users, TrendingUp, Instagram, Twitter,
  Youtube, Star, Award, CheckCircle2, DollarSign, BarChart3,
  MessageCircle
} from 'lucide-react';

export function ProfileExamples() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'fmv', label: 'FMV Score' },
    { id: 'stats', label: 'Athletic Stats' },
    { id: 'social', label: 'Social Media' },
    { id: 'deals', label: 'NIL Deals' },
  ];

  return (
    <div className="w-full">

      {/* Hero Section with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 via-orange-600 to-gray-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-8 md:p-12 text-white">

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-8">

            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-5xl font-bold shadow-2xl">
                MJ
              </div>
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Marcus Johnson</h1>
                  <p className="text-xl text-orange-100 font-medium mb-3">
                    Basketball • Point Guard • #23
                  </p>
                  <div className="flex items-center gap-4 text-orange-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>University of Miami</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>Junior • Class of 2025</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-orange-600 hover:bg-orange-50 font-semibold py-3 px-6 rounded-xl shadow-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Request Deal
                </motion.button>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-semibold border border-white/30 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-white" />
                  Top 5% Athlete
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-semibold border border-white/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-semibold border border-white/30 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  5 Active Deals
                </div>
              </div>
            </div>
          </div>

          {/* Glassmorphic Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-xl"
            >
              <div className="flex items-center gap-2 text-orange-100 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Followers</span>
              </div>
              <p className="text-3xl font-bold">48.2K</p>
              <p className="text-xs text-orange-200 mt-1">+12.5% this month</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-xl"
            >
              <div className="flex items-center gap-2 text-orange-100 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Engagement</span>
              </div>
              <p className="text-3xl font-bold">8.4%</p>
              <p className="text-xs text-orange-200 mt-1">Above average</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-xl"
            >
              <div className="flex items-center gap-2 text-orange-100 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">FMV Score</span>
              </div>
              <p className="text-3xl font-bold">$12.5K</p>
              <p className="text-xs text-orange-200 mt-1">Market value</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-xl"
            >
              <div className="flex items-center gap-2 text-orange-100 mb-2">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-medium">Total Earned</span>
              </div>
              <p className="text-3xl font-bold">$45K</p>
              <p className="text-xs text-orange-200 mt-1">All-time</p>
            </motion.div>
          </div>

        </div>
      </motion.div>

      {/* Tabbed Content Area */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">

          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >

              {/* About Section */}
              <section>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">About</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Dynamic point guard with exceptional court vision and leadership skills.
                  Three-year starter with a track record of elevating team performance.
                  Passionate about community engagement and youth basketball development.
                </p>
              </section>

              {/* Athletic Information */}
              <section>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Athletic Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Position</p>
                    <p className="text-xl font-bold text-gray-900">Point Guard</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Jersey Number</p>
                    <p className="text-xl font-bold text-gray-900">#23</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Height / Weight</p>
                    <p className="text-xl font-bold text-gray-900">6'2" / 185 lbs</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Academic Year</p>
                    <p className="text-xl font-bold text-gray-900">Junior</p>
                  </div>
                </div>
              </section>

              {/* Social Media */}
              <section>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Social Media</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <motion.a
                    href="#"
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="flex items-center gap-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white p-5 rounded-xl shadow-lg"
                  >
                    <Instagram className="w-8 h-8" />
                    <div>
                      <p className="text-sm font-medium opacity-90">Instagram</p>
                      <p className="text-2xl font-bold">24.5K</p>
                    </div>
                  </motion.a>

                  <motion.a
                    href="#"
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="flex items-center gap-4 bg-gradient-to-br from-blue-400 to-blue-600 text-white p-5 rounded-xl shadow-lg"
                  >
                    <Twitter className="w-8 h-8" />
                    <div>
                      <p className="text-sm font-medium opacity-90">Twitter</p>
                      <p className="text-2xl font-bold">18.2K</p>
                    </div>
                  </motion.a>

                  <motion.a
                    href="#"
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="flex items-center gap-4 bg-gradient-to-br from-red-500 to-red-600 text-white p-5 rounded-xl shadow-lg"
                  >
                    <Youtube className="w-8 h-8" />
                    <div>
                      <p className="text-sm font-medium opacity-90">YouTube</p>
                      <p className="text-2xl font-bold">5.8K</p>
                    </div>
                  </motion.a>
                </div>
              </section>

              {/* Recent NIL Deals */}
              <section>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Recent NIL Deals</h3>
                <div className="space-y-4">

                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-orange-500 transition-colors duration-200"
                  >
                    <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10.5 3L2 12h6v9h5v-9h6l-8.5-9z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg">Nike Athlete Partnership</h4>
                      <p className="text-gray-600">Social media campaign • 6 months</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">$15,000</p>
                      <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold mt-1">
                        Active
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-orange-500 transition-colors duration-200"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                      G
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg">Gatorade Ambassador</h4>
                      <p className="text-gray-600">Campus events • 3 months</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">$8,500</p>
                      <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold mt-1">
                        Active
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors duration-200 opacity-60"
                  >
                    <div className="w-14 h-14 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-xl">
                      A
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg">Adidas Collaboration</h4>
                      <p className="text-gray-600">Product promotion • 2 months</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">$6,000</p>
                      <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-bold mt-1">
                        Completed
                      </span>
                    </div>
                  </motion.div>

                </div>
              </section>

            </motion.div>
          )}

          {activeTab === 'fmv' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <BarChart3 className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">FMV Score Details</h3>
              <p className="text-gray-600">Detailed fair market value analysis coming soon</p>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Award className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Athletic Statistics</h3>
              <p className="text-gray-600">Season stats and performance metrics</p>
            </motion.div>
          )}

          {activeTab === 'social' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Instagram className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Social Media Analytics</h3>
              <p className="text-gray-600">Detailed engagement and growth metrics</p>
            </motion.div>
          )}

          {activeTab === 'deals' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <DollarSign className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">NIL Deal History</h3>
              <p className="text-gray-600">Complete timeline of partnerships and earnings</p>
            </motion.div>
          )}

        </div>
      </div>

    </div>
  );
}
