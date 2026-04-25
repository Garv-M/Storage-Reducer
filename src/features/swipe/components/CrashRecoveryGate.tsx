import { useEffect, useRef } from 'react';

import { usePathname, useRouter } from 'expo-router';

import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';

export function CrashRecoveryGate() {
  const router = useRouter();
  const pathname = usePathname();
  const hasAttempted = useRef(false);

  const onboarded = useSettingsStore((state) => state.onboarded);
  const findResumable = useSessionStore((state) => state.findResumable);
  const setActiveSession = useSessionStore((state) => state.setActiveSession);

  useEffect(() => {
    if (hasAttempted.current) return;
    if (!onboarded) return;

    const resumable = findResumable();
    if (!resumable) {
      hasAttempted.current = true;
      return;
    }

    if (pathname === '/(tabs)/home' || pathname === '/') {
      setActiveSession(resumable.id);
      router.replace(`/session/${resumable.id}`);
    }

    hasAttempted.current = true;
  }, [findResumable, onboarded, pathname, router, setActiveSession]);

  return null;
}
