'use client';

import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, MapPin, Calendar, DollarSign, Search, Users, Target } from 'lucide-react';
import { useState } from 'react';
import { CreativeSlider } from '@/components/ui/CreativeSlider';
import { NumberStepper } from '@/components/ui/NumberStepper';
import { formatCurrency, formatNumber } from '@/lib/utils';

export function FormExamples() {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Slider state variables
  const [budgetRange, setBudgetRange] = useState<[number, number]>([10000, 50000]);
  const [followers, setFollowers] = useState(50000);
  const [dealValue, setDealValue] = useState(25000);

  return (
    <div className="space-y-12 max-w-3xl">

      {/* Large Input Fields */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Large Input Fields</h3>
        <div className="grid gap-6">

          {/* Text Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your full name"
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl transition-all duration-200 ${
                  focusedField === 'name'
                    ? 'border-orange-500 ring-4 ring-orange-500/20'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="your.email@example.com"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl transition-all duration-200 ${
                  focusedField === 'email'
                    ? 'border-orange-500 ring-4 ring-orange-500/20'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">We'll never share your email with anyone else.</p>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Enter a strong password"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl transition-all duration-200 ${
                  focusedField === 'password'
                    ? 'border-orange-500 ring-4 ring-orange-500/20'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              />
            </div>
          </div>

        </div>
      </section>

      {/* Input Variants */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Input Variants</h3>
        <div className="grid gap-6">

          {/* Phone Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl transition-all duration-200 ${
                  focusedField === 'phone'
                    ? 'border-orange-500 ring-4 ring-orange-500/20'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              />
            </div>
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="City, State"
                onFocus={() => setFocusedField('location')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl transition-all duration-200 ${
                  focusedField === 'location'
                    ? 'border-orange-500 ring-4 ring-orange-500/20'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              />
            </div>
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                onFocus={() => setFocusedField('date')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl transition-all duration-200 ${
                  focusedField === 'date'
                    ? 'border-orange-500 ring-4 ring-orange-500/20'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              />
            </div>
          </div>

        </div>
      </section>

      {/* Select and Textarea */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Select & Textarea</h3>
        <div className="grid gap-6">

          {/* Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sport
            </label>
            <select
              onFocus={() => setFocusedField('sport')}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-4 text-lg border-2 rounded-xl transition-all duration-200 bg-white ${
                focusedField === 'sport'
                  ? 'border-orange-500 ring-4 ring-orange-500/20'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <option value="">Select your sport</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="soccer">Soccer</option>
              <option value="baseball">Baseball</option>
              <option value="volleyball">Volleyball</option>
            </select>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              rows={5}
              placeholder="Tell us about yourself..."
              onFocus={() => setFocusedField('bio')}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-4 text-lg border-2 rounded-xl transition-all duration-200 resize-none ${
                focusedField === 'bio'
                  ? 'border-orange-500 ring-4 ring-orange-500/20'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            />
            <p className="text-sm text-gray-500 mt-2">Maximum 500 characters</p>
          </div>

        </div>
      </section>

      {/* Search and Number Inputs */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Specialized Inputs</h3>
        <div className="grid gap-6">

          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Athletes
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search by name, sport, or school..."
                onFocus={() => setFocusedField('search')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl transition-all duration-200 ${
                  focusedField === 'search'
                    ? 'border-orange-500 ring-4 ring-orange-500/20'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              />
            </div>
          </div>

          {/* Number Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deal Value
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                placeholder="0.00"
                onFocus={() => setFocusedField('amount')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl transition-all duration-200 ${
                  focusedField === 'amount'
                    ? 'border-orange-500 ring-4 ring-orange-500/20'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              />
            </div>
          </div>

        </div>
      </section>

      {/* Validation States */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Validation States</h3>
        <div className="grid gap-6">

          {/* Success State */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email (Valid)
            </label>
            <input
              type="email"
              value="athlete@example.com"
              readOnly
              className="w-full px-4 py-4 text-lg border-2 border-green-500 rounded-xl bg-green-50"
            />
            <p className="text-sm text-green-600 mt-2 font-medium">✓ Email is valid</p>
          </div>

          {/* Error State */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email (Invalid)
            </label>
            <input
              type="email"
              value="invalid-email"
              readOnly
              className="w-full px-4 py-4 text-lg border-2 border-red-500 rounded-xl bg-red-50"
            />
            <p className="text-sm text-red-600 mt-2 font-medium">✗ Please enter a valid email address</p>
          </div>

        </div>
      </section>

      {/* Interactive Value Selectors */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Interactive Value Selectors</h3>
        <p className="text-gray-600 mb-8">Advanced slider controls with animated gradients, snap points, and visual feedback</p>

        <div className="space-y-10">

          {/* Budget Range Slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border-2 border-gray-200 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Budget Range Slider</h4>
                <p className="text-sm text-gray-600">Dual-thumb slider with snap points at common NIL deal values</p>
              </div>
            </div>

            <CreativeSlider
              label="NIL Deal Budget Range"
              min={1000}
              max={100000}
              step={1000}
              value={budgetRange}
              onChange={(val) => setBudgetRange(val as [number, number])}
              formatValue={(val) => formatCurrency(val)}
              range
              snapPoints={[5000, 10000, 25000, 50000, 75000]}
              showValue
              gradientColors={['#f97316', '#f59e0b']}
            />

            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>Selected Range:</strong> {formatCurrency(budgetRange[0])} - {formatCurrency(budgetRange[1])}
              </p>
              <p className="text-xs text-orange-600 mt-2">
                💡 Drag the thumbs to adjust your budget range. They snap to common deal values!
              </p>
            </div>
          </motion.div>

          {/* Follower Count Slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border-2 border-gray-200 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Follower Count Filter</h4>
                <p className="text-sm text-gray-600">Find athletes by minimum social media following</p>
              </div>
            </div>

            <CreativeSlider
              label="Minimum Follower Count"
              min={0}
              max={1000000}
              step={5000}
              value={followers}
              onChange={(val) => setFollowers(val as number)}
              formatValue={(val) => formatNumber(val)}
              showValue
              gradientColors={['#f97316', '#f59e0b']}
            />

            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>Current Value:</strong> {formatNumber(followers)} followers
              </p>
              <p className="text-xs text-orange-600 mt-2">
                💡 Perfect for brand discovery - filter athletes by their social reach
              </p>
            </div>
          </motion.div>

          {/* Deal Value Number Stepper */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border-2 border-gray-200 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Circular Value Selector</h4>
                <p className="text-sm text-gray-600">iPod-style control for precise deal value selection</p>
              </div>
            </div>

            <div className="flex justify-center py-6">
              <NumberStepper
                label="Deal Value"
                value={dealValue}
                onChange={setDealValue}
                min={500}
                max={100000}
                step={500}
                unit="currency"
                variant="circular"
              />
            </div>

            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>Selected:</strong> {formatCurrency(dealValue)}
              </p>
              <p className="text-xs text-orange-600 mt-2">
                💡 Hold the +/- buttons to increment faster, or drag the circle to adjust
              </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Complete Form Example */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Complete Form</h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl"
        >
          <h4 className="text-xl font-bold text-gray-900 mb-6">Create Your Profile</h4>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl hover:border-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl hover:border-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="john.doe@example.com"
                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl hover:border-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sport
              </label>
              <select className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl hover:border-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-200 bg-white">
                <option value="">Select your sport</option>
                <option value="basketball">Basketball</option>
                <option value="football">Football</option>
                <option value="soccer">Soccer</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-orange-500/30 transition-colors duration-200 text-lg"
            >
              Create Profile
            </motion.button>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
