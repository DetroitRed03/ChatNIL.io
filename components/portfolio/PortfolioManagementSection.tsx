'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, FileText, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PortfolioGrid } from '@/components/profile/reusable/PortfolioItemCard';
import { PortfolioManagementModal } from './PortfolioManagementModal';

interface PortfolioItem {
  id?: string;
  type: 'image' | 'video' | 'reel' | 'story';
  url: string;
  thumbnailUrl?: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  sponsored: boolean;
  brand?: string;
  description?: string;
  created_at?: string;
}

interface PortfolioManagementSectionProps {
  userId: string;
}

export function PortfolioManagementSection({ userId }: PortfolioManagementSectionProps) {
  const [items, setItems] = React.useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<PortfolioItem | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Load portfolio items
  const loadPortfolio = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/portfolio?userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to load portfolio');
      }

      const data = await response.json();
      // Sort items: featured first, then by display_order
      const sortedItems = (data.items || []).sort((a: any, b: any) => {
        // Featured items come first
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        // Then sort by display_order
        return (a.display_order || 0) - (b.display_order || 0);
      });
      setItems(sortedItems);
    } catch (err: any) {
      console.error('Error loading portfolio:', err);
      setError(err.message || 'Failed to load portfolio');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  const handleSave = async (item: PortfolioItem) => {
    try {
      if (item.id) {
        // Update existing item
        const response = await fetch('/api/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            itemId: item.id,
            updates: item
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update portfolio item');
        }

        const data = await response.json();
        setItems(data.items);
      } else {
        // Add new item
        const response = await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            item
          })
        });

        if (!response.ok) {
          throw new Error('Failed to add portfolio item');
        }

        const data = await response.json();
        setItems(data.items);
      }

      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error('Error saving portfolio item:', err);
      throw err; // Re-throw to let modal handle the error
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/portfolio?userId=${userId}&itemId=${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete portfolio item');
      }

      const data = await response.json();
      setItems(data.items);
    } catch (err: any) {
      console.error('Error deleting portfolio item:', err);
      alert('Failed to delete portfolio item. Please try again.');
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin mb-4" />
          <p className="text-text-tertiary">Loading your portfolio...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-error-200 bg-error-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-error-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-error-900 mb-1">Failed to Load Portfolio</h3>
            <p className="text-sm text-error-700 mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPortfolio}
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-lg shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Portfolio</h2>
              <p className="text-sm text-text-tertiary">
                Showcase your best content and brand partnerships
              </p>
            </div>
          </div>
          <Button
            onClick={handleAddNew}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Portfolio Grid */}
        {items.length > 0 ? (
          <PortfolioGrid
            items={items as any}
            mode="edit"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <div className="text-center py-16 px-4">
            <div className="p-4 bg-gray-100 rounded-full inline-flex mb-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No Portfolio Items Yet
            </h3>
            <p className="text-text-tertiary max-w-md mx-auto mb-6">
              Start building your portfolio by adding your best content, brand partnerships, and achievements.
            </p>
            <Button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Item
            </Button>
          </div>
        )}

        {/* Item Count */}
        {items.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border-light">
            <p className="text-sm text-text-tertiary text-center">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your portfolio
            </p>
          </div>
        )}
      </Card>

      {/* Management Modal */}
      <PortfolioManagementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editItem={editingItem}
      />
    </>
  );
}
