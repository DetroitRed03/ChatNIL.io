'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import {
  User,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Instagram,
  Twitter,
  Youtube,
  Star,
  Edit,
} from 'lucide-react';

export function ProfileExamples() {
  return (
    <div className="w-full space-y-12">
      {/* Profile Header */}
      <Section title="Profile Header" description="User profile header section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg max-w-2xl"
        >
          {/* Cover Image */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          </div>

          <div className="px-6 pb-6">
            {/* Profile Picture */}
            <div className="flex items-end gap-4 -mt-16 mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-2xl ring-4 ring-white"
              >
                MJ
              </motion.div>
              <div className="mb-2 flex-1">
                <Button variant="primary" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">Marcus Johnson</h2>
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <Badge variant="success">Verified</Badge>
                </div>
                <p className="text-gray-600">Student Athlete • Duke University</p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Durham, NC</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined January 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>15 Achievements</span>
                </div>
              </div>

              <p className="text-gray-700">
                Basketball player | NIL Advocate | Fashion enthusiast. Working with brands to create
                authentic partnerships. 🏀✨
              </p>

              {/* Social Links */}
              <div className="flex gap-3">
                {[
                  { icon: Instagram, color: 'from-pink-500 to-rose-500', label: '247K' },
                  { icon: Twitter, color: 'from-blue-400 to-blue-500', label: '89K' },
                  { icon: Youtube, color: 'from-red-500 to-red-600', label: '125K' },
                ].map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${social.color} text-white rounded-lg font-semibold shadow-lg`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{social.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* Profile Stats */}
      <Section title="Profile Statistics" description="User statistics overview">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl">
          {[
            { label: 'Total Deals', value: '24', change: '+12%', icon: TrendingUp, color: 'blue' },
            { label: 'Revenue', value: '$142K', change: '+25%', icon: TrendingUp, color: 'emerald' },
            { label: 'Followers', value: '461K', change: '+8%', icon: User, color: 'purple' },
            { label: 'Engagement', value: '8.4%', change: '+1.2%', icon: Award, color: 'amber' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg"
              >
                <div className={`w-10 h-10 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-emerald-600">{stat.change}</div>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* Profile Completion */}
      <Section title="Profile Completion" description="Progress indicator for profile setup">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg max-w-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Complete Your Profile</h3>
              <p className="text-sm text-gray-600">80% complete - Almost there!</p>
            </div>
            <Badge variant="secondary">2 steps left</Badge>
          </div>

          <Progress value={80} className="mb-6" />

          <div className="space-y-3">
            {[
              { label: 'Add profile picture', completed: true },
              { label: 'Connect social accounts', completed: true },
              { label: 'Add bio and interests', completed: true },
              { label: 'Verify email address', completed: true },
              { label: 'Upload athletic highlights', completed: false },
              { label: 'Complete NIL compliance training', completed: false },
            ].map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  step.completed ? 'bg-emerald-50' : 'bg-gray-50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step.completed ? '✓' : i + 1}
                </div>
                <span
                  className={`font-medium ${
                    step.completed ? 'text-emerald-700' : 'text-gray-700'
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>
            ))}
          </div>

          <Button variant="primary" className="w-full mt-6">
            Continue Setup
          </Button>
        </motion.div>
      </Section>

      {/* Mini Profile Card */}
      <Section title="Mini Profile Card" description="Compact profile display">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-lg max-w-xs"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-xl font-bold text-white">
              MJ
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">Marcus Johnson</h4>
              <p className="text-sm text-gray-600">@marcusj</p>
            </div>
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">24</div>
              <div className="text-xs text-gray-600">Deals</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">461K</div>
              <div className="text-xs text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-900">8.4%</div>
              <div className="text-xs text-gray-600">Eng Rate</div>
            </div>
          </div>

          <Button variant="primary" size="sm" className="w-full">
            View Profile
          </Button>
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
