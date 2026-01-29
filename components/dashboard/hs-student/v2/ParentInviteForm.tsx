'use client';

import { useState } from 'react';

interface ParentInviteFormProps {
  onSuccess: () => void;
}

export default function ParentInviteForm({ onSuccess }: ParentInviteFormProps) {
  const [parentEmail, setParentEmail] = useState('');
  const [parentName, setParentName] = useState('');
  const [relationshipType, setRelationshipType] = useState('parent');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/parent-invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentEmail,
          parentName,
          relationshipType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-1">
          Parent/Guardian Name
        </label>
        <input
          type="text"
          id="parentName"
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
          placeholder="e.g., John Smith"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
          required
        />
      </div>

      <div>
        <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Parent/Guardian Email
        </label>
        <input
          type="email"
          id="parentEmail"
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
          placeholder="parent@example.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
          required
        />
      </div>

      <div>
        <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700 mb-1">
          Relationship
        </label>
        <select
          id="relationshipType"
          value={relationshipType}
          onChange={(e) => setRelationshipType(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
        >
          <option value="parent">Parent</option>
          <option value="guardian">Legal Guardian</option>
          <option value="step_parent">Step-Parent</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-r-transparent" />
            Sending...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Send Approval Request
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        We&apos;ll send an email explaining what ChatNIL is and asking for their approval.
        No spam, ever.
      </p>
    </form>
  );
}
