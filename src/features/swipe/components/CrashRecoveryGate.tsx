// Navigation guard that resumes an interrupted swipe session after relaunch.
// Runs once after initial paint to avoid route churn during app bootstrap.

import { useEffect, useRef, useState } from 'react';

import { usePathname, useRouter } from 'expo-router';

import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';

/**
 * Detects resumable sessions and redirects users back into the active flow.
 */
export function CrashRecoveryGate() {
  const router = useRouter();
  const pathname = usePathname();
  const hasAttempted = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const onboarded = useSettingsStore((state) => state.onboarded);
  const findResumable = useSessionStore((state) => state.findResumable);
  const setActiveSession = useSessionStore((state) => state.setActiveSession);

  useEffect(() => {
    // Delay recovery check one frame so router/store state is settled first.
    requestAnimationFrame(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (hasAttempted.current) return;
    if (!onboarded) return;

    const resumable = findResumable();
    if (!resumable) {
      hasAttempted.current = true;
      return;
    }

    // Only auto-redirect from root/home entry points to avoid hijacking deep links.
    if (pathname === '/(tabs)/home' || pathname === '/') {
      setActiveSession(resumable.id);
      router.replace(`/session/${resumable.id}`);
    }

    // Single-attempt guard prevents repeat navigation loops across rerenders.
    hasAttempted.current = true;
  }, [isReady, findResumable, onboarded, pathname, router, setActiveSession]);

  return null;
}