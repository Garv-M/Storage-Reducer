import { Alert, Platform } from 'react-native';

import { deleteAssetsAsync } from '@/services/media/MediaLibrary';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useStatsStore } from '@/stores/statsStore';
import { useTrashStore } from '@/stores/trashStore';

const DELETE_BATCH_SIZE = 200;

interface ExecuteDeleteResult {
  success: string[];
  failed: string[];
}

const chunk = (ids: string[], size: number): string[][] => {
  const result: string[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    result.push(ids.slice(i, i + size));
  }
  return result;
};

export const DeletionService = {
  confirmStaged(sessionId: string) {
    const retentionDays = useSettingsStore.getState().retentionDays;
    const confirmed = useTrashStore.getState().confirmStaged(retentionDays);

    if (confirmed.length > 0) {
      useSessionStore.getState().completeSession(sessionId);
      useStatsStore.getState().incrementSessionsCompleted();
    }

    return confirmed;
  },

  async executeDelete(assetIds: string[]): Promise<ExecuteDeleteResult> {
    if (assetIds.length === 0) {
      return { success: [], failed: [] };
    }

    const batches = chunk(assetIds, DELETE_BATCH_SIZE);
    const success: string[] = [];
    const failed: string[] = [];

    for (const batch of batches) {
      try {
        await deleteAssetsAsync(batch);
        success.push(...batch);
      } catch {
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

    const trashStore = useTrashStore.getState();
    if (success.length > 0) {
      const successSet = new Set(success);
      const bytes = trashStore.confirmed
        .filter((item) => successSet.has(item.assetId))
        .reduce((sum, item) => sum + item.bytes, 0);

      useStatsStore.getState().addFreedBytes(bytes);
      trashStore.removeConfirmed(success);
      trashStore.removeFromFailed(success);
    }

    if (failed.length > 0) {
      trashStore.addFailedDeletions(failed);
      if (Platform.OS === 'ios') {
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

  async emptyTrash() {
    const ids = useTrashStore.getState().confirmed.map((item) => item.assetId);
    return this.executeDelete(ids);
  },
};
