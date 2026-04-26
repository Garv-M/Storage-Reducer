// Deletion service coordinates irreversible media deletion after app-level confirmation.
// It enforces batching, fallback retries, and post-delete store/stat bookkeeping.

import { Alert, Platform } from 'react-native';

import { deleteAssetsAsync } from '@/services/media/MediaLibrary';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useStatsStore } from '@/stores/statsStore';
import { useTrashStore } from '@/stores/trashStore';

// ── Constants & Local Types ───────────────────────────────────────────────────

// Bounded batch size reduces bridge/native API stress for large delete operations.
const DELETE_BATCH_SIZE = 200;

interface ExecuteDeleteResult {
  success: string[];
  failed: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Splits IDs into fixed-size chunks for sequential batch deletion.
 *
 * We prefer deterministic batching over full parallelism so one large request
 * does not destabilize native media APIs on slower devices.
 */
const chunk = (ids: string[], size: number): string[][] => {
  const result: string[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    result.push(ids.slice(i, i + size));
  }
  return result;
};

// ── Service ────────────────────────────────────────────────────────────────────

/**
 * Service for staged-confirmed deletion lifecycle operations.
 */
export const DeletionService = {
  /**
   * Confirms currently staged items using the active retention policy.
   *
   * Completing the session here ties "session complete" to explicit user
   * confirmation, not to eventual physical deletion success.
   */
  confirmStaged(sessionId: string) {
    const retentionDays = useSettingsStore.getState().retentionDays;
    const confirmed = useTrashStore.getState().confirmStaged(retentionDays);

    if (confirmed.length > 0) {
      useSessionStore.getState().completeSession(sessionId);
      useStatsStore.getState().incrementSessionsCompleted();
    }

    return confirmed;
  },

  /**
   * Deletes asset IDs with a two-pass strategy:
   * 1) bulk delete per batch for efficiency
   * 2) per-ID retry when a batch fails to recover partial success
   */
  async executeDelete(assetIds: string[]): Promise<ExecuteDeleteResult> {
    if (assetIds.length === 0) {
      return { success: [], failed: [] };
    }

    const batches = chunk(assetIds, DELETE_BATCH_SIZE);
    const success: string[] = [];
    const failed: string[] = [];

    // Sequential processing prevents unbounded concurrent native delete calls.
    for (const batch of batches) {
      try {
        await deleteAssetsAsync(batch);
        success.push(...batch);
      } catch {
        // One failing item can poison a bulk call; retry individually to isolate
        // the problematic IDs (shared albums, unavailable items, etc.).
        for (const id of batch) {
          try {
            await deleteAssetsAsync([id]);
            success.push(id);
          } catch {
            failed.push(id);
          }
        }
      }
    }

    // Services execute outside React render, so Zustand state is accessed via
    // getState() rather than hooks.
    const trashStore = useTrashStore.getState();
    if (success.length > 0) {
      const successSet = new Set(success);
      const bytes = trashStore.confirmed
        .filter((item) => successSet.has(item.assetId))
        .reduce((sum, item) => sum + item.bytes, 0);

      useStatsStore.getState().addFreedBytes(bytes);
      trashStore.removeConfirmed(success);
      // Also clear from failed history in case an item succeeds on a later retry.
      trashStore.removeFromFailed(success);
    }

    if (failed.length > 0) {
      // Keep failed IDs for user-visible retry/restore actions.
      trashStore.addFailedDeletions(failed);
      if (Platform.OS === 'ios') {
        // iOS error copy is more specific because shared/cloud constraints are
        // common causes of deletion failures in Photos.
        Alert.alert(
          'Some photos could not be deleted',
          'A few items may be in shared albums or unavailable. They were kept in Failed Deletions.'
        );
      } else {
        Alert.alert('Some photos could not be deleted', 'Failed items were kept in Failed Deletions.');
      }
    }

    return { success, failed };
  },

  /**
   * Deletes every currently confirmed trash item.
   */
  async emptyTrash() {
    const ids = useTrashStore.getState().confirmed.map((item) => item.assetId);
    return this.executeDelete(ids);
  },
};
