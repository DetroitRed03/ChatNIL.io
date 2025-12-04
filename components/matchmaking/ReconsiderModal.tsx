'use client';

import { useState, useEffect } from 'react';
import { X, RotateCcw, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getReconsiderTimeRemaining, RECONSIDER_WINDOW_HOURS } from '@/lib/reconsider-utils';

interface ReconsiderModalProps {
  type: 'match' | 'invite';
  item: {
    id: string;
    agency_name?: string;
    campaign_name?: string;
    responded_at?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function ReconsiderModal({ type, item, onClose, onSuccess }: ReconsiderModalProps) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [canReconsider, setCanReconsider] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    formatted: string;
    expired: boolean;
  } | null>(null);

  // Check reconsider eligibility
  useEffect(() => {
    async function checkEligibility() {
      try {
        const endpoint = type === 'match'
          ? `/api/matches/${item.id}/reconsider`
          : `/api/athlete/invites/${item.id}/reconsider`;

        const res = await fetch(endpoint);
        const data = await res.json();

        if (data.success) {
          setCanReconsider(data.canReconsider);
          setTimeRemaining(data.timeRemaining);
          if (!data.canReconsider && data.reason) {
            setError(data.reason);
          }
        } else {
          setError(data.error || 'Failed to check eligibility');
        }
      } catch (err) {
        setError('Failed to check eligibility');
      } finally {
        setChecking(false);
      }
    }

    checkEligibility();
  }, [type, item.id]);

  // Update countdown timer
  useEffect(() => {
    if (!item.responded_at || success) return;

    const interval = setInterval(() => {
      const remaining = getReconsiderTimeRemaining(item.responded_at);
      setTimeRemaining(remaining);
      if (remaining?.expired) {
        setCanReconsider(false);
        setError('The reconsider window has expired');
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [item.responded_at, success]);

  async function handleReconsider() {
    setLoading(true);
    setError('');

    try {
      const endpoint = type === 'match'
        ? `/api/matches/${item.id}/reconsider`
        : `/api/athlete/invites/${item.id}/reconsider`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(data.error || 'Failed to reconsider');
      }
    } catch (err) {
      console.error('Error reconsidering:', err);
      setError('Failed to reconsider. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const displayName = type === 'match'
    ? item.agency_name || 'this agency'
    : item.campaign_name || 'this campaign';

  // Success state
  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reconsidered!</h2>
          <p className="text-gray-600 mb-4">
            You've successfully reconsidered {displayName}.
            {type === 'match'
              ? ' The agency has been notified of your renewed interest.'
              : ' You can now accept or decline this invite again.'}
          </p>
          <p className="text-sm text-gray-500">
            Refreshing...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Reconsider?</h2>
              <p className="text-sm text-gray-500">Change your mind</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {checking ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Checking eligibility...</p>
            </div>
          ) : (
            <>
              {/* Time Remaining Badge */}
              {timeRemaining && !timeRemaining.expired && canReconsider && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-orange-800">Time Remaining</p>
                    <p className="text-sm text-orange-600">{timeRemaining.formatted}</p>
                  </div>
                </div>
              )}

              {/* Main Content */}
              {canReconsider ? (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    You previously declined <span className="font-semibold">{displayName}</span>.
                    Would you like to reconsider this decision?
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>What happens next:</strong>
                      {type === 'match' ? (
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          <li>Your match will return to the "contacted" status</li>
                          <li>The agency will be notified of your renewed interest</li>
                          <li>You can then choose to express interest</li>
                        </ul>
                      ) : (
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          <li>The invite will return to pending status</li>
                          <li>You can accept or decline again</li>
                          <li>The agency will be notified</li>
                        </ul>
                      )}
                    </p>
                  </div>

                  <p className="text-xs text-gray-500">
                    Note: You can only reconsider once per {type === 'match' ? 'match' : 'invite'}.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cannot Reconsider</h3>
                  <p className="text-gray-600 text-sm">
                    {error || `The ${RECONSIDER_WINDOW_HOURS}-hour reconsider window has passed.`}
                  </p>
                </div>
              )}

              {/* Error Display */}
              {error && canReconsider && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            {canReconsider ? 'Cancel' : 'Close'}
          </button>
          {canReconsider && !checking && (
            <button
              onClick={handleReconsider}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Processing...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Yes, Reconsider
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
