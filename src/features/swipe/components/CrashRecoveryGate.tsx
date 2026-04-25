import { useEffect, useRef } from 'react';

import { usePathname, useRouter } from 'expo-router';

import { useLockStore } from '@/stores/lockStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function CrashRecoveryGate() {
  const router = useRouter();
  const pathname = usePathname();
  const hasAttempted = useRef(false);

  const onboarded = useSettingsStore((state) => state.onboarded);
  const isLocked = useLockStore((state) => state.isLocked);
  const isLockEnabled = useLockStore((state) => state.isLockEnabled);
  const findResumable = useSessionStore((state) => state.findResumable);
  const setActiveSession = useSessionStore((state) => state.setActiveSession);

  useEffect(() => {
    if (hasAttempted.current) return;
    if (!onboarded) return;
    if (isLockEnabled && isLocked) return;

    const resumable = findResumable();
    if (!resumable) {
      hasAttempted.current = true;
      return;
    }

    if (pathname === '/(tabs)/home' || pathname === '/') {
      setActiveSession(resumable.id);
      const timer = setTimeout(() => {
        router.replace(`/session/${resumable.id}`);
      }, 0);
      hasAttempted.current = true;
      return () => clearTimeout(timer);
    }

    hasAttempted.current = true;
  }, [findResumable, isLocked, isLockEnabled, onboarded, pathname, router, setActiveSession]);

  return null;
}
