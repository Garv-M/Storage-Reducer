import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createMmkvStorage } from '@/services/persistence/zustandStorage';

interface StreakStats {
  current: number;
  longest: number;
  lastActiveDate: string | null;
}

interface StatsStoreState {
  totalFreedBytes: number;
  photosReviewed: number;
  favoritesCount: number;
  sessionsCompleted: number;
  lastReviewedAssetCreatedAt: number;
  streak: StreakStats;
  weeklyActivity: Record<string, number>;
  addFreedBytes: (bytes: number) => void;
  incrementReviewed: (createdAt?: number) => void;
  incrementFavorites: () => void;
  incrementSessionsCompleted: () => void;
  setLastReviewedAssetCreatedAt: (createdAt: number) => void;
  updateStreak: () => void;
}

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const getDateOffsetKey = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return toDateKey(date);
};

export const useStatsStore = create<StatsStoreState>()(
  persist(
    (set) => ({
      totalFreedBytes: 0,
      photosReviewed: 0,
      favoritesCount: 0,
      sessionsCompleted: 0,
      lastReviewedAssetCreatedAt: 0,
      streak: {
        current: 0,
        longest: 0,
        lastActiveDate: null,
      },
      weeklyActivity: {},
      addFreedBytes: (bytes) => set((state) => ({ totalFreedBytes: Math.max(0, state.totalFreedBytes + bytes) })),
      incrementReviewed: (createdAt) =>
        set((state) => {
          const today = toDateKey(new Date());
          return {
            photosReviewed: state.photosReviewed + 1,
            lastReviewedAssetCreatedAt: Math.max(state.lastReviewedAssetCreatedAt, createdAt ?? 0),
            weeklyActivity: {
              ...state.weeklyActivity,
              [today]: (state.weeklyActivity[today] ?? 0) + 1,
            },
          };
        }),
      incrementFavorites: () => set((state) => ({ favoritesCount: state.favoritesCount + 1 })),
      incrementSessionsCompleted: () => set((state) => ({ sessionsCompleted: state.sessionsCompleted + 1 })),
      setLastReviewedAssetCreatedAt: (createdAt) =>
        set((state) => ({ lastReviewedAssetCreatedAt: Math.max(state.lastReviewedAssetCreatedAt, createdAt) })),
      updateStreak: () =>
        set((state) => {
          const today = getDateOffsetKey(0);
          const yesterday = getDateOffsetKey(-1);

          if (state.streak.lastActiveDate === today) {
            return state;
          }

          if (state.streak.lastActiveDate === yesterday) {
            const current = state.streak.current + 1;
            return {
              streak: {
                current,
                longest: Math.max(state.streak.longest, current),
                lastActiveDate: today,
              },
            };
          }

          return {
            streak: {
              current: 1,
              longest: Math.max(state.streak.longest, 1),
              lastActiveDate: today,
            },
          };
        }),
    }),
    {
      name: 'stats-store-v1',
      storage: createJSONStorage(() => createMmkvStorage()),
    }
  )
);
