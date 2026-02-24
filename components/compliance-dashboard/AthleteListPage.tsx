'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { AthleteFilters } from './AthleteFilters';
import { AthleteTable } from './AthleteTable';
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface Athlete {
  id: string;
  name: string;
  sport: string;
  dealCount: number;
  worstScore: number | null;
  worstStatus: string | null;
  totalEarnings: number;
  lastDealDate: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export function AthleteListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    searchParams.get('status')?.split(',').filter(Boolean) || []
  );
  const [selectedSport, setSelectedSport] = useState(searchParams.get('sport') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'severity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1')
  );

  const [sports, setSports] = useState<string[]>([]);
  const focusSearch = searchParams.get('focus') === 'search';

  const fetchAthletes = useCallback(async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (selectedStatuses.length > 0) params.set('status', selectedStatuses.join(','));
      if (selectedSport) params.set('sport', selectedSport);
      if (sortBy) params.set('sortBy', sortBy);
      if (sortOrder) params.set('sortOrder', sortOrder);

      const response = await fetch(`/api/compliance/athletes?${params.toString()}`, {
        credentials: 'include',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. This page is for compliance officers only.');
          return;
        }
        throw new Error('Failed to load athletes');
      }

      const data = await response.json();
      setAthletes(data.athletes);
      setPagination(data.pagination);

      // Extract unique sports for filter
      const uniqueSports = [...new Set(data.athletes.map((a: Athlete) => a.sport))].filter(Boolean) as string[];
      if (uniqueSports.length > 0 && sports.length === 0) {
        setSports(uniqueSports.sort());
      }
    } catch (err) {
      console.error('Fetch athletes error:', err);
      setError('Failed to load athletes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, selectedStatuses, selectedSport, sortBy, sortOrder, sports.length]);

  useEffect(() => {
    fetchAthletes();
  }, [fetchAthletes]);

  // Sync filter state when URL searchParams change (e.g., sidebar quick filter clicks)
  useEffect(() => {
    const urlStatus = searchParams.get('status')?.split(',').filter(Boolean) || [];
    const urlSport = searchParams.get('sport') || '';
    const urlSearch = searchParams.get('search') || '';
    const urlSortBy = searchParams.get('sortBy') || 'severity';
    const urlSortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const urlPage = parseInt(searchParams.get('page') || '1');

    setSelectedStatuses(urlStatus);
    setSelectedSport(urlSport);
    setSearch(urlSearch);
    setSortBy(urlSortBy);
    setSortOrder(urlSortOrder);
    setCurrentPage(urlPage);
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedStatuses.length > 0) params.set('status', selectedStatuses.join(','));
    if (selectedSport) params.set('sport', selectedSport);
    if (sortBy !== 'severity') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '';
    window.history.replaceState({}, '', `/compliance/athletes${newUrl}`);
  }, [search, selectedStatuses, selectedSport, sortBy, sortOrder, currentPage]);

  const handleExport = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const params = new URLSearchParams();
      params.set('format', 'csv');
      if (selectedStatuses.length > 0) params.set('status', selectedStatuses.join(','));

      const response = await fetch(`/api/compliance/export?${params.toString()}`, {
        credentials: 'include',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `athletes_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-lg">
          <span className="text-5xl">🛡️</span>
          <h2 className="text-xl font-bold text-gray-900 mt-4">Access Restricted</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => router.push('/compliance/dashboard')}
            className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="athlete-list-page" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push('/compliance/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Athletes</h1>
              <p className="text-sm text-gray-500 mt-1">
                {pagination.totalItems} athletes total
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <AthleteFilters
          search={search}
          onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
          selectedStatuses={selectedStatuses}
          onStatusChange={(s) => { setSelectedStatuses(s); setCurrentPage(1); }}
          selectedSport={selectedSport}
          onSportChange={(s) => { setSelectedSport(s); setCurrentPage(1); }}
          sports={sports}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          focusSearch={focusSearch}
        />

        {/* Table */}
        <AthleteTable
          athletes={athletes}
          onViewAthlete={(id) => router.push(`/compliance/athlete/${id}`)}
          loading={loading}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div
            data-testid="pagination"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3"
          >
            <p className="text-sm text-gray-500">
              Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(currentPage * pagination.limit, pagination.totalItems)} of{' '}
              {pagination.totalItems} athletes
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-orange-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={currentPage === pagination.totalPages}
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
