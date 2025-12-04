'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Image as ImageIcon, Video, Play, Eye, Heart, MessageCircle,
  Edit2, Trash2, ExternalLink, Star, GripVertical
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface PortfolioItem {
  id: string;
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
  createdAt?: string;
}

interface PortfolioItemCardProps {
  item: PortfolioItem;
  mode: 'view' | 'edit';
  onEdit?: (item: PortfolioItem) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: PortfolioItem) => void;
  className?: string;
}

const TYPE_CONFIG = {
  image: {
    label: 'Photo',
    icon: ImageIcon,
    color: 'primary',
  },
  video: {
    label: 'Video',
    icon: Video,
    color: 'accent',
  },
  reel: {
    label: 'Reel',
    icon: Play,
    color: 'success',
  },
  story: {
    label: 'Story',
    icon: Star,
    color: 'warning',
  },
};

export function PortfolioItemCard({
  item,
  mode,
  onEdit,
  onDelete,
  onClick,
  className,
}: PortfolioItemCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const typeConfig = TYPE_CONFIG[item.type];
  const TypeIcon = typeConfig.icon;

  const formatMetric = (num?: number): string => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleCardClick = () => {
    if (mode === 'view' && onClick) {
      onClick(item);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn('group relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={cn(
          'overflow-hidden cursor-pointer transition-all duration-200',
          mode === 'view' && 'hover:shadow-xl',
          mode === 'edit' && 'hover:border-primary-300'
        )}
        onClick={handleCardClick}
      >
        {/* Drag Handle (Edit Mode) */}
        {mode === 'edit' && (
          <div className="absolute top-2 left-2 z-10 p-1 bg-white rounded-md shadow-md cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-text-tertiary" />
          </div>
        )}

        {/* Media Container */}
        <div className="relative aspect-square bg-gray-100">
          {/* Thumbnail Image */}
          {!imageError ? (
            <Image
              src={item.thumbnailUrl || item.url}
              alt={item.description || `${item.type} content`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <TypeIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Video Play Overlay */}
          {(item.type === 'video' || item.type === 'reel') && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-4 bg-white/90 rounded-full shadow-lg"
              >
                <Play className="h-8 w-8 text-primary-600" />
              </motion.div>
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-2 right-2 z-10">
            <Badge variant={typeConfig.color as any} size="sm">
              <TypeIcon className="h-3 w-3 mr-1" />
              {typeConfig.label}
            </Badge>
          </div>

          {/* Featured Badge (top left) */}
          {item.is_featured && (
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="warning" size="sm" className="bg-amber-500 text-white">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured
              </Badge>
            </div>
          )}

          {/* Sponsored Badge */}
          {item.sponsored && (
            <div className="absolute top-10 right-2 z-10">
              <Badge variant="accent" size="sm">
                <Star className="h-3 w-3 mr-1" />
                Sponsored
              </Badge>
            </div>
          )}

          {/* Metrics Overlay */}
          <AnimatePresence>
            {isHovered && item.metrics && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
              >
                <div className="flex items-center justify-around text-white text-sm">
                  {item.metrics.views !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{formatMetric(item.metrics.views)}</span>
                    </div>
                  )}
                  {item.metrics.likes !== undefined && (
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{formatMetric(item.metrics.likes)}</span>
                    </div>
                  )}
                  {item.metrics.comments !== undefined && (
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{formatMetric(item.metrics.comments)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Mode Actions Overlay */}
          {mode === 'edit' && isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => onEdit?.(item)}
                className="p-3 bg-white rounded-full shadow-lg hover:bg-primary-50 transition-colors"
                aria-label="Edit item"
              >
                <Edit2 className="h-5 w-5 text-primary-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => onDelete?.(item.id)}
                className="p-3 bg-white rounded-full shadow-lg hover:bg-error-50 transition-colors"
                aria-label="Delete item"
              >
                <Trash2 className="h-5 w-5 text-error-600" />
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="View original"
              >
                <ExternalLink className="h-5 w-5 text-text-secondary" />
              </motion.a>
            </motion.div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-3 space-y-2">
          {/* Brand Name */}
          {item.sponsored && item.brand && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-accent-500" />
              <span className="text-sm font-medium text-accent-700">
                {item.brand}
              </span>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <p className="text-sm text-text-secondary line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Metrics (Non-hover state for mobile) */}
          {item.metrics && !isHovered && (
            <div className="flex items-center gap-3 text-xs text-text-tertiary pt-1">
              {item.metrics.views !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{formatMetric(item.metrics.views)}</span>
                </div>
              )}
              {item.metrics.likes !== undefined && (
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{formatMetric(item.metrics.likes)}</span>
                </div>
              )}
              {item.metrics.comments !== undefined && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{formatMetric(item.metrics.comments)}</span>
                </div>
              )}
            </div>
          )}

          {/* Status Indicators (Edit Mode) */}
          {mode === 'edit' && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {item.is_featured && (
                <Badge variant="warning" size="sm">
                  ⭐ Featured
                </Badge>
              )}
              {item.is_public === false && (
                <Badge variant="gray" size="sm" className="bg-gray-500 text-white">
                  🔒 Private
                </Badge>
              )}
            </div>
          )}

          {/* Created Date */}
          {item.createdAt && (
            <p className="text-xs text-text-tertiary">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// Portfolio Grid Component
interface PortfolioGridProps {
  items: PortfolioItem[];
  mode: 'view' | 'edit';
  onEdit?: (item: PortfolioItem) => void;
  onDelete?: (id: string) => void;
  onClick?: (item: PortfolioItem) => void;
  emptyMessage?: string;
}

export function PortfolioGrid({
  items,
  mode,
  onEdit,
  onDelete,
  onClick,
  emptyMessage = 'No portfolio items yet',
}: PortfolioGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="p-4 bg-gray-100 rounded-full mb-4">
          <ImageIcon className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-text-tertiary text-center max-w-md">
          {mode === 'edit'
            ? 'Upload your best content to showcase your work and attract brand partnerships.'
            : 'This athlete hasn\'t uploaded any portfolio items yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <PortfolioItemCard
            key={item.id}
            item={item}
            mode={mode}
            onEdit={onEdit}
            onDelete={onDelete}
            onClick={onClick}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
