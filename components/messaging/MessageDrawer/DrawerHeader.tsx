'use client';

import { X, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { RecipientInfo } from '@/contexts/MessageDrawerContext';

interface DrawerHeaderProps {
  recipient: RecipientInfo;
  onClose: () => void;
  isMobile?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function DrawerHeader({ recipient, onClose, isMobile = false }: DrawerHeaderProps) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
      {/* Mobile back button */}
      {isMobile && (
        <button
          onClick={onClose}
          className="p-1 -ml-1 text-gray-500 hover:text-gray-700 transition-colors sm:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold flex-shrink-0 overflow-hidden">
        {recipient.avatar ? (
          <img
            src={recipient.avatar}
            alt={recipient.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-lg">{getInitials(recipient.name)}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{recipient.name}</h3>
        {recipient.handle && (
          <p className="text-sm text-gray-500 truncate">@{recipient.handle}</p>
        )}
        {recipient.meta && !recipient.handle && (
          <p className="text-sm text-gray-500 truncate">{recipient.meta}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {recipient.profileUrl && (
          <Link
            href={recipient.profileUrl}
            className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
            title="View profile"
          >
            <ExternalLink className="w-5 h-5" />
          </Link>
        )}
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
