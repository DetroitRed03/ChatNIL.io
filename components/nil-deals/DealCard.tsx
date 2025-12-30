'use client';

import { NILDeal } from '@/types';
import { useState } from 'react';

interface DealCardProps {
  deal: NILDeal;
  onUpdate: () => void;
}

export function DealCard({ deal, onUpdate }: DealCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [updating, setUpdating] = useState(false);

  const statusColors: Record<NILDeal['status'], string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
    on_hold: 'bg-orange-100 text-orange-800'
  };

  async function updateStatus(newStatus: NILDeal['status']) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/nil-deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        onUpdate();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update deal');
      }
    } catch (error) {
      console.error('Error updating deal:', error);
      alert('Failed to update deal');
    } finally {
      setUpdating(false);
    }
  }

  const formatDealType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Brand Logo/Name & Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {(deal as any).brand_logo_url ? (
            <img
              src={(deal as any).brand_logo_url}
              alt={(deal as any).brand_name || 'Brand'}
              className="h-12 w-12 object-contain rounded"
            />
          ) : (
            <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {((deal as any).brand_name || deal.deal_title || 'D')[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[deal.status]}`}>
          {deal.status}
        </span>
      </div>

      {/* Deal Info */}
      <h3 className="font-bold text-lg mb-1">{(deal as any).brand_name || deal.deal_title}</h3>
      <p className="text-sm text-gray-600 mb-3">{formatDealType(deal.deal_type)}</p>

      {deal.compensation_amount && (
        <div className="text-2xl font-bold text-green-600 mb-4">
          ${deal.compensation_amount.toLocaleString()}
        </div>
      )}

      {/* Dates */}
      <div className="text-sm text-gray-600 mb-4 space-y-1">
        {deal.start_date && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Start:</span>
            <span>{new Date(deal.start_date).toLocaleDateString()}</span>
          </div>
        )}
        {deal.end_date && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">End:</span>
            <span>{new Date(deal.end_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Deliverables Progress */}
      {deal.deliverables && deal.deliverables.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Deliverables</div>
          <div className="space-y-1">
            {deal.deliverables.slice(0, 2).map((d, i) => (
              <div key={i} className="text-xs text-gray-600 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  d.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`}></span>
                <span>{d.type}</span>
              </div>
            ))}
            {deal.deliverables.length > 2 && (
              <div className="text-xs text-gray-500">
                +{deal.deliverables.length - 2} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          {showDetails ? 'Hide' : 'View'} Details
        </button>

        {deal.status === 'pending' && (
          <button
            onClick={() => updateStatus('active')}
            disabled={updating}
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300"
          >
            {updating ? '...' : 'Activate'}
          </button>
        )}

        {deal.status === 'active' && (
          <button
            onClick={() => updateStatus('completed')}
            disabled={updating}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors disabled:bg-gray-300"
          >
            {updating ? '...' : 'Complete'}
          </button>
        )}
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm space-y-3">
          {deal.description && (
            <div>
              <strong className="text-gray-700">Description:</strong>
              <p className="mt-1 text-gray-600">{deal.description}</p>
            </div>
          )}

          {deal.payment_terms && (
            <div>
              <strong className="text-gray-700">Payment Terms:</strong>
              <p className="mt-1 text-gray-600">{deal.payment_terms}</p>
            </div>
          )}

          {deal.performance_metrics && Object.keys(deal.performance_metrics).length > 0 && (
            <div>
              <strong className="text-gray-700">Performance:</strong>
              <ul className="ml-4 mt-1 space-y-1 text-gray-600">
                {deal.performance_metrics.total_reach && (
                  <li>Reach: {deal.performance_metrics.total_reach.toLocaleString()}</li>
                )}
                {deal.performance_metrics.total_engagement && (
                  <li>Engagement: {deal.performance_metrics.total_engagement.toLocaleString()}</li>
                )}
              </ul>
            </div>
          )}

          {deal.contract_file_url && (
            <div>
              <a
                href={deal.contract_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:underline"
              >
                View Contract →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
