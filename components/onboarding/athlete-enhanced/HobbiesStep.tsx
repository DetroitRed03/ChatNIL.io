'use client';

import { useState } from 'react';

const HOBBY_OPTIONS = [
  { id: 'gaming', label: 'Gaming & Esports', icon: '🎮', description: 'Video games, streaming, esports' },
  { id: 'fitness', label: 'Fitness & Wellness', icon: '💪', description: 'Working out, nutrition, health' },
  { id: 'fashion', label: 'Fashion & Style', icon: '👗', description: 'Clothing, trends, personal style' },
  { id: 'food', label: 'Food & Cooking', icon: '🍳', description: 'Recipes, restaurants, culinary arts' },
  { id: 'tech', label: 'Technology', icon: '💻', description: 'Gadgets, software, innovation' },
  { id: 'travel', label: 'Travel', icon: '✈️', description: 'Exploring new places, adventures' },
  { id: 'music', label: 'Music', icon: '🎵', description: 'Creating or listening to music' },
  { id: 'art', label: 'Art & Design', icon: '🎨', description: 'Visual arts, creativity' },
  { id: 'content', label: 'Content Creation', icon: '📱', description: 'Social media, videos, photography' },
  { id: 'business', label: 'Business & Entrepreneurship', icon: '💼', description: 'Startups, investing, side hustles' },
  { id: 'environment', label: 'Environment & Sustainability', icon: '🌱', description: 'Climate, conservation, green living' },
  { id: 'community', label: 'Community Service', icon: '🤝', description: 'Volunteering, giving back' }
];

interface HobbiesStepProps {
  onComplete: (data: { hobbies: string[]; lifestyle_interests: string[] }) => void;
  initialData?: { hobbies?: string[]; lifestyle_interests?: string[] };
}

export function HobbiesStep({ onComplete, initialData }: HobbiesStepProps) {
  const [selected, setSelected] = useState<string[]>(initialData?.hobbies || []);

  function toggleHobby(hobbyId: string) {
    setSelected(prev =>
      prev.includes(hobbyId)
        ? prev.filter(h => h !== hobbyId)
        : [...prev, hobbyId]
    );
  }

  function handleSubmit() {
    onComplete({
      hobbies: selected,
      lifestyle_interests: selected
    });
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">What are you passionate about?</h1>
        <p className="text-gray-600 text-lg">
          Select all that apply. This helps us match you with relevant brand opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {HOBBY_OPTIONS.map(hobby => {
          const isSelected = selected.includes(hobby.id);
          return (
            <button
              key={hobby.id}
              onClick={() => toggleHobby(hobby.id)}
              className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="text-4xl mb-3">{hobby.icon}</div>
              <div className="font-semibold mb-1 text-gray-900">{hobby.label}</div>
              <div className="text-sm text-gray-600">{hobby.description}</div>
              {isSelected && (
                <div className="mt-3 flex items-center gap-2 text-blue-600">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Selected</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {selected.length} {selected.length === 1 ? 'interest' : 'interests'} selected
          {selected.length > 0 && (
            <span className="ml-2 text-green-600 font-medium">
              ✓ Great! Brands love diverse interests
            </span>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
