'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Video, Play, Star, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

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
  is_featured?: boolean;
  is_public?: boolean;
  display_order?: number;
  created_at?: string;
}

interface PortfolioManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: PortfolioItem) => Promise<void>;
  editItem?: PortfolioItem | null;
}

const CONTENT_TYPES = [
  { value: 'image', label: 'Photo', icon: ImageIcon },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'reel', label: 'Reel', icon: Play },
  { value: 'story', label: 'Story', icon: Star },
] as const;

export function PortfolioManagementModal({
  isOpen,
  onClose,
  onSave,
  editItem
}: PortfolioManagementModalProps) {
  const [type, setType] = React.useState<'image' | 'video' | 'reel' | 'story'>(editItem?.type || 'image');
  const [url, setUrl] = React.useState(editItem?.url || '');
  const [thumbnailUrl, setThumbnailUrl] = React.useState(editItem?.thumbnailUrl || '');
  const [description, setDescription] = React.useState(editItem?.description || '');
  const [sponsored, setSponsored] = React.useState(editItem?.sponsored || false);
  const [brand, setBrand] = React.useState(editItem?.brand || '');
  const [views, setViews] = React.useState(editItem?.metrics?.views?.toString() || '');
  const [likes, setLikes] = React.useState(editItem?.metrics?.likes?.toString() || '');
  const [comments, setComments] = React.useState(editItem?.metrics?.comments?.toString() || '');
  const [isFeatured, setIsFeatured] = React.useState(editItem?.is_featured || false);
  const [isPublic, setIsPublic] = React.useState(editItem?.is_public !== undefined ? editItem.is_public : true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when modal opens/closes or editItem changes
  React.useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setType(editItem.type);
        setUrl(editItem.url);
        setThumbnailUrl(editItem.thumbnailUrl || '');
        setDescription(editItem.description || '');
        setSponsored(editItem.sponsored);
        setBrand(editItem.brand || '');
        setViews(editItem.metrics?.views?.toString() || '');
        setLikes(editItem.metrics?.likes?.toString() || '');
        setComments(editItem.metrics?.comments?.toString() || '');
        setIsFeatured(editItem.is_featured || false);
        setIsPublic(editItem.is_public !== undefined ? editItem.is_public : true);
      } else {
        // Reset to defaults for new item
        setType('image');
        setUrl('');
        setThumbnailUrl('');
        setDescription('');
        setSponsored(false);
        setBrand('');
        setViews('');
        setLikes('');
        setComments('');
        setIsFeatured(false);
        setIsPublic(true);
      }
      setError(null);
    }
  }, [isOpen, editItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('Content URL is required');
      return;
    }

    setIsSaving(true);

    try {
      const item: PortfolioItem = {
        ...(editItem?.id && { id: editItem.id }),
        type,
        url: url.trim(),
        thumbnailUrl: thumbnailUrl.trim() || url.trim(),
        description: description.trim(),
        sponsored,
        brand: sponsored ? brand.trim() : undefined,
        is_featured: isFeatured,
        is_public: isPublic,
        metrics: {
          views: views ? parseInt(views) : 0,
          likes: likes ? parseInt(likes) : 0,
          comments: comments ? parseInt(comments) : 0,
        }
      };

      await onSave(item);
      onClose();
    } catch (err: any) {
      console.error('Error saving portfolio item:', err);
      setError(err.message || 'Failed to save portfolio item');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">
                  {editItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
                </h2>
                <p className="text-sm text-text-tertiary mt-1">
                  Showcase your best content and brand partnerships
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-text-tertiary" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Content Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-3">
                  Content Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CONTENT_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        type === value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-border-light hover:border-border-medium'
                      }`}
                    >
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${
                        type === value ? 'text-primary-600' : 'text-text-tertiary'
                      }`} />
                      <p className={`text-sm font-medium ${
                        type === value ? 'text-primary-700' : 'text-text-secondary'
                      }`}>
                        {label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content URL */}
              <div>
                <label htmlFor="url" className="block text-sm font-semibold text-text-primary mb-2">
                  Content URL <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://instagram.com/p/..."
                    className="w-full pl-10 pr-4 py-3 border border-border-medium rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-xs text-text-tertiary mt-1">
                  Link to your Instagram post, TikTok video, or other content
                </p>
              </div>

              {/* Thumbnail URL (Optional) */}
              <div>
                <label htmlFor="thumbnail" className="block text-sm font-semibold text-text-primary mb-2">
                  Thumbnail URL (Optional)
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                  <input
                    id="thumbnail"
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-10 pr-4 py-3 border border-border-medium rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-text-tertiary mt-1">
                  If different from content URL (defaults to content URL)
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-text-primary mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about this content..."
                  rows={3}
                  className="w-full px-4 py-3 border border-border-medium rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Sponsored Content Toggle */}
              <div className="flex items-start gap-3 p-4 bg-background-secondary rounded-xl">
                <input
                  type="checkbox"
                  id="sponsored"
                  checked={sponsored}
                  onChange={(e) => setSponsored(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <label htmlFor="sponsored" className="block text-sm font-semibold text-text-primary cursor-pointer">
                    Sponsored Content
                  </label>
                  <p className="text-xs text-text-tertiary mt-1">
                    This was a paid partnership or brand collaboration
                  </p>
                </div>
              </div>

              {/* Brand Name (if sponsored) */}
              {sponsored && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label htmlFor="brand" className="block text-sm font-semibold text-text-primary mb-2">
                    Brand Name
                  </label>
                  <input
                    id="brand"
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Nike, Gatorade, etc."
                    className="w-full px-4 py-3 border border-border-medium rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </motion.div>
              )}

              {/* Metrics */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-3">
                  Performance Metrics (Optional)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="views" className="block text-xs text-text-tertiary mb-1">
                      Views
                    </label>
                    <input
                      id="views"
                      type="number"
                      value={views}
                      onChange={(e) => setViews(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="likes" className="block text-xs text-text-tertiary mb-1">
                      Likes
                    </label>
                    <input
                      id="likes"
                      type="number"
                      value={likes}
                      onChange={(e) => setLikes(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="comments" className="block text-xs text-text-tertiary mb-1">
                      Comments
                    </label>
                    <input
                      id="comments"
                      type="number"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Portfolio Settings */}
              <div className="space-y-4 p-4 bg-background-secondary rounded-xl border border-border-light">
                <h3 className="font-semibold text-text-primary mb-3">Portfolio Settings</h3>

                {/* Featured Toggle */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="featured" className="block text-sm font-semibold text-text-primary cursor-pointer">
                      Featured Item ⭐
                    </label>
                    <p className="text-xs text-text-tertiary mt-1">
                      Pin this to the top of your portfolio
                    </p>
                  </div>
                </div>

                {/* Public/Private Toggle */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="public"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="mt-1 h-4 w-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="public" className="block text-sm font-semibold text-text-primary cursor-pointer">
                      Show on Public Profile
                    </label>
                    <p className="text-xs text-text-tertiary mt-1">
                      {isPublic ? 'Visible to everyone visiting your profile' : 'Only visible to you in edit mode'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-error-50 border border-error-200 rounded-xl"
                >
                  <p className="text-sm text-error-700">{error}</p>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editItem ? 'Update Item' : 'Add to Portfolio'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
