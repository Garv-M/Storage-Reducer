// Retention scheduler auto-executes deletion for expired confirmed trash items.
// It runs on mount and whenever the app returns to foreground.

import { useEffect } from 'react';

import { AppState } from 'react-native';

import { DeletionService } from '@/services/deletion/DeletionService';
import { useTrashStore } from '@/stores/trashStore';

// ── Retention Check ────────────────────────────────────────────────────────────

/**
 * Deletes confirmed items whose retention window has expired.
 */
export const runRetentionCheck = async () => {
  const expired = useTrashStore.getState().getExpiredItems();
  if (!expired.length) return { success: [], failed: [] };

  return DeletionService.executeDelete(expired.map((item) => item.assetId));
};

// ── Scheduler Hook ─────────────────────────────────────────────────────────────

/**
 * Hook that schedules retention checks for app lifecycle transitions.
 *
 * Foreground checks ensure cleanup still runs even if the app was backgrounded
 * past the expiry boundary.
 */
export const useRetentionScheduler = () => {
  useEffect(() => {
    void runRetentionCheck();

    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        void runRetentionCheck();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
};
