'use client';

import { useState } from 'react';

interface Child {
  id: string;
  name: string;
}

interface RevokeAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child | null;
  onRevoke: () => void;
}

export function RevokeAccessModal({ isOpen, onClose, child, onRevoke }: RevokeAccessModalProps) {
  const [confirming, setConfirming] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !child) return null;

  const handleRevoke = async () => {
    if (typedName !== child.name) return;

    setSubmitting(true);

    try {
      const res = await fetch('/api/parent/revoke-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: child.id })
      });

      if (!res.ok) {
        throw new Error('Failed to revoke access');
      }

      onRevoke();
      onClose();
    } catch (err) {
      console.error(err);
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
        <div className="bg-red-500 p-5 text-white">
          <h2 className="text-xl font-bold">⚠️ Revoke Access</h2>
          <p className="text-white/80 text-sm">This action cannot be undone</p>
        </div>

        <div className="p-5">
          {!confirming ? (
            <>
              <p className="text-gray-700 mb-4">
                Are you sure you want to revoke <strong>{child.name}</strong>&apos;s access to ChatNIL?
              </p>
              <p className="text-sm text-gray-500 mb-4">
                This will:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-6">
                <li>• Immediately block {child.name.split(' ')[0]} from accessing ChatNIL</li>
                <li>• Preserve their progress (can be restored later)</li>
                <li>• Require a new approval if they want access again</li>
              </ul>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setConfirming(true)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600"
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 mb-4">
                To confirm, type <strong>&quot;{child.name}&quot;</strong> below:
              </p>
              <input
                type="text"
                value={typedName}
                onChange={e => setTypedName(e.target.value)}
                placeholder={child.name}
                className="w-full p-3 border rounded-xl mb-4 focus:ring-2 focus:ring-red-500"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setConfirming(false);
                    setTypedName('');
                  }}
                  className="flex-1 py-3 border rounded-xl font-medium hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={typedName !== child.name || submitting}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50"
                >
                  {submitting ? 'Revoking...' : 'Revoke Access'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RevokeAccessModal;
