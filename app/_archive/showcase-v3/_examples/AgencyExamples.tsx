'use client';

import { motion } from 'framer-motion';
import { Award, Building2, Star, TrendingUp, Users, Zap } from 'lucide-react';

export function AgencyExamples() {
  return (
    <div className="w-full max-w-6xl space-y-12">

      {/* Premium Agency Card */}
      <Section title="Premium Agency Card" description="High-end branding with luxury materials">
        <div className="max-w-md mx-auto">
          <PremiumAgencyCard />
        </div>
      </Section>

      {/* Agency Stats Grid */}
      <Section title="Agency Performance" description="Sophisticated metrics dashboard">
        <AgencyStatsGrid />
      </Section>

      {/* Featured Agencies */}
      <Section title="Featured Agencies" description="Elite partner showcase">
        <FeaturedAgencies />
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

function PremiumAgencyCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative"
    >
      <div
        className="relative bg-gradient-to-br from-white via-[#FFFBF7] to-white rounded-3xl border-2 border-[#E8E4DF] overflow-hidden"
        style={{
          boxShadow: `
            0 20px 50px -10px rgba(234, 88, 12, 0.15),
            0 8px 24px -4px rgba(234, 88, 12, 0.1),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
          `
        }}
      >
        {/* Premium badge ribbon */}
        <div className="absolute top-0 right-0 z-10">
          <motion.div
            initial={{ x: 100, y: -100, rotate: 45 }}
            animate={{ x: 0, y: 0, rotate: 45 }}
            transition={{
              type: 'spring',
              stiffness: 150,
              damping: 40,
              delay: 0.3
            }}
            className="relative"
          >
            <div
              className="w-32 h-32 bg-gradient-to-br from-[#fcd34d] via-[#f59e0b] to-[#ea580c] flex items-center justify-center"
              style={{
                boxShadow: `
                  0 8px 24px -4px rgba(252, 211, 77, 0.5),
                  inset 0 -2px 6px 0 rgba(0, 0, 0, 0.2)
                `
              }}
            >
              <motion.div
                animate={{ rotate: -45 }}
                className="text-white font-bold text-xs tracking-widest"
              >
                ELITE
              </motion.div>
            </div>
            {/* Holographic shimmer */}
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  'linear-gradient(45deg, rgba(255,0,0,0.3) 0%, transparent 50%)',
                  'linear-gradient(90deg, rgba(0,255,0,0.3) 0%, transparent 50%)',
                  'linear-gradient(135deg, rgba(0,0,255,0.3) 0%, transparent 50%)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        </div>

        {/* Header */}
        <div className="relative p-8 pb-6">
          <div className="flex items-start gap-5 mb-6">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
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
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#ea580c] via-[#c2410c] to-[#92400e] flex items-center justify-center relative overflow-hidden"
                style={{
                  boxShadow: `
                    0 8px 24px -4px rgba(234, 88, 12, 0.4),
                    inset 0 -3px 8px 0 rgba(0, 0, 0, 0.3),
                    inset 0 2px 4px 0 rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                <Building2 className="w-12 h-12 text-white relative z-10" />

                {/* Gold foil shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                    repeatDelay: 1
                  }}
                />
              </div>
            </motion.div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#1a1d20] to-[#495057] bg-clip-text text-transparent mb-2">
                Elite Sports Agency
              </h3>
              <p className="text-[#6c757d] mb-3 leading-relaxed">
                Premier NIL representation for top-tier collegiate athletes
              </p>

              {/* Verified badge */}
              <div className="flex items-center gap-2">
                <div
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#10b981] to-[#059669] flex items-center gap-1.5"
                  style={{
                    boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Award className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-bold text-white">VERIFIED PARTNER</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Athletes', value: '150+', icon: Users },
              { label: 'Active Deals', value: '420', icon: Zap },
              { label: 'Avg Deal Value', value: '$35K', icon: TrendingUp },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.4 + index * 0.1,
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="text-center p-4 rounded-xl bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] border border-[#E8E4DF]"
                  style={{
                    boxShadow: `
                      inset 2px 2px 4px rgba(0, 0, 0, 0.03),
                      inset -2px -2px 4px rgba(255, 255, 255, 0.8)
                    `
                  }}
                >
                  <Icon className="w-5 h-5 text-[#ea580c] mx-auto mb-2" />
                  <div className="text-xl font-bold text-[#1a1d20] tracking-tight mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#6c757d] font-medium uppercase tracking-wide">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="border-t-2 border-[#E8E4DF] px-8 py-5 bg-gradient-to-br from-[#FFF8F0] to-white relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-[#ea580c] via-[#c2410c] to-[#92400e] text-white font-bold py-4 rounded-xl relative overflow-hidden group"
            style={{
              boxShadow: `
                0 4px 12px -2px rgba(234, 88, 12, 0.4),
                inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2)
              `
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative tracking-wide text-lg">Request Partnership</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function AgencyStatsGrid() {
  const metrics = [
    { label: 'Total Deal Volume', value: '$12.4M', change: '+34%', icon: TrendingUp },
    { label: 'Active Athletes', value: '2,840', change: '+18%', icon: Users },
    { label: 'Success Rate', value: '94.2%', change: '+5%', icon: Star },
    { label: 'Partner Brands', value: '186', change: '+22%', icon: Building2 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;

        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{ y: -3, scale: 1.02 }}
          >
            <div
              className="bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] rounded-2xl border-2 border-[#E8E4DF] p-5 relative"
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

                <span className="text-xs font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded-full">
                  {metric.change}
                </span>
              </div>

              <p className="text-xs text-[#6c757d] font-medium uppercase tracking-wide mb-2">
                {metric.label}
              </p>

              <h4 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#1a1d20] to-[#495057] bg-clip-text text-transparent">
                {metric.value}
              </h4>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function FeaturedAgencies() {
  const agencies = [
    { name: 'Premier Sports Group', tier: 'Platinum', athletes: 245, rating: 4.9 },
    { name: 'Elite Athlete Partners', tier: 'Gold', athletes: 182, rating: 4.8 },
    { name: 'Victory Management', tier: 'Gold', athletes: 156, rating: 4.7 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {agencies.map((agency, index) => (
        <motion.div
          key={agency.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: index * 0.15,
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          whileHover={{ y: -4, scale: 1.03 }}
        >
          <div
            className="bg-gradient-to-br from-white to-[#FFFBF7] rounded-2xl border-2 border-[#E8E4DF] p-6 relative overflow-hidden"
            style={{
              boxShadow: `
                0 6px 20px -4px rgba(234, 88, 12, 0.1),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
              `
            }}
          >
            {/* Tier badge */}
            <div
              className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                agency.tier === 'Platinum'
                  ? 'bg-gradient-to-r from-[#fcd34d] to-[#f59e0b] text-[#92400e]'
                  : 'bg-gradient-to-r from-[#ea580c] to-[#92400e] text-white'
              }`}
              style={{
                boxShadow: '0 2px 8px -2px rgba(234, 88, 12, 0.3)'
              }}
            >
              {agency.tier}
            </div>

            {/* Logo placeholder */}
            <div
              className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] border-2 border-[#E8E4DF] flex items-center justify-center mb-4"
              style={{
                boxShadow: `
                  inset 2px 2px 4px rgba(0, 0, 0, 0.03),
                  inset -2px -2px 4px rgba(255, 255, 255, 0.8)
                `
              }}
            >
              <Building2 className="w-8 h-8 text-[#ea580c]" />
            </div>

            <h4 className="font-bold text-[#1a1d20] mb-4 pr-20">{agency.name}</h4>

            {/* Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6c757d]">Athletes</span>
                <span className="font-bold text-[#1a1d20]">{agency.athletes}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6c757d]">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#fcd34d]" fill="#fcd34d" />
                  <span className="font-bold text-[#1a1d20]">{agency.rating}</span>
                </div>
              </div>
            </div>

            {/* View button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 py-2.5 rounded-lg bg-gradient-to-br from-[#ea580c]/10 to-[#92400e]/10 text-[#ea580c] font-semibold border-2 border-[#ea580c]/20 hover:border-[#ea580c]/40 transition-colors"
            >
              View Profile
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
