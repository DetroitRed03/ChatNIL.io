'use client';

import { useState, useEffect, useCallback } from 'react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  openItems: number;
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (memberId: string, notes?: string, priority?: string) => void;
  teamMembers: TeamMember[];
  selectedItemsCount: number;
  itemDescription?: string;
}

export function AssignmentModal({
  isOpen,
  onClose,
  onAssign,
  teamMembers,
  selectedItemsCount,
  itemDescription
}: AssignmentModalProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && selectedMember) {
      handleSubmit();
    }
  }, [onClose, selectedMember]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleSubmit = async () => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    try {
      await onAssign(selectedMember, notes || undefined, priority);
      setSelectedMember(null);
      setNotes('');
      setPriority('normal');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'normal': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid="assignment-modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Assign {selectedItemsCount > 1 ? `${selectedItemsCount} Items` : 'Item'}
            </h2>
            <button
              onClick={onClose}
              className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {itemDescription && (
            <p className="text-sm text-gray-500 mt-1">{itemDescription}</p>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Team Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {teamMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                    selectedMember === member.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                  <div className="flex-grow text-left">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.openItems} open items</p>
                  </div>
                  {selectedMember === member.id && (
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {(['low', 'normal', 'high', 'urgent'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${
                    priority === p
                      ? getPriorityColor(p) + ' border-current'
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context or instructions..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">⌘</kbd>+<kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">Enter</kbd> to assign
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedMember || isSubmitting}
              className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
