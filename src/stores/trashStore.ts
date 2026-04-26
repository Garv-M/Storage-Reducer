// Trash state for two-phase deletion: staged items, confirmed items, and failed deletions.
// Persists enough metadata to enforce retention and support retry UX.

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

  /**
   * Adds/updates an asset in staged trash.
   * Keying by asset ID guarantees latest metadata wins and prevents duplicate stage rows.
   */
  addStaged: (asset: Asset) => void;

  /**
   * Removes one asset from staged trash.
   */
  removeStaged: (assetId: string) => void;

  /**
   * Clears staged trash after confirmation or bulk cancel.
   */
  clearStaged: () => void;

  /**
   * Moves all staged items to confirmed deletion with one shared expiration timestamp.
   * Returns the confirmed payload so callers can trigger scheduling/UI updates.
   */
  confirmStaged: (retentionDays: number) => ConfirmedTrashItem[];

  /**
   * Removes confirmed items after successful physical deletion.
   */
  removeConfirmed: (assetIds: string[]) => void;

  /**
   * Tracks assets that failed deletion so retry flows can target them later.
   */
  addFailedDeletions: (assetIds: string[]) => void;

  /**
   * Clears IDs from failed list once retry succeeds.
   */
  removeFromFailed: (assetIds: string[]) => void;

  /**
   * Returns confirmed items whose retention window has elapsed.
   */
  getExpiredItems: () => ConfirmedTrashItem[];

  /**
   * Returns staged items sorted newest-first for predictable review UX.
   */
  getStagedList: () => StagedTrashItem[];
}

/**
 * Persisted trash store that models the app's two-phase deletion lifecycle.
 */
export const useTrashStore = create<TrashStoreState>()(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────────────────────────
      staged: {},
      confirmed: [],
      failedDeletions: [],

      // ── Actions: Stage management ───────────────────────────────────────────────
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
          // Local copy + delete keeps mutation isolated and compatible with immutable return.
          delete next[assetId];
          return { staged: next };
        });
      },
      clearStaged: () => set({ staged: {} }),

      // ── Actions: Confirmation + retention ───────────────────────────────────────
      confirmStaged: (retentionDays) => {
        const stagedItems = Object.values(get().staged);
        if (!stagedItems.length) return [];

        // 86_400_000 ms = 24h; retention is day-based for product-level settings clarity.
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
            // Overwrite existing entry so reconfirming refreshes metadata/expiry deterministically.
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

      // ── Actions: Failed deletion tracking ───────────────────────────────────────
      addFailedDeletions: (assetIds) => {
        if (!assetIds.length) return;
        set((state) => ({
          // Set merge keeps this list unique even across repeated failure retries.
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

      // ── Selectors ────────────────────────────────────────────────────────────────
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
