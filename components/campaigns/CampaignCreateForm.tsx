/**
 * Campaign Creation Form Component
 *
 * Professional campaign creation form with validation and warm aesthetic.
 * Used by agencies to create new NIL campaigns.
 *
 * Features:
 * - Campaign name, description, type
 * - Date range selection
 * - Budget input
 * - Target sports selection
 * - Form validation
 * - Loading and error states
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Rocket, Calendar, DollarSign, Target, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface CampaignFormData {
  name: string;
  description: string;
  campaign_type: 'social_media' | 'endorsement' | 'event' | 'product_launch';
  start_date: string;
  end_date: string;
  total_budget: number;
  target_sports: string[];
}

const CAMPAIGN_TYPES = [
  { value: 'social_media', label: 'Social Media Campaign', description: 'Multi-platform social content' },
  { value: 'endorsement', label: 'Brand Endorsement', description: 'Long-term brand partnership' },
  { value: 'event', label: 'Event Activation', description: 'In-person or virtual events' },
  { value: 'product_launch', label: 'Product Launch', description: 'New product introduction' },
];

const SPORTS_OPTIONS = [
  'Football',
  'Basketball',
  'Baseball',
  'Soccer',
  'Track & Field',
  'Swimming',
  'Volleyball',
  'Tennis',
  'Golf',
  'Softball',
  'Lacrosse',
  'Wrestling',
  'Gymnastics',
  'Cross Country',
];

export function CampaignCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    campaign_type: 'social_media',
    start_date: '',
    end_date: '',
    total_budget: 0,
    target_sports: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate
      if (!formData.name || !formData.description) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.start_date && formData.end_date) {
        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);
        if (end < start) {
          throw new Error('End date must be after start date');
        }
      }

      // Submit
      const response = await fetch('/api/agency/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create campaign');
      }

      const result = await response.json();

      // Success - redirect to dashboard or campaign detail
      router.push('/agencies/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSport = (sport: string) => {
    setFormData(prev => ({
      ...prev,
      target_sports: prev.target_sports.includes(sport)
        ? prev.target_sports.filter(s => s !== sport)
        : [...prev.target_sports, sport],
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Campaign Name */}
        <Card className="p-6 bg-white border-2 border-orange-100/50">
          <label className="block mb-2">
            <span className="text-sm font-bold text-gray-700">Campaign Name *</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Spring Basketball Showcase 2024"
            className="w-full px-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-medium"
          />
        </Card>

        {/* Campaign Description */}
        <Card className="p-6 bg-white border-2 border-orange-100/50">
          <label className="block mb-2">
            <span className="text-sm font-bold text-gray-700">Description *</span>
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the campaign goals, deliverables, and key messaging..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-medium resize-none"
          />
        </Card>

        {/* Campaign Type */}
        <Card className="p-6 bg-white border-2 border-orange-100/50">
          <label className="block mb-4">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              Campaign Type
            </span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CAMPAIGN_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, campaign_type: type.value as any })}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  formData.campaign_type === type.value
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-orange-200/50 bg-white hover:border-orange-300'
                )}
              >
                <div className="font-bold text-gray-900 mb-1">{type.label}</div>
                <div className="text-sm text-gray-600 font-medium">{type.description}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Date Range */}
        <Card className="p-6 bg-white border-2 border-orange-100/50">
          <label className="block mb-4">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Campaign Duration
            </span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-medium"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-medium"
              />
            </div>
          </div>
        </Card>

        {/* Budget */}
        <Card className="p-6 bg-white border-2 border-orange-100/50">
          <label className="block mb-2">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Budget
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">$</span>
            <input
              type="number"
              min="0"
              step="100"
              value={formData.total_budget || ''}
              onChange={(e) => setFormData({ ...formData, total_budget: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full pl-8 pr-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-bold text-lg"
            />
          </div>
        </Card>

        {/* Target Sports */}
        <Card className="p-6 bg-white border-2 border-orange-100/50">
          <label className="block mb-4">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Target Sports (Optional)
            </span>
            <span className="text-xs text-gray-500 font-medium mt-1 block">
              Select specific sports or leave blank for all sports
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SPORTS_OPTIONS.map((sport) => (
              <button
                key={sport}
                type="button"
                onClick={() => toggleSport(sport)}
                className={cn(
                  'px-3 py-2 rounded-full border-2 text-sm font-bold transition-all flex items-center gap-2',
                  formData.target_sports.includes(sport)
                    ? 'border-orange-400 bg-orange-500 text-white'
                    : 'border-orange-200/50 bg-white text-gray-700 hover:border-orange-300'
                )}
              >
                {sport}
                {formData.target_sports.includes(sport) && <X className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-red-50 border-2 border-red-200">
            <p className="text-red-700 font-semibold text-sm">{error}</p>
          </Card>
        )}

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Campaign...' : 'Create Campaign'}
          </button>
        </div>
      </div>
    </form>
  );
}
