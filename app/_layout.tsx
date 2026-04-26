// Root Expo Router layout for global app bootstrap.
// Owns startup sequencing (fonts, splash, migrations) and provider wiring.

import '../global.css';

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CrashRecoveryGate } from '@/features/swipe/components/CrashRecoveryGate';
import { useRetentionScheduler } from '@/services/deletion/retentionScheduler';
import { runMigrations } from '@/services/persistence/migrations';

// Keep splash visible before React tree mounts.
// WHY module scope: calling this in an effect can be too late on fast devices.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// ── Startup side effects ──────────────────────────────────────────────────────
// Run migrations exactly once at boot so persisted state shape matches app code.
runMigrations();

/**
 * App root component rendered by Expo Router.
 */
export default function RootLayout() {
  // Starts background retention housekeeping for staged trash expiry.
  useRetentionScheduler();

  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  /**
   * Hides splash after typography is ready to avoid first-frame text reflow.
   */
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // Secondary safety path in case layout callback ordering differs by platform.
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Avoid rendering UI until font metrics are stable.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    // Provider nesting is intentional for gesture correctness + global availability.
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            {/* Prevents hydration errors from failing silently by redirecting safely. */}
            <CrashRecoveryGate />
            <Slot />
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
