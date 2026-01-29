'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ConditionsAcknowledgmentFormProps {
  dealId: string;
  onSuccess: () => void;
}

export function ConditionsAcknowledgmentForm({ dealId, onSuccess }: ConditionsAcknowledgmentFormProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acknowledged) {
      setError('Please confirm you have completed all conditions.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const res = await fetch(`/api/deals/${dealId}/complete-conditions`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          acknowledged: true,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      alert(data.message || 'Conditions submitted for final approval.');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Acknowledgment Checkbox */}
      <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => {
            setAcknowledged(e.target.checked);
            if (e.target.checked) setError('');
          }}
          className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <p className="font-medium text-gray-900">
            I confirm that I have completed all conditions
          </p>
          <p className="text-sm text-gray-500 mt-1">
            By checking this box, you confirm that you have fulfilled all requirements
            listed above and are ready for final approval.
          </p>
        </div>
      </label>

      {/* Optional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          rows={3}
          placeholder="Explain how you completed the conditions or provide any additional context..."
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !acknowledged}
        className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {submitting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
        ) : (
          <><Send className="w-5 h-5" /> Submit for Final Approval</>
        )}
      </button>
    </form>
  );
}
