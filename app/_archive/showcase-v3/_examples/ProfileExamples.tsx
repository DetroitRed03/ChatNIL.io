'use client';

import { motion } from 'framer-motion';
import {
  Award,
  Briefcase,
  Calendar,
  Instagram,
  MapPin,
  TrendingUp,
  Twitter,
  Users,
  Youtube
} from 'lucide-react';

export function ProfileExamples() {
  return (
    <div className="w-full max-w-6xl space-y-12">

      {/* Executive Profile Header */}
      <Section title="Executive Profile Header" description="Premium layout with professional polish">
        <ExecutiveHeader />
      </Section>

      {/* Stats Overview */}
      <Section title="Performance Stats" description="Sophisticated metrics display">
        <StatsOverview />
      </Section>

      {/* Social Showcase */}
      <Section title="Social Media Showcase" description="Elegant platform presentation">
        <SocialShowcase />
      </Section>

    </div>
  );
}

// Components

function Section({ title, description, children }: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-[#1a1d20] tracking-tight mb-1">{title}</h3>
        <p className="text-[#6c757d]">{description}</p>
      </div>
      <div
        className="bg-gradient-to-br from-white via-[#FFFBF7] to-white rounded-2xl border-2 border-[#E8E4DF] p-8"
        style={{
          boxShadow: `
            0 4px 12px -2px rgba(234, 88, 12, 0.05),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
          `
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ExecutiveHeader() {
  return (
    <div className="relative">
      {/* Cover with pattern */}
      <div
        className="h-48 rounded-2xl bg-gradient-to-br from-[#ea580c] via-[#c2410c] to-[#92400e] relative overflow-hidden mb-20"
        style={{
          boxShadow: `
            0 8px 24px -4px rgba(234, 88, 12, 0.25),
            inset 0 -2px 6px 0 rgba(0, 0, 0, 0.2)
          `
        }}
      >
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        {/* Profile Image */}
        <div className="absolute -bottom-16 left-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 150,
              damping: 40,
              delay: 0.2
            }}
            className="relative"
          >
            <div
              className="w-32 h-32 rounded-3xl bg-gradient-to-br from-white to-[#FFF8F0] border-4 border-white overflow-hidden"
              style={{
                boxShadow: `
                  0 12px 32px -6px rgba(0, 0, 0, 0.2),
                  0 4px 12px -2px rgba(0, 0, 0, 0.15),
                  inset 0 -2px 4px 0 rgba(0, 0, 0, 0.05)
                `
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Verified badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 35,
                delay: 0.4
              }}
              className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-[#fcd34d] to-[#f59e0b] flex items-center justify-center border-3 border-white"
              style={{
                boxShadow: `
                  0 4px 12px -2px rgba(252, 211, 77, 0.5),
                  inset 0 -2px 4px 0 rgba(0, 0, 0, 0.1)
                `
              }}
            >
              <Award className="w-6 h-6 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#1a1d20] to-[#495057] bg-clip-text text-transparent mb-2">
              Alexander Thompson
            </h2>
            <div className="flex items-center gap-4 text-[#6c757d]">
              <span className="flex items-center gap-1.5 font-medium">
                <Briefcase className="w-4 h-4 text-[#ea580c]" />
                Wide Receiver
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#ea580c]" />
                University of Texas
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#ea580c]" />
                Class of 2025
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3 rounded-full font-bold bg-gradient-to-r from-[#ea580c] via-[#c2410c] to-[#92400e] text-white relative overflow-hidden group"
            style={{
              boxShadow: `
                0 4px 12px -2px rgba(234, 88, 12, 0.4),
                inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2)
              `
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative tracking-wide">Connect</span>
          </motion.button>
        </div>

        {/* Bio */}
        <p className="text-[#495057] leading-relaxed max-w-3xl mb-6">
          Elite athlete with proven track record in high-performance sports marketing.
          Specializing in brand partnerships and authentic storytelling across digital platforms.
        </p>

        {/* Quick Stats */}
        <div className="flex items-center gap-6">
          {[
            { label: 'Following', value: '2.4K' },
            { label: 'Followers', value: '156K' },
            { label: 'Active Deals', value: '8' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.5 + index * 0.1,
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-[#ea580c] tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm text-[#6c757d] font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsOverview() {
  const stats = [
    {
      label: 'Fair Market Value',
      value: '$68,500',
      change: '+15.2%',
      trend: 'up',
      icon: TrendingUp
    },
    {
      label: 'Total Reach',
      value: '2.8M',
      change: '+23.1%',
      trend: 'up',
      icon: Users
    },
    {
      label: 'Engagement Rate',
      value: '7.2%',
      change: '+2.4%',
      trend: 'up',
      icon: Award
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="relative"
          >
            <div
              className="bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] rounded-2xl border-2 border-[#E8E4DF] p-6 relative overflow-hidden"
              style={{
                boxShadow: `
                  inset 2px 2px 4px rgba(0, 0, 0, 0.03),
                  inset -2px -2px 4px rgba(255, 255, 255, 0.8)
                `
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#92400e] flex items-center justify-center"
                  style={{
                    boxShadow: `
                      0 4px 12px -2px rgba(234, 88, 12, 0.3),
                      inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2)
                    `
                  }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div
                  className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#10b981] to-[#059669] flex items-center gap-1"
                  style={{
                    boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <TrendingUp className="w-3 h-3 text-white" />
                  <span className="text-xs font-bold text-white">{stat.change}</span>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-sm text-[#6c757d] font-medium tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>

              <h4 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#1a1d20] to-[#495057] bg-clip-text text-transparent">
                {stat.value}
              </h4>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function SocialShowcase() {
  const platforms = [
    {
      name: 'Instagram',
      handle: '@alexthompson',
      followers: '85.2K',
      engagement: '8.4%',
      icon: Instagram,
      gradient: 'from-purple-500 to-pink-500',
      glow: 'rgba(168, 85, 247, 0.3)'
    },
    {
      name: 'Twitter',
      handle: '@alex_thompson',
      followers: '43.8K',
      engagement: '5.2%',
      icon: Twitter,
      gradient: 'from-blue-400 to-blue-600',
      glow: 'rgba(59, 130, 246, 0.3)'
    },
    {
      name: 'YouTube',
      handle: 'Alex Thompson',
      followers: '27.4K',
      engagement: '12.8%',
      icon: Youtube,
      gradient: 'from-red-500 to-red-700',
      glow: 'rgba(239, 68, 68, 0.3)'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {platforms.map((platform, index) => {
        const Icon = platform.icon;

        return (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.1,
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative"
          >
            <div
              className="bg-gradient-to-br from-white to-[#FFFBF7] rounded-2xl border-2 border-[#E8E4DF] p-6 relative overflow-hidden"
              style={{
                boxShadow: `
                  0 4px 12px -2px ${platform.glow},
                  inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
                `
              }}
            >
              <div className="text-center mb-4">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center mx-auto mb-3`}
                  style={{
                    boxShadow: `
                      0 6px 20px -4px ${platform.glow},
                      inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2)
                    `
                  }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-[#1a1d20] mb-1">{platform.name}</h4>
                <p className="text-sm text-[#6c757d]">{platform.handle}</p>
              </div>

              <div className="space-y-3">
                <div
                  className="flex items-center justify-between px-4 py-2 rounded-lg bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0]"
                  style={{
                    boxShadow: `
                      inset 1px 1px 3px rgba(0, 0, 0, 0.03),
                      inset -1px -1px 3px rgba(255, 255, 255, 0.8)
                    `
                  }}
                >
                  <span className="text-xs text-[#6c757d] font-medium">Followers</span>
                  <span className="text-sm font-bold text-[#1a1d20]">{platform.followers}</span>
                </div>

                <div
                  className="flex items-center justify-between px-4 py-2 rounded-lg bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0]"
                  style={{
                    boxShadow: `
                      inset 1px 1px 3px rgba(0, 0, 0, 0.03),
                      inset -1px -1px 3px rgba(255, 255, 255, 0.8)
                    `
                  }}
                >
                  <span className="text-xs text-[#6c757d] font-medium">Engagement</span>
                  <span className="text-sm font-bold text-[#10b981]">{platform.engagement}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
