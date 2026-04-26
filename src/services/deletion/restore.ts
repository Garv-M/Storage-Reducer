// Restore service removes IDs from app trash tracking and reapplies KEEP intent.
// It intentionally updates session decision history when an active session exists.

import { useSessionStore } from '@/stores/sessionStore';
import { useTrashStore } from '@/stores/trashStore';

// ── Restore Operations ─────────────────────────────────────────────────────────

/**
 * Restores assets from app-level trash buckets.
 *
 * This does not recover OS-deleted files; it only reverses app tracking state
 * before permanent deletion has happened.
 */
export const restoreFromTrash = (assetIds: string[]) => {
  if (!assetIds.length) return;

  const trashStore = useTrashStore.getState();
  // Remove from both collections so restore behaves the same regardless of
  // whether an item came from confirmed or failed deletion lists.
  trashStore.removeConfirmed(assetIds);
  trashStore.removeFromFailed(assetIds);

  const activeSessionId = useSessionStore.getState().activeSessionId;
  if (!activeSessionId) return;

  const { recordDecision } = useSessionStore.getState();
  // Re-record KEEP to preserve session audit consistency with final user intent.
  assetIds.forEach((assetId) => {
    recordDecision(assetId, 'KEEP');
  });
};

/**
 * Bulk-friendly alias for restoring multiple assets.
 */
export const bulkRestore = (assetIds: string[]) => {
  restoreFromTrash(assetIds);
};
