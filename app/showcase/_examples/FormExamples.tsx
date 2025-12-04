'use client';

import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  Mail,
  Lock,
  Search,
  DollarSign,
  Calendar,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';

export function FormExamples() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedOption, setSelectedOption] = useState('option1');
  const [sliderValue, setSliderValue] = useState(50);

  return (
    <div className="w-full space-y-12">
      {/* Text Inputs */}
      <Section title="Text Inputs" description="Standard input fields">
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <Input
              type="password"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search athletes, brands..."
            />
          </div>
        </div>
      </Section>

      {/* Specialized Inputs */}
      <Section title="Specialized Inputs" description="Input fields for specific data types">
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Deal Value
            </label>
            <Input
              type="number"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Date
            </label>
            <Input
              type="date"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </Section>

      {/* Textarea */}
      <Section title="Textarea" description="Multi-line text input">
        <div className="max-w-md">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Message
          </label>
          <div className="relative">
            <textarea
              className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
              rows={4}
              placeholder="Write your message here..."
            />
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </Section>

      {/* Select Dropdown */}
      <Section title="Select Dropdown" description="Selection from a list">
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Sport
            </label>
            <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white">
              <option>Select a sport</option>
              <option>Basketball</option>
              <option>Football</option>
              <option>Baseball</option>
              <option>Soccer</option>
              <option>Volleyball</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Class Year
            </label>
            <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white">
              <option>Freshman</option>
              <option>Sophomore</option>
              <option>Junior</option>
              <option>Senior</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Radio Buttons */}
      <Section title="Radio Buttons" description="Single selection from options">
        <div className="space-y-3 max-w-md">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Account Type
          </label>
          {[
            { value: 'athlete', label: 'Athlete', description: 'For student athletes' },
            { value: 'brand', label: 'Brand', description: 'For companies and sponsors' },
            { value: 'agency', label: 'Agency', description: 'For NIL agencies' },
          ].map((option) => (
            <motion.label
              key={option.value}
              whileHover={{ scale: 1.02 }}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedOption === option.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="accountType"
                value={option.value}
                checked={selectedOption === option.value}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="mt-1 w-4 h-4 text-primary-500"
              />
              <div>
                <div className="font-semibold text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </motion.label>
          ))}
        </div>
      </Section>

      {/* Checkboxes */}
      <Section title="Checkboxes" description="Multiple selection options">
        <div className="space-y-3 max-w-md">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Interests
          </label>
          {['Fashion & Apparel', 'Sports Equipment', 'Gaming & Esports', 'Food & Beverage'].map(
            (interest) => (
              <motion.label
                key={interest}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all"
              >
                <input type="checkbox" className="w-5 h-5 text-primary-500 rounded" />
                <span className="font-medium text-gray-900">{interest}</span>
              </motion.label>
            )
          )}
        </div>
      </Section>

      {/* Toggle Switch */}
      <Section title="Toggle Switch" description="On/off switches">
        <div className="space-y-6 max-w-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">Email Notifications</div>
              <div className="text-sm text-gray-600">Receive email updates about your deals</div>
            </div>
            <Switch checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">Public Profile</div>
              <div className="text-sm text-gray-600">Make your profile visible to brands</div>
            </div>
            <Switch checked={true} onChange={() => {}} />
          </div>

          <div className="flex items-center justify-between opacity-50">
            <div>
              <div className="font-semibold text-gray-900">Premium Features</div>
              <div className="text-sm text-gray-600">
                Disabled <Badge variant="warning" className="ml-2">Pro Only</Badge>
              </div>
            </div>
            <Switch checked={false} onChange={() => {}} disabled />
          </div>
        </div>
      </Section>

      {/* Range Slider */}
      <Section title="Range Slider" description="Numeric range selection">
        <div className="max-w-md space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-900">Deal Budget Range</label>
              <span className="text-lg font-bold text-primary-600">${sliderValue}K</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>$0</span>
              <span>$100K</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Form with Validation States */}
      <Section title="Input States" description="Valid, invalid, and disabled states">
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Valid Input
            </label>
            <Input
              type="text"
              value="john@example.com"
              className="border-emerald-500 focus:ring-emerald-500"
            />
            <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
              ✓ Valid email address
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Invalid Input
            </label>
            <Input
              type="text"
              value="invalid-email"
              className="border-red-500 focus:ring-red-500"
            />
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              ✗ Please enter a valid email address
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Disabled Input
            </label>
            <Input
              type="text"
              value="Disabled field"
              disabled
              className="opacity-50 cursor-not-allowed"
            />
          </div>
        </div>
      </Section>

      {/* Complete Form Example */}
      <Section title="Complete Form" description="Full form with multiple field types">
        <form className="max-w-md space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                First Name
              </label>
              <Input type="text" placeholder="John" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Last Name
              </label>
              <Input type="text" placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email
            </label>
            <Input type="email" placeholder="john@example.com" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Sport
            </label>
            <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white">
              <option>Select your sport</option>
              <option>Basketball</option>
              <option>Football</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" className="w-5 h-5 text-primary-500 rounded" />
            <label className="text-sm text-gray-700">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" className="flex-1">
              Submit
            </Button>
          </div>
        </form>
      </Section>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border-radius: 50%;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
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
      <div className="p-8 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
        {children}
      </div>
    </motion.div>
  );
}
