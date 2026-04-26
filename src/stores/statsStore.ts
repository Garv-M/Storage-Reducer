// Lightweight persisted counters for user-visible app stats and progress summaries.
// Keeps aggregate metrics separate from session/trash transactional state.

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createMmkvStorage } from '@/services/persistence/zustandStorage';

interface StatsStoreState {
  totalFreedBytes: number;
  photosReviewed: number;
  favoritesCount: number;
  sessionsCompleted: number;

  /**
   * Adds reclaimed bytes to the lifetime counter.
   * Counter is clamped at 0 to avoid displaying negative storage reclaimed.
   */
  addFreedBytes: (bytes: number) => void;

  /**
   * Increments number of photos the user has reviewed.
   */
  incrementReviewed: () => void;

  /**
   * Increments number of photos favorited/kept by explicit positive action.
   */
  incrementFavorites: () => void;

  /**
   * Increments completed swipe sessions for progress tracking.
   */
  incrementSessionsCompleted: () => void;
}

/**
 * Persisted stats store for aggregate counters shown in dashboards and summaries.
 */
export const useStatsStore = create<StatsStoreState>()(
  persist(
    (set) => ({
      // ── State ───────────────────────────────────────────────────────────────────
      totalFreedBytes: 0,
      photosReviewed: 0,
      favoritesCount: 0,
      sessionsCompleted: 0,

      // ── Actions ─────────────────────────────────────────────────────────────────
      addFreedBytes: (bytes) => set((state) => ({ totalFreedBytes: Math.max(0, state.totalFreedBytes + bytes) })),
      incrementReviewed: () => set((state) => ({ photosReviewed: state.photosReviewed + 1 })),
      incrementFavorites: () => set((state) => ({ favoritesCount: state.favoritesCount + 1 })),
      incrementSessionsCompleted: () => set((state) => ({ sessionsCompleted: state.sessionsCompleted + 1 })),
    }),
    {
      name: 'stats-store-v1',
      storage: createJSONStorage(() => createMmkvStorage()),
    }
  )
);
