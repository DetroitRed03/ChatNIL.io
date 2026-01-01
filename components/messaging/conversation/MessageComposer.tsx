'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface MessageComposerProps {
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Message composer with auto-resize textarea
 * - Enter to send, Shift+Enter for newline
 * - Auto-resizes up to 4 lines
 * - Disabled state during sending
 */
export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageComposerProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(async () => {
    const trimmedText = text.trim();
    if (!trimmedText || disabled || isSending) return;

    setIsSending(true);
    try {
      await onSend(trimmedText);
      setText('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  }, [text, disabled, isSending, onSend]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set new height (max 4 lines, ~96px)
      const maxHeight = 120;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, []);

  const isDisabled = disabled || isSending;
  const canSend = text.trim().length > 0 && !isDisabled;

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-end gap-2">
        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
            aria-label="Message"
            aria-describedby="composer-hint"
            className={cn(
              'w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5',
              'text-sm placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
              'transition-colors',
              isDisabled && 'bg-gray-50 cursor-not-allowed'
            )}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <span id="composer-hint" className="sr-only">
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className={cn(
            'h-11 w-11 rounded-xl flex-shrink-0 transition-all',
            canSend
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
          aria-label="Send message"
        >
          <Send className={cn('w-5 h-5', isSending && 'animate-pulse')} />
        </Button>
      </div>
    </div>
  );
}
