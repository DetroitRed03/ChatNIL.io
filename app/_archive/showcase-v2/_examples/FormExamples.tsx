'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Search, DollarSign, Calendar, Check } from 'lucide-react';
import { SPRING_CONFIGS } from '@/lib/animations/core/animation-tokens';
import { useState } from 'react';

export function FormExamples() {
  const [focused, setFocused] = useState<string | null>(null);
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    search: '',
    amount: '',
    date: '',
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12">

      {/* Text Inputs */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
          Text Inputs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Name Input with Neon Glow */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 tracking-wider uppercase">
              Full Name
            </label>
            <div className="relative">
              <motion.div
                className={`
                  absolute inset-0 rounded-2xl transition-all
                  ${focused === 'name'
                    ? 'bg-primary-500/20 shadow-[0_0_30px_rgba(249,115,22,0.6)]'
                    : 'bg-transparent'
                  }
                `}
                animate={focused === 'name' ? {
                  boxShadow: [
                    '0 0 30px rgba(249, 115, 22, 0.6)',
                    '0 0 40px rgba(249, 115, 22, 0.8)',
                    '0 0 30px rgba(249, 115, 22, 0.6)',
                  ],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative flex items-center">
                <User className={`
                  absolute left-4 w-5 h-5 transition-all
                  ${focused === 'name' ? 'text-primary-400' : 'text-gray-500'}
                `} />
                <input
                  type="text"
                  value={values.name}
                  onChange={(e) => setValues({ ...values, name: e.target.value })}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  placeholder="Marcus Johnson"
                  className={`
                    w-full pl-12 pr-4 py-4 rounded-2xl font-bold
                    bg-secondary-800/50 backdrop-blur-sm
                    border-2 transition-all
                    text-white placeholder-gray-500
                    focus:outline-none
                    ${focused === 'name'
                      ? 'border-primary-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                      : 'border-primary-500/30 hover:border-primary-500/50'
                    }
                  `}
                />
              </div>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 tracking-wider uppercase">
              Email Address
            </label>
            <div className="relative">
              <motion.div
                className={`
                  absolute inset-0 rounded-2xl transition-all
                  ${focused === 'email'
                    ? 'bg-accent-500/20 shadow-[0_0_30px_rgba(251,191,36,0.6)]'
                    : 'bg-transparent'
                  }
                `}
                animate={focused === 'email' ? {
                  boxShadow: [
                    '0 0 30px rgba(251, 191, 36, 0.6)',
                    '0 0 40px rgba(251, 191, 36, 0.8)',
                    '0 0 30px rgba(251, 191, 36, 0.6)',
                  ],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative flex items-center">
                <Mail className={`
                  absolute left-4 w-5 h-5 transition-all
                  ${focused === 'email' ? 'text-accent-400' : 'text-gray-500'}
                `} />
                <input
                  type="email"
                  value={values.email}
                  onChange={(e) => setValues({ ...values, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="athlete@example.com"
                  className={`
                    w-full pl-12 pr-4 py-4 rounded-2xl font-bold
                    bg-secondary-800/50 backdrop-blur-sm
                    border-2 transition-all
                    text-white placeholder-gray-500
                    focus:outline-none
                    ${focused === 'email'
                      ? 'border-accent-500 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                      : 'border-accent-500/30 hover:border-accent-500/50'
                    }
                  `}
                />
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 tracking-wider uppercase">
              Password
            </label>
            <div className="relative">
              <motion.div
                className={`
                  absolute inset-0 rounded-2xl transition-all
                  ${focused === 'password'
                    ? 'bg-success-500/20 shadow-[0_0_30px_rgba(16,185,129,0.6)]'
                    : 'bg-transparent'
                  }
                `}
              />
              <div className="relative flex items-center">
                <Lock className={`
                  absolute left-4 w-5 h-5 transition-all
                  ${focused === 'password' ? 'text-success-400' : 'text-gray-500'}
                `} />
                <input
                  type="password"
                  value={values.password}
                  onChange={(e) => setValues({ ...values, password: e.target.value })}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className={`
                    w-full pl-12 pr-4 py-4 rounded-2xl font-bold
                    bg-secondary-800/50 backdrop-blur-sm
                    border-2 transition-all
                    text-white placeholder-gray-500
                    focus:outline-none
                    ${focused === 'password'
                      ? 'border-success-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : 'border-success-500/30 hover:border-success-500/50'
                    }
                  `}
                />
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 tracking-wider uppercase">
              Search Athletes
            </label>
            <div className="relative">
              <motion.div
                className={`
                  absolute inset-0 rounded-2xl transition-all
                  ${focused === 'search'
                    ? 'bg-primary-500/20 shadow-[0_0_30px_rgba(249,115,22,0.6)]'
                    : 'bg-transparent'
                  }
                `}
              />
              <div className="relative flex items-center">
                <Search className={`
                  absolute left-4 w-5 h-5 transition-all
                  ${focused === 'search' ? 'text-primary-400' : 'text-gray-500'}
                `} />
                <input
                  type="text"
                  value={values.search}
                  onChange={(e) => setValues({ ...values, search: e.target.value })}
                  onFocus={() => setFocused('search')}
                  onBlur={() => setFocused(null)}
                  placeholder="Search by name or sport..."
                  className={`
                    w-full pl-12 pr-4 py-4 rounded-2xl font-bold
                    bg-secondary-800/50 backdrop-blur-sm
                    border-2 transition-all
                    text-white placeholder-gray-500
                    focus:outline-none
                    ${focused === 'search'
                      ? 'border-primary-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                      : 'border-primary-500/30 hover:border-primary-500/50'
                    }
                  `}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Special Inputs */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-accent-500 to-primary-500 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
          Special Inputs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 tracking-wider uppercase">
              Deal Amount
            </label>
            <div className="relative">
              <div className="relative flex items-center">
                <DollarSign className={`
                  absolute left-4 w-5 h-5 transition-all
                  ${focused === 'amount' ? 'text-accent-400' : 'text-gray-500'}
                `} />
                <input
                  type="number"
                  value={values.amount}
                  onChange={(e) => setValues({ ...values, amount: e.target.value })}
                  onFocus={() => setFocused('amount')}
                  onBlur={() => setFocused(null)}
                  placeholder="5000"
                  className={`
                    w-full pl-12 pr-4 py-4 rounded-2xl font-bold text-2xl
                    bg-secondary-800/50 backdrop-blur-sm
                    border-2 transition-all
                    text-accent-400 placeholder-gray-500
                    focus:outline-none
                    ${focused === 'amount'
                      ? 'border-accent-500 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                      : 'border-accent-500/30 hover:border-accent-500/50'
                    }
                  `}
                />
              </div>
            </div>
          </div>

          {/* Date Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 tracking-wider uppercase">
              Start Date
            </label>
            <div className="relative">
              <div className="relative flex items-center">
                <Calendar className={`
                  absolute left-4 w-5 h-5 transition-all
                  ${focused === 'date' ? 'text-primary-400' : 'text-gray-500'}
                `} />
                <input
                  type="date"
                  value={values.date}
                  onChange={(e) => setValues({ ...values, date: e.target.value })}
                  onFocus={() => setFocused('date')}
                  onBlur={() => setFocused(null)}
                  className={`
                    w-full pl-12 pr-4 py-4 rounded-2xl font-bold
                    bg-secondary-800/50 backdrop-blur-sm
                    border-2 transition-all
                    text-white
                    focus:outline-none
                    ${focused === 'date'
                      ? 'border-primary-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                      : 'border-primary-500/30 hover:border-primary-500/50'
                    }
                  `}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Select & Checkbox */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-success-500 to-accent-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
          Select & Toggle
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Custom Select */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 tracking-wider uppercase">
              Sport Category
            </label>
            <select
              onFocus={() => setFocused('select')}
              onBlur={() => setFocused(null)}
              className={`
                w-full px-4 py-4 rounded-2xl font-bold
                bg-secondary-800/50 backdrop-blur-sm
                border-2 transition-all
                text-white
                focus:outline-none
                ${focused === 'select'
                  ? 'border-primary-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                  : 'border-primary-500/30 hover:border-primary-500/50'
                }
              `}
            >
              <option value="">Select a sport...</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="baseball">Baseball</option>
              <option value="soccer">Soccer</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 tracking-wider uppercase">
              Preferences
            </label>
            <div className="space-y-3">
              {['Get email updates', 'Allow messaging', 'Public profile'].map((label, index) => (
                <CheckboxOption key={label} label={label} delay={index * 0.1} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Textarea */}
      <div>
        <h3 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-primary-500 to-success-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
          Text Area
        </h3>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 tracking-wider uppercase">
            Bio / Description
          </label>
          <div className="relative">
            <motion.div
              className={`
                absolute inset-0 rounded-2xl transition-all
                ${focused === 'textarea'
                  ? 'bg-primary-500/20 shadow-[0_0_30px_rgba(249,115,22,0.6)]'
                  : 'bg-transparent'
                }
              `}
            />
            <textarea
              onFocus={() => setFocused('textarea')}
              onBlur={() => setFocused(null)}
              placeholder="Tell us about yourself and your athletic journey..."
              rows={6}
              className={`
                relative w-full px-4 py-4 rounded-2xl font-bold
                bg-secondary-800/50 backdrop-blur-sm
                border-2 transition-all
                text-white placeholder-gray-500
                focus:outline-none resize-none
                ${focused === 'textarea'
                  ? 'border-primary-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                  : 'border-primary-500/30 hover:border-primary-500/50'
                }
              `}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

function CheckboxOption({ label, delay = 0 }: { label: string; delay?: number }) {
  const [checked, setChecked] = useState(false);

  return (
    <motion.label
      className="flex items-center gap-3 cursor-pointer group"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, ...SPRING_CONFIGS.energetic.bouncy }}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="sr-only"
        />
        <motion.div
          className={`
            w-6 h-6 rounded-lg border-2 transition-all
            ${checked
              ? 'bg-gradient-to-br from-primary-500 to-accent-500 border-primary-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]'
              : 'bg-secondary-800 border-primary-500/50 group-hover:border-primary-500'
            }
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={SPRING_CONFIGS.energetic.bouncy}
                className="w-full h-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-secondary-900" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <span className="text-white font-bold">{label}</span>
    </motion.label>
  );
}
