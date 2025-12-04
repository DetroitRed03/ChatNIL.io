'use client';

import { motion } from 'framer-motion';
import { Mail, Lock, User, Search, DollarSign } from 'lucide-react';
import { useState } from 'react';

export function FormExamples() {
  const [focused, setFocused] = useState<string | null>(null);

  return (
    <div className="w-full max-w-4xl space-y-12">

      {/* Text Inputs */}
      <Section title="Text Inputs" description="Embossed paper texture with elegant focus states">
        <div className="space-y-6 max-w-lg">
          <PremiumInput
            label="Full Name"
            placeholder="Enter your name"
            icon={<User />}
            focused={focused === 'name'}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused(null)}
          />
          <PremiumInput
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail />}
            focused={focused === 'email'}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
          />
          <PremiumInput
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock />}
            focused={focused === 'password'}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
          />
        </div>
      </Section>

      {/* Search Input */}
      <Section title="Search Input" description="Prominent search with instant feedback">
        <div className="max-w-2xl">
          <SearchInput />
        </div>
      </Section>

      {/* Number Input */}
      <Section title="Number Input" description="Stepper controls with smooth animations">
        <div className="max-w-md">
          <NumberInput label="Deal Amount" />
        </div>
      </Section>

      {/* Textarea */}
      <Section title="Textarea" description="Multi-line input with character count">
        <div className="max-w-2xl">
          <PremiumTextarea
            label="Description"
            placeholder="Tell us about yourself..."
            focused={focused === 'description'}
            onFocus={() => setFocused('description')}
            onBlur={() => setFocused(null)}
          />
        </div>
      </Section>

      {/* Toggle Switch */}
      <Section title="Toggle Switch" description="Smooth transitions with premium materials">
        <div className="space-y-4 max-w-lg">
          <ToggleSwitch label="Email Notifications" defaultChecked />
          <ToggleSwitch label="Push Notifications" />
          <ToggleSwitch label="Marketing Updates" />
        </div>
      </Section>

      {/* Checkbox */}
      <Section title="Checkbox" description="Elegant selection with smooth check animation">
        <div className="space-y-4 max-w-lg">
          <PremiumCheckbox label="I agree to the terms and conditions" />
          <PremiumCheckbox label="Subscribe to newsletter" defaultChecked />
          <PremiumCheckbox label="Remember my preferences" />
        </div>
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

function PremiumInput({
  label,
  type = 'text',
  placeholder,
  icon,
  focused,
  onFocus,
  onBlur
}: {
  label: string;
  type?: string;
  placeholder: string;
  icon?: React.ReactNode;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#495057] mb-2 tracking-wide">
        {label}
      </label>
      <motion.div
        animate={focused ? {
          scale: 1.01,
          y: -1
        } : {}}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        className={`
          relative rounded-xl overflow-hidden
          transition-all duration-300
          ${focused ? 'ring-2 ring-[#ea580c] ring-opacity-50' : ''}
        `}
      >
        <div
          className="relative bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] border-2 transition-colors"
          style={{
            borderColor: focused ? '#ea580c' : '#E8E4DF',
            boxShadow: focused
              ? `
                0 4px 12px -2px rgba(234, 88, 12, 0.15),
                inset 2px 2px 4px rgba(0, 0, 0, 0.03)
              `
              : `
                inset 2px 2px 4px rgba(0, 0, 0, 0.03),
                inset -2px -2px 4px rgba(255, 255, 255, 0.8)
              `
          }}
        >
          {icon && (
            <div className={`
              absolute left-4 top-1/2 -translate-y-1/2 transition-colors
              ${focused ? 'text-[#ea580c]' : 'text-[#adb5bd]'}
            `}>
              {icon}
            </div>
          )}
          <input
            type={type}
            placeholder={placeholder}
            onFocus={onFocus}
            onBlur={onBlur}
            className={`
              w-full px-4 py-3 bg-transparent
              text-[#1a1d20] placeholder:text-[#adb5bd]
              focus:outline-none
              ${icon ? 'pl-12' : ''}
            `}
          />
        </div>
      </motion.div>
    </div>
  );
}

function SearchInput() {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      animate={focused ? { scale: 1.01 } : {}}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
      className="relative"
    >
      <div
        className="relative bg-gradient-to-br from-white to-[#FFFBF7] rounded-2xl border-2 transition-all"
        style={{
          borderColor: focused ? '#ea580c' : '#E8E4DF',
          boxShadow: focused
            ? `
              0 8px 24px -4px rgba(234, 88, 12, 0.2),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
            `
            : `
              0 2px 8px -2px rgba(0, 0, 0, 0.05),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
            `
        }}
      >
        <div className="flex items-center px-6 py-4">
          <Search className={`w-6 h-6 transition-colors ${
            focused ? 'text-[#ea580c]' : 'text-[#adb5bd]'
          }`} />
          <input
            type="text"
            placeholder="Search athletes, deals, opportunities..."
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 ml-4 bg-transparent text-lg text-[#1a1d20] placeholder:text-[#adb5bd] focus:outline-none"
          />
        </div>
      </div>
    </motion.div>
  );
}

function NumberInput({ label }: { label: string }) {
  const [value, setValue] = useState(25000);

  return (
    <div>
      <label className="block text-sm font-semibold text-[#495057] mb-2 tracking-wide">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setValue(Math.max(0, value - 1000))}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-[#FFF8F0] border-2 border-[#E8E4DF] text-[#ea580c] font-bold flex items-center justify-center"
          style={{
            boxShadow: `
              0 2px 8px -2px rgba(0, 0, 0, 0.05),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
            `
          }}
        >
          −
        </motion.button>

        <div className="flex-1 relative">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6c757d]" />
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full px-4 py-3 pl-12 text-center text-2xl font-bold text-[#1a1d20] bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] border-2 border-[#E8E4DF] rounded-xl focus:outline-none focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c] focus:ring-opacity-50 transition-all"
            style={{
              boxShadow: `
                inset 2px 2px 4px rgba(0, 0, 0, 0.03),
                inset -2px -2px 4px rgba(255, 255, 255, 0.8)
              `
            }}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setValue(value + 1000)}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ea580c] to-[#92400e] text-white font-bold flex items-center justify-center"
          style={{
            boxShadow: `
              0 4px 12px -2px rgba(234, 88, 12, 0.3),
              inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2)
            `
          }}
        >
          +
        </motion.button>
      </div>
    </div>
  );
}

function PremiumTextarea({
  label,
  placeholder,
  focused,
  onFocus,
  onBlur
}: {
  label: string;
  placeholder: string;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-[#495057] tracking-wide">
          {label}
        </label>
        <span className={`text-xs font-medium ${
          charCount > maxChars * 0.9 ? 'text-[#ea580c]' : 'text-[#adb5bd]'
        }`}>
          {charCount} / {maxChars}
        </span>
      </div>
      <motion.div
        animate={focused ? { scale: 1.005 } : {}}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        className={`
          relative rounded-xl overflow-hidden
          transition-all duration-300
          ${focused ? 'ring-2 ring-[#ea580c] ring-opacity-50' : ''}
        `}
      >
        <div
          className="relative bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] border-2 transition-colors"
          style={{
            borderColor: focused ? '#ea580c' : '#E8E4DF',
            boxShadow: focused
              ? `
                0 4px 12px -2px rgba(234, 88, 12, 0.15),
                inset 2px 2px 4px rgba(0, 0, 0, 0.03)
              `
              : `
                inset 2px 2px 4px rgba(0, 0, 0, 0.03),
                inset -2px -2px 4px rgba(255, 255, 255, 0.8)
              `
          }}
        >
          <textarea
            placeholder={placeholder}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(e) => setCharCount(e.target.value.length)}
            maxLength={maxChars}
            rows={5}
            className="w-full px-4 py-3 bg-transparent text-[#1a1d20] placeholder:text-[#adb5bd] focus:outline-none resize-none"
          />
        </div>
      </motion.div>
    </div>
  );
}

function ToggleSwitch({ label, defaultChecked = false }: {
  label: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <motion.button
      onClick={() => setChecked(!checked)}
      whileHover={{ scale: 1.01 }}
      className="flex items-center justify-between w-full p-4 rounded-xl bg-gradient-to-br from-white to-[#FFFBF7] border-2 border-[#E8E4DF] transition-colors hover:border-[#ea580c]/30"
      style={{
        boxShadow: `
          0 2px 8px -2px rgba(0, 0, 0, 0.05),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
        `
      }}
    >
      <span className="text-[#495057] font-medium">{label}</span>
      <div
        className={`
          relative w-14 h-8 rounded-full transition-all duration-300
          ${checked
            ? 'bg-gradient-to-r from-[#ea580c] to-[#92400e]'
            : 'bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] border-2 border-[#E8E4DF]'
          }
        `}
        style={checked ? {
          boxShadow: `
            0 2px 8px -2px rgba(234, 88, 12, 0.4),
            inset 0 -1px 2px rgba(0, 0, 0, 0.2)
          `
        } : {
          boxShadow: `
            inset 2px 2px 4px rgba(0, 0, 0, 0.05),
            inset -2px -2px 4px rgba(255, 255, 255, 0.8)
          `
        }}
      >
        <motion.div
          animate={{
            x: checked ? 24 : 2
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25
          }}
          className={`absolute top-1 w-6 h-6 rounded-full ${
            checked
              ? 'bg-white'
              : 'bg-gradient-to-br from-white to-[#FFF8F0]'
          }`}
          style={{
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
          }}
        />
      </div>
    </motion.button>
  );
}

function PremiumCheckbox({ label, defaultChecked = false }: {
  label: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <motion.button
      onClick={() => setChecked(!checked)}
      whileHover={{ scale: 1.01 }}
      className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-white to-[#FFFBF7] border-2 border-[#E8E4DF] transition-colors hover:border-[#ea580c]/30 w-full text-left"
      style={{
        boxShadow: `
          0 2px 8px -2px rgba(0, 0, 0, 0.05),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.9)
        `
      }}
    >
      <div
        className={`
          w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
          transition-all duration-300
          ${checked
            ? 'bg-gradient-to-br from-[#ea580c] to-[#92400e]'
            : 'bg-gradient-to-br from-[#FAF6F1] to-[#FFF8F0] border-2 border-[#E8E4DF]'
          }
        `}
        style={checked ? {
          boxShadow: `
            0 2px 8px -2px rgba(234, 88, 12, 0.4),
            inset 0 -1px 2px rgba(0, 0, 0, 0.2)
          `
        } : {
          boxShadow: `
            inset 2px 2px 4px rgba(0, 0, 0, 0.05),
            inset -2px -2px 4px rgba(255, 255, 255, 0.8)
          `
        }}
      >
        {checked && (
          <motion.svg
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20
            }}
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        )}
      </div>
      <span className="text-[#495057] font-medium">{label}</span>
    </motion.button>
  );
}
