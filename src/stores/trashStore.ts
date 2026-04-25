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
}

interface TrashStoreState {
  staged: Record<string, StagedTrashItem>;
  addStaged: (asset: Asset) => void;
  removeStaged: (assetId: string) => void;
  clearStaged: () => void;
  getStagedList: () => StagedTrashItem[];
}

export const useTrashStore = create<TrashStoreState>()(
  persist(
    (set, get) => ({
      staged: {},
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
      getStagedList: () =>
        Object.values(get().staged).sort((a, b) => b.createdAt - a.createdAt),
    }),
    {
      name: 'trash-store-v1',
      storage: createJSONStorage(() => createMmkvStorage()),
      partialize: (state) => ({ staged: state.staged }),
    }
  )
);
