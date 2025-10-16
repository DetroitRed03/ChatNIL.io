'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface NILInterestsSelectProps {
  value: string[];
  onChange: (interests: string[]) => void;
}

const NIL_CATEGORIES = [
  'Brand Partnerships',
  'Social Media Sponsorships',
  'Merchandise/Apparel',
  'Autograph Signings',
  'Personal Training',
  'Sports Camps/Clinics',
  'Content Creation',
  'Local Business Partnerships',
  'National Brand Deals',
  'NFTs/Digital Collectibles',
  'Speaking Engagements',
  'Product Endorsements',
  'Charity/Community Work',
  'Gaming/Esports',
  'Music/Entertainment'
];

export default function NILInterestsSelect({ value, onChange }: NILInterestsSelectProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(value || []);

  const toggleInterest = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];

    setSelectedInterests(newInterests);
    onChange(newInterests);
  };

  const isSelected = (interest: string) => selectedInterests.includes(interest);

  return (
    <div className="space-y-3">
      {/* Selected count */}
      {selectedInterests.length > 0 && (
        <div className="text-sm text-gray-600">
          {selectedInterests.length} {selectedInterests.length === 1 ? 'interest' : 'interests'} selected
        </div>
      )}

      {/* Interest grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {NIL_CATEGORIES.map((interest) => (
          <button
            key={interest}
            type="button"
            onClick={() => toggleInterest(interest)}
            className={`
              relative px-4 py-3 rounded-xl border-2 text-left transition-all
              ${isSelected(interest)
                ? 'border-orange-500 bg-orange-50 text-orange-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{interest}</span>
              {isSelected(interest) && (
                <Check className="h-5 w-5 text-orange-500 flex-shrink-0 ml-2" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Selected interests tags (for easy removal) */}
      {selectedInterests.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Selected:</div>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
