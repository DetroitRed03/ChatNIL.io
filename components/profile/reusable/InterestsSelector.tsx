'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Video, Camera, Mic, TrendingUp, Heart, Leaf, GraduationCap,
  Activity, Users, Star, Shirt, Smartphone, Coffee, Car, Plane,
  Dumbbell, Music, Gamepad2, ChevronDown, ChevronUp, Check, X
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

// Interest categories with options and icons
const INTEREST_CATEGORIES = {
  'Content Creation': {
    icon: Video,
    options: [
      { value: 'vlogs', label: 'Vlogs', icon: Video },
      { value: 'tutorials', label: 'Tutorials', icon: GraduationCap },
      { value: 'reviews', label: 'Product Reviews', icon: Star },
      { value: 'behind-the-scenes', label: 'Behind-the-Scenes', icon: Camera },
      { value: 'live-streams', label: 'Live Streams', icon: TrendingUp },
      { value: 'podcasts', label: 'Podcasts', icon: Mic },
      { value: 'day-in-life', label: 'Day in the Life', icon: Camera },
      { value: 'challenges', label: 'Challenges', icon: TrendingUp },
    ],
  },
  'Lifestyle Interests': {
    icon: Heart,
    options: [
      { value: 'fashion', label: 'Fashion & Style', icon: Shirt },
      { value: 'fitness', label: 'Fitness & Wellness', icon: Dumbbell },
      { value: 'food', label: 'Food & Nutrition', icon: Coffee },
      { value: 'travel', label: 'Travel', icon: Plane },
      { value: 'gaming', label: 'Gaming', icon: Gamepad2 },
      { value: 'music', label: 'Music', icon: Music },
      { value: 'technology', label: 'Technology', icon: Smartphone },
      { value: 'outdoor', label: 'Outdoor Activities', icon: Activity },
    ],
  },
  'Causes Care About': {
    icon: Heart,
    options: [
      { value: 'environment', label: 'Environment & Sustainability', icon: Leaf },
      { value: 'education', label: 'Education Access', icon: GraduationCap },
      { value: 'health', label: 'Health & Wellness', icon: Activity },
      { value: 'social-justice', label: 'Social Justice', icon: Users },
      { value: 'mental-health', label: 'Mental Health', icon: Heart },
      { value: 'animal-welfare', label: 'Animal Welfare', icon: Heart },
      { value: 'youth-sports', label: 'Youth Sports', icon: Activity },
      { value: 'community', label: 'Community Service', icon: Users },
    ],
  },
  'Brand Affinity': {
    icon: Star,
    options: [
      { value: 'sports-brands', label: 'Sports & Athletic Brands', icon: Activity },
      { value: 'tech', label: 'Tech & Electronics', icon: Smartphone },
      { value: 'fashion-brands', label: 'Fashion Brands', icon: Shirt },
      { value: 'food-beverage', label: 'Food & Beverage', icon: Coffee },
      { value: 'automotive', label: 'Automotive', icon: Car },
      { value: 'wellness', label: 'Health & Wellness', icon: Dumbbell },
      { value: 'gaming-brands', label: 'Gaming Brands', icon: Gamepad2 },
      { value: 'local-business', label: 'Local Businesses', icon: Users },
    ],
  },
};

interface InterestsSelectorProps {
  selectedInterests: {
    [category: string]: string[];
  };
  onChange: (category: string, interests: string[]) => void;
  maxPerCategory?: number;
  className?: string;
}

export function InterestsSelector({
  selectedInterests,
  onChange,
  maxPerCategory = 10,
  className,
}: InterestsSelectorProps) {
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>(
    Object.keys(INTEREST_CATEGORIES)
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleInterest = (category: string, interest: string) => {
    const currentSelections = selectedInterests[category] || [];
    const isSelected = currentSelections.includes(interest);

    let newSelections: string[];
    if (isSelected) {
      newSelections = currentSelections.filter(i => i !== interest);
    } else {
      if (currentSelections.length >= maxPerCategory) {
        return; // Max reached
      }
      newSelections = [...currentSelections, interest];
    }

    onChange(category, newSelections);
  };

  const selectAll = (category: string) => {
    const allOptions = INTEREST_CATEGORIES[category as keyof typeof INTEREST_CATEGORIES].options.map(
      opt => opt.value
    );
    const limited = allOptions.slice(0, maxPerCategory);
    onChange(category, limited);
  };

  const clearAll = (category: string) => {
    onChange(category, []);
  };

  const getCategoryCount = (category: string) => {
    return selectedInterests[category]?.length || 0;
  };

  const getTotalCount = () => {
    return Object.values(selectedInterests).reduce((sum, arr) => sum + arr.length, 0);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with total count */}
      <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-primary-900">
            Your Interests & Values
          </h3>
        </div>
        <Badge variant="primary" size="lg">
          {getTotalCount()} selected
        </Badge>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {Object.entries(INTEREST_CATEGORIES).map(([category, { icon: CategoryIcon, options }]) => {
          const isExpanded = expandedCategories.includes(category);
          const count = getCategoryCount(category);
          const isMaxReached = count >= maxPerCategory;

          return (
            <div
              key={category}
              className="border border-border rounded-lg bg-background-card overflow-hidden"
            >
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 hover:bg-background-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <CategoryIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-text-primary">{category}</h4>
                    <p className="text-xs text-text-tertiary">
                      {count} of {maxPerCategory} selected
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {count > 0 && (
                    <Badge variant="success" size="sm">
                      {count}
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-text-tertiary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-text-tertiary" />
                  )}
                </div>
              </button>

              {/* Category Content */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-border">
                  {/* Quick Actions */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => selectAll(category)}
                      disabled={count === maxPerCategory}
                      className="text-xs px-3 py-1 rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => clearAll(category)}
                      disabled={count === 0}
                      className="text-xs px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {options.map(({ value, label, icon: OptionIcon }) => {
                      const isSelected = selectedInterests[category]?.includes(value);
                      const canSelect = !isMaxReached || isSelected;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleInterest(category, value)}
                          disabled={!canSelect}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500',
                            isSelected
                              ? 'bg-primary-100 border-primary-300 text-primary-900 font-medium shadow-sm'
                              : 'bg-white border-border text-text-secondary hover:border-border-secondary hover:bg-background-hover',
                            !canSelect && 'opacity-40 cursor-not-allowed'
                          )}
                        >
                          <OptionIcon className={cn(
                            'h-4 w-4',
                            isSelected ? 'text-primary-600' : 'text-text-tertiary'
                          )} />
                          <span className="flex-1 text-left text-sm">{label}</span>
                          {isSelected && (
                            <Check className="h-4 w-4 text-primary-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Max Warning */}
                  {isMaxReached && (
                    <div className="mt-3 p-2 bg-warning-50 rounded-md border border-warning-200">
                      <p className="text-xs text-warning-800">
                        Maximum selections reached for this category. Deselect to choose others.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {getTotalCount() > 0 && (
        <div className="p-4 bg-success-50 rounded-lg border border-success-200">
          <h4 className="text-sm font-semibold text-success-900 mb-2">
            Your Selected Interests
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedInterests).map(([category, interests]) =>
              interests.map(interest => {
                const option = INTEREST_CATEGORIES[category as keyof typeof INTEREST_CATEGORIES]
                  ?.options.find(opt => opt.value === interest);

                if (!option) return null;

                return (
                  <Badge
                    key={`${category}-${interest}`}
                    variant="success"
                    size="sm"
                    className="cursor-pointer hover:bg-success-200"
                    onClick={() => toggleInterest(category, interest)}
                  >
                    {option.label}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
