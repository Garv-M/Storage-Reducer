// Stack container for session workflow screens.
// Session routes are hidden-header to preserve immersive photo review focus.

import { Stack } from 'expo-router';

/**
 * Session navigator.
 */
export default function SessionLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
