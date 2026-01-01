'use client';

import { ArrowLeft, MoreVertical, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { ThreadParticipant, MessageThread } from '@/types/messaging';

interface ConversationHeaderProps {
  participant: ThreadParticipant;
  threadStatus?: MessageThread['status'];
  onBack?: () => void;
  showBackButton?: boolean;
  profileUrl?: string;
}

/**
 * Conversation header with participant info
 * - Back button (mobile)
 * - Avatar and name
 * - Subtitle (sport/school or company)
 * - Link to full profile
 */
export function ConversationHeader({
  participant,
  threadStatus,
  onBack,
  showBackButton = false,
  profileUrl,
}: ConversationHeaderProps) {
  const router = useRouter();

  const initials = participant.display_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const subtitle = participant.role === 'athlete'
    ? [participant.sport, participant.school].filter(Boolean).join(' • ')
    : participant.company_name || participant.industry;

  const handleViewProfile = () => {
    if (profileUrl) {
      router.push(profileUrl);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
      {/* Back button (mobile) */}
      {showBackButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="flex-shrink-0 -ml-2"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      )}

      {/* Avatar */}
      <Avatar className="w-10 h-10 flex-shrink-0">
        {participant.avatar_url && (
          <AvatarImage src={participant.avatar_url} alt={participant.display_name} />
        )}
        <AvatarFallback className="bg-orange-100 text-orange-700 font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Name and subtitle */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-900 truncate">
            {participant.display_name}
          </h2>
          {participant.is_verified && (
            <span className="flex-shrink-0 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 truncate">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {profileUrl && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleViewProfile}
            className="text-gray-500 hover:text-orange-600"
            aria-label="View profile"
          >
            <ExternalLink className="w-5 h-5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500"
          aria-label="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
