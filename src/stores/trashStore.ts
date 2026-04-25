import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createMmkvStorage } from '@/services/persistence/zustandStorage';
import type { Asset } from '@/types/asset';

export interface StagedTrashItem {
  assetId: string;
  uri: string;
  filename: string;
  bytes: number;
  createdAt: number;
  albumIds: string[];
  isCloudOnly: boolean;
  isShared: boolean;
}

export interface ConfirmedTrashItem {
  assetId: string;
  expiresAt: number;
  bytes: number;
  uri: string;
  filename: string;
}

interface TrashStoreState {
  staged: Record<string, StagedTrashItem>;
  confirmed: ConfirmedTrashItem[];
  failedDeletions: string[];
  addStaged: (asset: Asset) => void;
  removeStaged: (assetId: string) => void;
  clearStaged: () => void;
  confirmStaged: (retentionDays: number) => ConfirmedTrashItem[];
  removeConfirmed: (assetIds: string[]) => void;
  addFailedDeletions: (assetIds: string[]) => void;
  removeFromFailed: (assetIds: string[]) => void;
  getExpiredItems: () => ConfirmedTrashItem[];
  getStagedList: () => StagedTrashItem[];
}

export const useTrashStore = create<TrashStoreState>()(
  persist(
    (set, get) => ({
      staged: {},
      confirmed: [],
      failedDeletions: [],
      addStaged: (asset) => {
        set((state) => ({
          staged: {
            ...state.staged,
            [asset.id]: {
              assetId: asset.id,
              uri: asset.uri,
              filename: asset.filename,
              bytes: asset.bytes,
              createdAt: asset.createdAt,
              albumIds: asset.albumIds,
              isCloudOnly: asset.isCloudOnly,
              isShared: asset.isShared,
            },
          },
        }));
      },
      removeStaged: (assetId) => {
        set((state) => {
          const next = { ...state.staged };
          delete next[assetId];
          return { staged: next };
        });
      },
      clearStaged: () => set({ staged: {} }),
      confirmStaged: (retentionDays) => {
        const stagedItems = Object.values(get().staged);
        if (!stagedItems.length) return [];

        const expiresAt = Date.now() + retentionDays * 86400000;
        const confirmed = stagedItems.map((item) => ({
          assetId: item.assetId,
          expiresAt,
          bytes: item.bytes,
          uri: item.uri,
          filename: item.filename,
        }));

        set((state) => {
          const existing = new Map(state.confirmed.map((item) => [item.assetId, item]));
          confirmed.forEach((item) => {
            existing.set(item.assetId, item);
          });

          return {
            staged: {},
            confirmed: Array.from(existing.values()),
          };
        });

        return confirmed;
      },
      removeConfirmed: (assetIds) => {
        if (!assetIds.length) return;
        const removeSet = new Set(assetIds);
        set((state) => ({
          confirmed: state.confirmed.filter((item) => !removeSet.has(item.assetId)),
        }));
      },
      addFailedDeletions: (assetIds) => {
        if (!assetIds.length) return;
        set((state) => ({
          failedDeletions: Array.from(new Set([...state.failedDeletions, ...assetIds])),
        }));
      },
      removeFromFailed: (assetIds) => {
        if (!assetIds.length) return;
        const removeSet = new Set(assetIds);
        set((state) => ({
          failedDeletions: state.failedDeletions.filter((id) => !removeSet.has(id)),
        }));
      },
      getExpiredItems: () => get().confirmed.filter((item) => item.expiresAt <= Date.now()),
      getStagedList: () =>
        Object.values(get().staged).sort((a, b) => b.createdAt - a.createdAt),
    }),
    {
      name: 'trash-store-v1',
      storage: createJSONStorage(() => createMmkvStorage()),
      partialize: (state) => ({
        staged: state.staged,
        confirmed: state.confirmed,
        failedDeletions: state.failedDeletions,
      }),
    }
  )
);
