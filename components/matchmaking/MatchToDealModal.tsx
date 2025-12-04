'use client';

import { useState } from 'react';
import { X, FileText, DollarSign, Calendar, CheckCircle } from 'lucide-react';

interface MatchToDealModalProps {
  match: {
    id: string;
    athlete_id: string;
    agency_id: string;
    match_score: number;
    athlete?: {
      first_name?: string;
      last_name?: string;
      primary_sport?: string;
      school_name?: string;
    };
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function MatchToDealModal({ match, onClose, onSuccess }: MatchToDealModalProps) {
  const [formData, setFormData] = useState({
    deal_title: '',
    brand_name: '',
    deal_type: 'sponsorship',
    compensation_amount: '',
    start_date: '',
    end_date: '',
    description: '',
    deliverables: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const dealTypes = [
    { value: 'sponsorship', label: 'Sponsorship' },
    { value: 'endorsement', label: 'Endorsement' },
    { value: 'appearance', label: 'Event Appearance' },
    { value: 'content_creation', label: 'Content Creation' },
    { value: 'social_media', label: 'Social Media Post' },
    { value: 'merchandise', label: 'Merchandise' },
    { value: 'licensing', label: 'Licensing' },
    { value: 'event', label: 'Event' },
    { value: 'other', label: 'Other' }
  ];

  const athleteName = match.athlete
    ? `${match.athlete.first_name || ''} ${match.athlete.last_name || ''}`.trim()
    : 'Athlete';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Parse deliverables from textarea (one per line)
      const deliverablesArray = formData.deliverables
        .split('\n')
        .map(d => d.trim())
        .filter(d => d.length > 0)
        .map(d => ({ type: d, status: 'pending' }));

      const res = await fetch('/api/matches/convert-to-deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: match.id,
          deal_title: formData.deal_title,
          deal_type: formData.deal_type,
          brand_name: formData.brand_name || null,
          description: formData.description || null,
          compensation_amount: formData.compensation_amount
            ? parseFloat(formData.compensation_amount)
            : null,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          deliverables: deliverablesArray.length > 0 ? deliverablesArray : null
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to create deal');
      }
    } catch (err) {
      console.error('Error creating deal:', err);
      setError('Failed to create deal. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Deal Created!</h2>
          <p className="text-gray-600 mb-4">
            Your deal proposal has been sent to {athleteName}.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Propose a Deal</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a deal offer for {athleteName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match Context */}
        <div className="px-6 pt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{match.match_score}</span>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-900">{athleteName}</p>
              <p className="text-sm text-gray-600">
                {match.athlete?.primary_sport} • {match.athlete?.school_name}
              </p>
            </div>
            <div className="ml-auto">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Match Score: {match.match_score}/100
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deal Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Deal Title *
              </label>
              <input
                type="text"
                required
                value={formData.deal_title}
                onChange={e => setFormData({ ...formData, deal_title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Summer Social Media Campaign"
              />
            </div>

            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name
              </label>
              <input
                type="text"
                value={formData.brand_name}
                onChange={e => setFormData({ ...formData, brand_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your company or brand"
              />
            </div>

            {/* Deal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deal Type *
              </label>
              <select
                required
                value={formData.deal_type}
                onChange={e => setFormData({ ...formData, deal_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {dealTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Compensation Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Compensation Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compensation_amount}
                  onChange={e => setFormData({ ...formData, compensation_amount: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5000.00"
                />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe the deal, expectations, and any important details..."
              />
            </div>

            {/* Deliverables */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deliverables
                <span className="text-gray-500 font-normal ml-1">(one per line)</span>
              </label>
              <textarea
                value={formData.deliverables}
                onChange={e => setFormData({ ...formData, deliverables: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="1 Instagram post&#10;2 Instagram stories&#10;1 TikTok video&#10;Event appearance on June 15"
              />
              <p className="text-xs text-gray-500 mt-1">
                List each deliverable on a separate line
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Creating Deal...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Propose Deal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
