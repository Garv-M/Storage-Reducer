import { useEffect } from 'react';

import { AppState } from 'react-native';

import { DeletionService } from '@/services/deletion/DeletionService';
import { useTrashStore } from '@/stores/trashStore';

export const runRetentionCheck = async () => {
  const expired = useTrashStore.getState().getExpiredItems();
  if (!expired.length) return { success: [], failed: [] };

  return DeletionService.executeDelete(expired.map((item) => item.assetId));
};

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
