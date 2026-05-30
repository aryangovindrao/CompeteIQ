'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Client-only UI state (sidebar collapse, mobile drawer, ws status). */
interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;

  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;

  learnGroupOpen: boolean;
  toggleLearnGroup: () => void;

  wsStatus: 'connected' | 'reconnecting' | 'disconnected';
  setWsStatus: (s: UIState['wsStatus']) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      mobileNavOpen: false,
      setMobileNavOpen: (v) => set({ mobileNavOpen: v }),

      learnGroupOpen: true,
      toggleLearnGroup: () =>
        set((s) => ({ learnGroupOpen: !s.learnGroupOpen })),

      wsStatus: 'disconnected',
      setWsStatus: (s) => set({ wsStatus: s }),
    }),
    {
      name: 'competeiq-ui',
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    },
  ),
);
