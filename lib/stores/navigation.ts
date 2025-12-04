import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Navigation State Store
 *
 * Manages navigation UI state including:
 * - Sidebar collapse/expand state (persisted)
 * - Mobile drawer state
 * - Search modal state
 * - User menu dropdown state
 * - Notifications dropdown state
 *
 * This replaces the inefficient localStorage polling pattern in AppShell
 * with event-driven state updates via Zustand.
 */

export interface NavigationState {
  // Persistent state (saved to localStorage)
  sidebarCollapsed: boolean;
  sidebarWidth: number;

  // Ephemeral state (not persisted, resets on page refresh)
  sidebarVisible: boolean; // Mobile drawer open/closed
  searchOpen: boolean;
  notificationsOpen: boolean;
  userMenuOpen: boolean;
  mobileMenuOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarWidth: (width: number) => void;

  showSidebar: () => void;
  hideSidebar: () => void;
  setSidebarVisible: (visible: boolean) => void;

  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;

  openNotifications: () => void;
  closeNotifications: () => void;
  toggleNotifications: () => void;

  openUserMenu: () => void;
  closeUserMenu: () => void;
  toggleUserMenu: () => void;

  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;

  closeAllMenus: () => void;
  closeAllDropdowns: () => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarCollapsed: false,
      sidebarWidth: 256, // 16rem = 256px (default w-64)
      sidebarVisible: false,
      searchOpen: false,
      notificationsOpen: false,
      userMenuOpen: false,
      mobileMenuOpen: false,

      // Sidebar actions
      toggleSidebar: () => set((state) => ({
        sidebarCollapsed: !state.sidebarCollapsed
      })),

      collapseSidebar: () => set({ sidebarCollapsed: true }),

      expandSidebar: () => set({ sidebarCollapsed: false }),

      setSidebarCollapsed: (collapsed: boolean) => set({
        sidebarCollapsed: collapsed
      }),

      setSidebarWidth: (width: number) => set({
        sidebarWidth: width
      }),

      // Mobile sidebar drawer actions
      showSidebar: () => set({ sidebarVisible: true }),

      hideSidebar: () => set({ sidebarVisible: false }),

      setSidebarVisible: (visible: boolean) => set({
        sidebarVisible: visible
      }),

      // Search modal actions
      openSearch: () => set({
        searchOpen: true,
        // Close other modals/menus when opening search
        notificationsOpen: false,
        userMenuOpen: false,
        mobileMenuOpen: false
      }),

      closeSearch: () => set({ searchOpen: false }),

      toggleSearch: () => set((state) => ({
        searchOpen: !state.searchOpen,
        notificationsOpen: false,
        userMenuOpen: false,
        mobileMenuOpen: false
      })),

      // Notifications dropdown actions
      openNotifications: () => set({
        notificationsOpen: true,
        // Close other dropdowns
        userMenuOpen: false,
        searchOpen: false
      }),

      closeNotifications: () => set({ notificationsOpen: false }),

      toggleNotifications: () => set((state) => ({
        notificationsOpen: !state.notificationsOpen,
        userMenuOpen: false,
        searchOpen: false
      })),

      // User menu dropdown actions
      openUserMenu: () => set({
        userMenuOpen: true,
        // Close other dropdowns
        notificationsOpen: false,
        searchOpen: false
      }),

      closeUserMenu: () => set({ userMenuOpen: false }),

      toggleUserMenu: () => set((state) => ({
        userMenuOpen: !state.userMenuOpen,
        notificationsOpen: false,
        searchOpen: false
      })),

      // Mobile menu actions
      openMobileMenu: () => set({
        mobileMenuOpen: true,
        // Close other menus
        notificationsOpen: false,
        userMenuOpen: false
      }),

      closeMobileMenu: () => set({ mobileMenuOpen: false }),

      toggleMobileMenu: () => set((state) => ({
        mobileMenuOpen: !state.mobileMenuOpen,
        notificationsOpen: false,
        userMenuOpen: false
      })),

      // Close all menus/modals
      closeAllMenus: () => set({
        sidebarVisible: false,
        searchOpen: false,
        notificationsOpen: false,
        userMenuOpen: false,
        mobileMenuOpen: false
      }),

      // Close only dropdown menus (keep search modal if open)
      closeAllDropdowns: () => set({
        notificationsOpen: false,
        userMenuOpen: false,
        mobileMenuOpen: false
      })
    }),
    {
      name: 'chatnil-navigation', // localStorage key
      // Only persist sidebarCollapsed and sidebarWidth state
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarWidth: state.sidebarWidth
      }),
    }
  )
);

/**
 * Hook for accessing navigation state
 *
 * Usage:
 * ```tsx
 * const { sidebarCollapsed, toggleSidebar } = useNavigation();
 * ```
 */
export function useNavigation() {
  return useNavigationStore();
}

/**
 * Hook for accessing only navigation actions (never re-renders)
 *
 * Use this when you only need actions and don't care about state changes.
 * This prevents unnecessary re-renders.
 *
 * Usage:
 * ```tsx
 * const { toggleSidebar, openSearch } = useNavigationActions();
 * ```
 */
export function useNavigationActions() {
  return useNavigationStore((state) => ({
    toggleSidebar: state.toggleSidebar,
    collapseSidebar: state.collapseSidebar,
    expandSidebar: state.expandSidebar,
    setSidebarCollapsed: state.setSidebarCollapsed,
    setSidebarWidth: state.setSidebarWidth,
    showSidebar: state.showSidebar,
    hideSidebar: state.hideSidebar,
    setSidebarVisible: state.setSidebarVisible,
    openSearch: state.openSearch,
    closeSearch: state.closeSearch,
    toggleSearch: state.toggleSearch,
    openNotifications: state.openNotifications,
    closeNotifications: state.closeNotifications,
    toggleNotifications: state.toggleNotifications,
    openUserMenu: state.openUserMenu,
    closeUserMenu: state.closeUserMenu,
    toggleUserMenu: state.toggleUserMenu,
    openMobileMenu: state.openMobileMenu,
    closeMobileMenu: state.closeMobileMenu,
    toggleMobileMenu: state.toggleMobileMenu,
    closeAllMenus: state.closeAllMenus,
    closeAllDropdowns: state.closeAllDropdowns,
  }));
}

/**
 * Hook for accessing only navigation state (no actions)
 *
 * Use this when you only need to read state and don't need actions.
 *
 * Usage:
 * ```tsx
 * const { sidebarCollapsed, searchOpen } = useNavigationState();
 * ```
 */
export function useNavigationState() {
  return useNavigationStore((state) => ({
    sidebarCollapsed: state.sidebarCollapsed,
    sidebarWidth: state.sidebarWidth,
    sidebarVisible: state.sidebarVisible,
    searchOpen: state.searchOpen,
    notificationsOpen: state.notificationsOpen,
    userMenuOpen: state.userMenuOpen,
    mobileMenuOpen: state.mobileMenuOpen,
  }));
}
