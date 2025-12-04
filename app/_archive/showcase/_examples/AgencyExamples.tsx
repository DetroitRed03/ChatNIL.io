'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Building,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  MapPin,
  Calendar,
  Award,
  Briefcase,
  Target,
} from 'lucide-react';

export function AgencyExamples() {
  return (
    <div className="w-full space-y-12">
      {/* Agency Profile Card */}
      <Section title="Agency Profile Card" description="Agency information display">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
          className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg max-w-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white relative overflow-hidden">
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
                backgroundSize: '25px 25px',
              }}
            />

            <div className="relative flex items-start gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring' }}
                className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-2xl"
              >
                <Building className="w-10 h-10 text-indigo-600" />
              </motion.div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold">Elite Sports Agency</h3>
                  <Star className="w-5 h-5 fill-white" />
                </div>
                <p className="text-indigo-100 mb-3">Premier NIL representation for student athletes</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success" className="bg-white/20 text-white border-white/30">
                    Verified
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Top Agency
                  </Badge>
                  <Badge variant="warning" className="bg-white/20 text-white border-white/30">
                    Featured
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Athletes', value: '147', icon: Users, color: 'blue' },
                { label: 'Deals', value: '892', icon: Briefcase, color: 'emerald' },
                { label: 'Total Value', value: '$4.2M', icon: DollarSign, color: 'amber' },
                { label: 'Success Rate', value: '94%', icon: Target, color: 'purple' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                  >
                    <Icon className={`w-6 h-6 text-${stat.color}-500 mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>Los Angeles, CA • New York, NY • Miami, FL</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>Founded 2018 • 6 years experience</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Award className="w-5 h-5 text-gray-400" />
                <span>Top 10 NIL Agency 2024 • AAA Rated</span>
              </div>
            </div>

            {/* Specializations */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Specializations</h4>
              <div className="flex flex-wrap gap-2">
                {['Basketball', 'Football', 'Baseball', 'Soccer', 'Brand Partnerships', 'Social Media'].map(
                  (spec, i) => (
                    <motion.div
                      key={spec}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    >
                      <Badge variant="secondary">{spec}</Badge>
                    </motion.div>
                  )
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <Button variant="primary" className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500">
                Contact Agency
              </Button>
              <Button variant="secondary">View Portfolio</Button>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* Agency Dashboard Widget */}
      <Section title="Agency Dashboard" description="Performance metrics overview">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg max-w-3xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Monthly Performance</h3>
              <p className="text-sm text-gray-600">January 2025</p>
            </div>
            <Badge variant="success">
              <TrendingUp className="w-4 h-4 mr-1" />
              +23% vs last month
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            {[
              {
                label: 'New Athletes',
                value: '12',
                change: '+3',
                color: 'from-blue-500 to-cyan-500',
                bgColor: 'from-blue-50 to-cyan-50',
              },
              {
                label: 'Active Deals',
                value: '47',
                change: '+8',
                color: 'from-emerald-500 to-teal-500',
                bgColor: 'from-emerald-50 to-teal-50',
              },
              {
                label: 'Revenue',
                value: '$287K',
                change: '+$52K',
                color: 'from-amber-500 to-orange-500',
                bgColor: 'from-amber-50 to-orange-50',
              },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`p-6 bg-gradient-to-br ${metric.bgColor} rounded-xl border-2 border-gray-200`}
              >
                <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{metric.value}</div>
                <div className={`text-sm font-semibold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                  {metric.change}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
            <div className="space-y-3">
              {[
                { action: 'New athlete signed', athlete: 'Sarah Williams', time: '2 hours ago', type: 'success' },
                { action: 'Deal approved', athlete: 'Marcus Johnson', time: '5 hours ago', type: 'info' },
                { action: 'Contract renewed', athlete: 'Emma Davis', time: '1 day ago', type: 'success' },
              ].map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{activity.action}</div>
                    <div className="text-sm text-gray-600">{activity.athlete}</div>
                  </div>
                  <div className="text-sm text-gray-500">{activity.time}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </Section>

      {/* Athlete Roster Card */}
      <Section title="Athlete Roster" description="Agency athlete lineup">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg max-w-3xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Featured Athletes</h3>
            <Button variant="ghost" size="sm">
              View All (147)
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Marcus J.', sport: 'Basketball', deals: 12, value: '$45K' },
              { name: 'Sarah W.', sport: 'Soccer', deals: 8, value: '$32K' },
              { name: 'Emma D.', sport: 'Volleyball', deals: 15, value: '$58K' },
              { name: 'James T.', sport: 'Football', deals: 10, value: '$41K' },
              { name: 'Olivia M.', sport: 'Track', deals: 6, value: '$28K' },
              { name: 'Alex R.', sport: 'Baseball', deals: 9, value: '$35K' },
            ].map((athlete, i) => (
              <motion.div
                key={athlete.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 cursor-pointer"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-xl font-bold text-white mb-3">
                  {athlete.name[0]}
                </div>
                <h4 className="font-bold text-slate-900 mb-1">{athlete.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{athlete.sport}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">{athlete.deals} deals</span>
                  <span className="font-semibold text-emerald-600">{athlete.value}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="p-8 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border-2 border-gray-200">
        {children}
      </div>
    </motion.div>
  );
}
