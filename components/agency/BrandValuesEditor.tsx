'use client';

import { useState, useEffect } from 'react';
import { Heart, Loader2, Save, X, GripVertical } from 'lucide-react';

interface BrandValue {
  trait_id: string;
  priority: number;
}

interface Trait {
  id: string;
  name: string;
  display_name: string;
  category: string;
  description?: string;
}

interface BrandValuesEditorProps {
  accessToken: string;
  initialValues?: BrandValue[];
  onSave?: (values: BrandValue[]) => void;
}

export function BrandValuesEditor({ accessToken, initialValues = [], onSave }: BrandValuesEditorProps) {
  const [availableTraits, setAvailableTraits] = useState<Trait[]>([]);
  const [selectedValues, setSelectedValues] = useState<BrandValue[]>(initialValues);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch available traits
  useEffect(() => {
    async function fetchTraits() {
      try {
        const response = await fetch('/api/agency/brand-values?available=true', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const result = await response.json();

        if (result.success && result.data) {
          setAvailableTraits(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch traits:', err);
        setError('Failed to load brand values');
      } finally {
        setIsLoading(false);
      }
    }

    if (accessToken) {
      fetchTraits();
    }
  }, [accessToken]);

  // Fetch current values if not provided
  useEffect(() => {
    async function fetchCurrentValues() {
      if (initialValues.length > 0) return;

      try {
        const response = await fetch('/api/agency/brand-values', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const result = await response.json();

        if (result.success && result.data) {
          setSelectedValues(
            result.data.map((v: any) => ({
              trait_id: v.trait_id,
              priority: v.priority,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch current values:', err);
      }
    }

    if (accessToken) {
      fetchCurrentValues();
    }
  }, [accessToken, initialValues]);

  const toggleValue = (traitId: string) => {
    const isSelected = selectedValues.some(v => v.trait_id === traitId);

    if (isSelected) {
      // Remove
      const newValues = selectedValues
        .filter(v => v.trait_id !== traitId)
        .map((v, idx) => ({ ...v, priority: idx + 1 }));
      setSelectedValues(newValues);
    } else if (selectedValues.length < 5) {
      // Add
      setSelectedValues([
        ...selectedValues,
        { trait_id: traitId, priority: selectedValues.length + 1 },
      ]);
    }

    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/agency/brand-values', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ values: selectedValues }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save brand values');
      }

      setSuccess(true);
      onSave?.(selectedValues);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Group traits by category
  const groupedTraits = availableTraits.reduce(
    (acc, trait) => {
      const category = trait.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(trait);
      return acc;
    },
    {} as Record<string, Trait[]>
  );

  const categoryLabels: Record<string, string> = {
    personal: 'Personal Values',
    professional: 'Professional Values',
    social: 'Social Impact',
    brand: 'Brand Personality',
    other: 'Other',
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 text-pink-500 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Brand Values</h2>
            <p className="text-sm text-gray-500">Select up to 5 values that represent your brand</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Values
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Brand values saved successfully!
        </div>
      )}

      {/* Selected Values */}
      {selectedValues.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Selected ({selectedValues.length}/5):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedValues
              .sort((a, b) => a.priority - b.priority)
              .map(value => {
                const trait = availableTraits.find(t => t.id === value.trait_id);
                if (!trait) return null;

                return (
                  <div
                    key={value.trait_id}
                    className="flex items-center gap-2 px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg"
                  >
                    <span className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {value.priority}
                    </span>
                    <span className="font-medium text-primary-700">{trait.display_name}</span>
                    <button
                      onClick={() => toggleValue(value.trait_id)}
                      className="p-0.5 hover:bg-primary-100 rounded"
                    >
                      <X className="w-4 h-4 text-primary-500" />
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Available Traits by Category */}
      <div className="space-y-6">
        {Object.entries(groupedTraits).map(([category, traits]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-gray-600 mb-3">
              {categoryLabels[category] || category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {traits.map(trait => {
                const isSelected = selectedValues.some(v => v.trait_id === trait.id);
                const selectionIndex = selectedValues.findIndex(v => v.trait_id === trait.id);
                const isDisabled = !isSelected && selectedValues.length >= 5;

                return (
                  <button
                    key={trait.id}
                    onClick={() => toggleValue(trait.id)}
                    disabled={isDisabled}
                    className={`
                      p-3 rounded-xl border-2 text-left transition-all relative
                      ${isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'}
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {selectionIndex + 1}
                      </span>
                    )}
                    <span className="font-medium text-gray-900 text-sm">{trait.display_name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {availableTraits.length === 0 && (
        <div className="text-center py-8">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No brand values available.</p>
          <p className="text-sm text-gray-400 mt-1">
            Please ensure the core traits have been set up in the system.
          </p>
        </div>
      )}
    </div>
  );
}
