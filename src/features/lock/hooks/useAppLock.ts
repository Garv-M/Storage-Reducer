import { useEffect } from 'react';

import { AppState } from 'react-native';

import { AppLockService } from '@/services/auth/AppLockService';
import { useLockStore } from '@/stores/lockStore';

export const useAppLock = () => {
  const isLocked = useLockStore((state) => state.isLocked);
  const isLockEnabled = useLockStore((state) => state.isLockEnabled);
  const setLocked = useLockStore((state) => state.setLocked);
  const setBackgroundAt = useLockStore((state) => state.setBackgroundAt);

  useEffect(() => {
    void AppLockService.initialize();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        setBackgroundAt(Date.now());
        return;
      }

      if (state !== 'active') return;

      if (!isLockEnabled) {
        setBackgroundAt(null);
        return;
      }

      if (AppLockService.shouldLock()) {
        setLocked(true);
        return;
      }

      setBackgroundAt(null);
    });

    return () => subscription.remove();
  }, [isLockEnabled, setBackgroundAt, setLocked]);

  return {
    isLocked,
    isLockEnabled,
    unlock: AppLockService.unlock,
  };
};
