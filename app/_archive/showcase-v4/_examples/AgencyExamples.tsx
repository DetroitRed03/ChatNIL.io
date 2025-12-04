'use client';

import { motion } from 'framer-motion';
import { MapPin, Users, Star, Award, ArrowRight, Briefcase, CheckCircle2 } from 'lucide-react';

export function AgencyExamples() {
  const agencies = [
    {
      id: 1,
      name: 'Premier Sports Group',
      location: 'New York, NY',
      clients: 45,
      rating: 4.9,
      verified: true,
      specialties: ['Basketball', 'Football', 'Baseball'],
      deals: 120,
    },
    {
      id: 2,
      name: 'Athletic Partners LLC',
      location: 'Los Angeles, CA',
      clients: 32,
      rating: 4.8,
      verified: true,
      specialties: ['Soccer', 'Track & Field', 'Swimming'],
      deals: 85,
    },
    {
      id: 3,
      name: 'Collegiate NIL Advisors',
      location: 'Chicago, IL',
      clients: 28,
      rating: 4.7,
      verified: false,
      specialties: ['Basketball', 'Volleyball', 'Softball'],
      deals: 62,
    },
  ];

  return (
    <div className="space-y-8">

      <div className="grid gap-6">
        {agencies.map((agency, index) => (
          <motion.div
            key={agency.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="bg-white rounded-2xl border-2 border-gray-200 hover:border-orange-500 shadow-lg hover:shadow-2xl transition-all duration-200 overflow-hidden"
          >
            <div className="p-8">

              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {agency.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">{agency.name}</h3>
                      {agency.verified && (
                        <div className="bg-blue-100 text-blue-700 p-1 rounded-full">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{agency.location}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="bg-orange-50 px-4 py-2 rounded-xl border-2 border-orange-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
                    <span className="text-xl font-bold text-gray-900">{agency.rating}</span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Rating</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-5 h-5 text-orange-600" />
                    <p className="text-2xl font-bold text-gray-900">{agency.clients}</p>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Active Clients</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Briefcase className="w-5 h-5 text-orange-600" />
                    <p className="text-2xl font-bold text-gray-900">{agency.deals}</p>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">NIL Deals</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Award className="w-5 h-5 text-orange-600" />
                    <p className="text-2xl font-bold text-gray-900">Top 10</p>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Nationwide</p>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-600 mb-3">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {agency.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-semibold"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-orange-500/30 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Contact Agency
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  View Profile
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Agency Portfolio Example */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-gradient-to-br from-orange-50 to-white rounded-2xl border-2 border-orange-200 p-8 shadow-xl"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us?</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Expert Representation</h4>
              <p className="text-gray-600">15+ years of experience in college athletics and NIL deals</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Strong Network</h4>
              <p className="text-gray-600">Connected with 200+ brands nationwide</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Proven Results</h4>
              <p className="text-gray-600">$2.5M+ in NIL deals secured for athletes</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Full Support</h4>
              <p className="text-gray-600">Legal, tax, and compliance guidance included</p>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
