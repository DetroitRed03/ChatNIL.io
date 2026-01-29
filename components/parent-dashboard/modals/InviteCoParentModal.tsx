'use client';

import { useState } from 'react';

interface InviteCoParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
  childName: string;
  onSuccess: () => void;
}

export function InviteCoParentModal({
  isOpen,
  onClose,
  childId,
  childName,
  onSuccess
}: InviteCoParentModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('parent');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/parent/invite-coparent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          inviteeName: name.trim(),
          inviteeEmail: email.trim().toLowerCase(),
          relationship
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send invite');
      }

      onSuccess();
      onClose();
      setName('');
      setEmail('');
    } catch (err: any) {
      setError(err.message);
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
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-5 text-white">
          <h2 className="text-xl font-bold">Invite Co-Parent</h2>
          <p className="text-white/80 text-sm">
            Share access to {childName}&apos;s progress
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Their Relationship
              </label>
              <select
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
              >
                <option value="mother">Mom</option>
                <option value="father">Dad</option>
                <option value="guardian">Guardian</option>
                <option value="stepparent">Step-parent</option>
                <option value="grandparent">Grandparent</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Their Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Sarah Smith"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Their Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border rounded-xl font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            They&apos;ll receive an email to create their account and view progress.
          </p>
        </form>
      </div>
    </div>
  );
}

export default InviteCoParentModal;
