'use client';

import { useEffect, useState } from 'react';
import { NILDeal } from '@/types';
import { DealCard } from './DealCard';
import { CreateDealModal } from './CreateDealModal';

export function NILDealsDashboard() {
  const [deals, setDeals] = useState<NILDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, [filter]);

  async function fetchDeals() {
    try {
      const url = filter === 'all'
        ? '/api/nil-deals'
        : `/api/nil-deals?status=${filter}`;

      const res = await fetch(url);
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalEarnings = deals
    .filter(d => d.status === 'completed' || d.status === 'active')
    .reduce((sum, d) => sum + (d.compensation_amount || 0), 0);

  const activeCount = deals.filter(d => d.status === 'active').length;
  const completedCount = deals.filter(d => d.status === 'completed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">My NIL Deals</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Earnings</div>
            <div className="text-2xl font-bold text-green-600">
              ${totalEarnings.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Active Deals</div>
            <div className="text-2xl font-bold text-orange-600">{activeCount}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Completed</div>
            <div className="text-2xl font-bold text-gray-700">{completedCount}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Deals</div>
            <div className="text-2xl font-bold text-gray-700">{deals.length}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'active'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'completed'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>Add NIL Deal</span>
          </button>
        </div>
      </div>

      {/* Deals List */}
      {deals.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-600 mb-4 text-lg">No NIL deals yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-orange-500 hover:underline font-medium"
          >
            Create your first deal →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} onUpdate={fetchDeals} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateDealModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchDeals();
          }}
        />
      )}
    </div>
  );
}
