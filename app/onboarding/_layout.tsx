// Stack container for onboarding-only screens.
// Keeps onboarding flow isolated from tab/session navigation history.

import { Stack } from 'expo-router';

/**
 * Onboarding navigator.
 */
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
