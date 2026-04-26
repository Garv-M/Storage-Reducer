// App entry route that decides the first user destination.
// Keeps onboarding gate logic centralized so deeper routes stay pure UI.

import { Redirect } from 'expo-router';

import { useSettingsStore } from '@/stores/settingsStore';

/**
 * Redirect-only entry screen.
 * WHY: Expo Router resolves `/` first, so this is the safest place to gate onboarding once.
 */
export default function IndexScreen() {
  const onboarded = useSettingsStore((state) => state.onboarded);

  // Use replace-style redirect semantics to avoid keeping a transient gate screen in history.
  if (!onboarded) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
