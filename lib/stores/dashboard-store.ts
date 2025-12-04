/**
 * Dashboard UI State Store (Zustand)
 *
 * Manages global UI state for the dashboard including:
 * - Sidebar collapsed/expanded state
 * - Active tab/view
 * - Modal states
 * - Filter states
 * - Sort preferences
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardState {
  // Sidebar state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Active view/tab
  activeView: 'overview' | 'matches' | 'deals' | 'messages' | 'analytics';
  setActiveView: (view: DashboardState['activeView']) => void;

  // Modal states
  matchDetailModalOpen: boolean;
  selectedMatchId: string | null;
  openMatchDetailModal: (matchId: string) => void;
  closeMatchDetailModal: () => void;

  dealDetailModalOpen: boolean;
  selectedDealId: string | null;
  openDealDetailModal: (dealId: string) => void;
  closeDealDetailModal: () => void;

  // Filters
  matchStatusFilter: 'all' | 'pending' | 'active' | 'converted' | 'declined';
  setMatchStatusFilter: (status: DashboardState['matchStatusFilter']) => void;

  dealStatusFilter: 'all' | 'pending' | 'active' | 'completed' | 'cancelled';
  setDealStatusFilter: (status: DashboardState['dealStatusFilter']) => void;

  // Sort preferences
  matchSortBy: 'match_score' | 'created_at' | 'updated_at';
  matchSortOrder: 'asc' | 'desc';
  setMatchSort: (sortBy: DashboardState['matchSortBy'], order: DashboardState['matchSortOrder']) => void;

  dealSortBy: 'deal_amount' | 'created_at' | 'status';
  dealSortOrder: 'asc' | 'desc';
  setDealSort: (sortBy: DashboardState['dealSortBy'], order: DashboardState['dealSortOrder']) => void;

  // Notifications panel
  notificationsPanelOpen: boolean;
  toggleNotificationsPanel: () => void;
  setNotificationsPanelOpen: (open: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Reset all filters
  resetFilters: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      // Initial state
      sidebarCollapsed: false,
      activeView: 'overview',
      matchDetailModalOpen: false,
      selectedMatchId: null,
      dealDetailModalOpen: false,
      selectedDealId: null,
      matchStatusFilter: 'all',
      dealStatusFilter: 'all',
      matchSortBy: 'match_score',
      matchSortOrder: 'desc',
      dealSortBy: 'created_at',
      dealSortOrder: 'desc',
      notificationsPanelOpen: false,
      searchQuery: '',

      // Actions
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setActiveView: (view) => set({ activeView: view }),

      openMatchDetailModal: (matchId) => set({
        matchDetailModalOpen: true,
        selectedMatchId: matchId
      }),
      closeMatchDetailModal: () => set({
        matchDetailModalOpen: false,
        selectedMatchId: null
      }),

      openDealDetailModal: (dealId) => set({
        dealDetailModalOpen: true,
        selectedDealId: dealId
      }),
      closeDealDetailModal: () => set({
        dealDetailModalOpen: false,
        selectedDealId: null
      }),

      setMatchStatusFilter: (status) => set({ matchStatusFilter: status }),
      setDealStatusFilter: (status) => set({ dealStatusFilter: status }),

      setMatchSort: (sortBy, order) => set({ matchSortBy: sortBy, matchSortOrder: order }),
      setDealSort: (sortBy, order) => set({ dealSortBy: sortBy, dealSortOrder: order }),

      toggleNotificationsPanel: () => set((state) => ({
        notificationsPanelOpen: !state.notificationsPanelOpen
      })),
      setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      resetFilters: () => set({
        matchStatusFilter: 'all',
        dealStatusFilter: 'all',
        searchQuery: ''
      })
    }),
    {
      name: 'chatnil-dashboard-state',
      // Only persist UI preferences, not temporary state like open modals
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        activeView: state.activeView,
        matchSortBy: state.matchSortBy,
        matchSortOrder: state.matchSortOrder,
        dealSortBy: state.dealSortBy,
        dealSortOrder: state.dealSortOrder
      })
    }
  )
);
