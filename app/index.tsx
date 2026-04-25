import { Redirect } from 'expo-router';

import { useSettingsStore } from '@/stores/settingsStore';

export default function IndexScreen() {
  const onboarded = useSettingsStore((state) => state.onboarded);

  if (!onboarded) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
