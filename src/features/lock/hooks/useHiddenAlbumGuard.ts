import { useEffect, useState } from 'react';

import { AppLockService } from '@/services/auth/AppLockService';
import { useLockStore } from '@/stores/lockStore';

export const useHiddenAlbumGuard = (isHiddenAlbumSource: boolean) => {
  const [isAuthorized, setIsAuthorized] = useState(!isHiddenAlbumSource);
  const biometricEnabled = useLockStore((state) => state.biometricEnabled);
  const setLocked = useLockStore((state) => state.setLocked);

  useEffect(() => {
    if (!isHiddenAlbumSource) {
      setIsAuthorized(true);
      return;
    }

    void (async () => {
      const success = biometricEnabled ? await AppLockService.unlock('biometric') : false;
      if (success) {
        setIsAuthorized(true);
        return;
      }

      setLocked(true);
      setIsAuthorized(false);
    })();
  }, [biometricEnabled, isHiddenAlbumSource, setLocked]);

  return { isAuthorized };
};
