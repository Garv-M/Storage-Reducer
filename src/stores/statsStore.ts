import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createMmkvStorage } from '@/services/persistence/zustandStorage';

interface StatsStoreState {
  totalFreedBytes: number;
  photosReviewed: number;
  favoritesCount: number;
  addFreedBytes: (bytes: number) => void;
  incrementReviewed: () => void;
  incrementFavorites: () => void;
}

export const useStatsStore = create<StatsStoreState>()(
  persist(
    (set) => ({
      totalFreedBytes: 0,
      photosReviewed: 0,
      favoritesCount: 0,
      addFreedBytes: (bytes) => set((state) => ({ totalFreedBytes: Math.max(0, state.totalFreedBytes + bytes) })),
      incrementReviewed: () => set((state) => ({ photosReviewed: state.photosReviewed + 1 })),
      incrementFavorites: () => set((state) => ({ favoritesCount: state.favoritesCount + 1 })),
    }),
    {
      name: 'stats-store-v1',
      storage: createJSONStorage(() => createMmkvStorage()),
    }
  )
);
