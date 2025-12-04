'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Loader2, Target } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface Campaign {
  id: string;
  name: string;
  brand: string;
  budget: number; // cents
  targetSports: string[];
  status: string;
}

interface CampaignSelectorProps {
  onSelect: (campaignId: string) => void;
  selectedCampaignId?: string;
}

function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000000) {
    return `$${(dollars / 1000000).toFixed(1)}M`;
  } else if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  } else {
    return `$${dollars.toLocaleString()}`;
  }
}

export function CampaignSelector({ onSelect, selectedCampaignId }: CampaignSelectorProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch campaigns
  useEffect(() => {
    async function fetchCampaigns() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/demo/matchmaking/campaigns');
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
          setFilteredCampaigns(data.campaigns || []);
        }
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  // Set selected campaign from prop
  useEffect(() => {
    if (selectedCampaignId && campaigns.length > 0) {
      const campaign = campaigns.find(c => c.id === selectedCampaignId);
      if (campaign) {
        setSelectedCampaign(campaign);
      }
    }
  }, [selectedCampaignId, campaigns]);

  // Filter campaigns by search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCampaigns(campaigns);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCampaigns(
        campaigns.filter(
          campaign =>
            campaign.name.toLowerCase().includes(query) ||
            campaign.brand.toLowerCase().includes(query) ||
            campaign.targetSports?.some(sport => sport.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, campaigns]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsOpen(false);
    setSearchQuery('');
    onSelect(campaign.id);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-border rounded-lg px-4 py-3 flex items-center justify-between hover:border-primary-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {selectedCampaign ? (
            <>
              <div className="p-2 rounded-lg bg-primary-50">
                <Target className="h-5 w-5 text-primary-600" />
              </div>
              <div className="text-left flex-1">
                <p className="font-medium text-text-primary">{selectedCampaign.name}</p>
                <p className="text-sm text-text-secondary">
                  {selectedCampaign.brand} • {formatCurrency(selectedCampaign.budget)}
                </p>
              </div>
              {selectedCampaign.targetSports && selectedCampaign.targetSports.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {selectedCampaign.targetSports.slice(0, 2).map((sport) => (
                    <Badge key={sport} variant="primary" size="sm">
                      {sport}
                    </Badge>
                  ))}
                  {selectedCampaign.targetSports.length > 2 && (
                    <Badge variant="gray" size="sm">
                      +{selectedCampaign.targetSports.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </>
          ) : (
            <span className="text-text-secondary">Select a campaign...</span>
          )}
        </div>
        <ChevronDown className={cn('h-5 w-5 text-text-tertiary transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-border rounded-lg shadow-lg overflow-hidden animate-slide-down">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search by campaign, brand, or sport..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>
          </div>

          {/* Campaigns List */}
          <div className="max-h-80 overflow-y-auto" role="listbox">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="py-8 px-4 text-center text-text-secondary">
                <p>No campaigns found</p>
              </div>
            ) : (
              filteredCampaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => handleSelectCampaign(campaign)}
                  className="w-full px-4 py-3 flex items-start gap-3 hover:bg-background-hover transition-colors text-left border-b border-border last:border-0"
                  role="option"
                  aria-selected={selectedCampaign?.id === campaign.id}
                >
                  <div className="p-2 rounded-lg bg-primary-50 flex-shrink-0">
                    <Target className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      {campaign.name}
                    </p>
                    <p className="text-sm text-text-secondary mt-0.5">
                      {campaign.brand}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-text-tertiary">
                        {formatCurrency(campaign.budget)}
                      </span>
                      {campaign.targetSports && campaign.targetSports.length > 0 && (
                        <>
                          <span className="text-text-tertiary">•</span>
                          <div className="flex gap-1 flex-wrap">
                            {campaign.targetSports.slice(0, 2).map((sport) => (
                              <Badge key={sport} variant="primary" size="sm">
                                {sport}
                              </Badge>
                            ))}
                            {campaign.targetSports.length > 2 && (
                              <Badge variant="gray" size="sm">
                                +{campaign.targetSports.length - 2}
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
