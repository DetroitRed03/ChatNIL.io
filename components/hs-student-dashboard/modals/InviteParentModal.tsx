'use client';

import { useState } from 'react';

interface InviteParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteParentModal({ isOpen, onClose, onSuccess }: InviteParentModalProps) {
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!parentName.trim() || !parentEmail.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!parentEmail.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/parent-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentName: parentName.trim(),
          parentEmail: parentEmail.trim().toLowerCase()
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send invite');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invite. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-5 text-white">
          <div className="flex justify-between items-start">
            <span className="text-3xl">👨‍👩‍👦</span>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <h2 className="text-xl font-bold mt-2">Invite Your Parent</h2>
          <p className="text-white/80 text-sm">They&apos;ll be able to track your progress</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
            <p className="text-sm text-blue-800">
              <strong>Why invite a parent?</strong><br/>
              • They can see your learning progress<br/>
              • Many states require parent consent for minors<br/>
              • They&apos;ll be notified of any future NIL opportunities
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent&apos;s Name
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g., Mom, Dad, or their name"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent&apos;s Email
              </label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@email.com"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            We&apos;ll send them an email with instructions to create their account.
          </p>
        </form>
      </div>
    </div>
  );
}

export default InviteParentModal;
