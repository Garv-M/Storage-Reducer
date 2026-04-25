import '../global.css';

import { useEffect, useMemo } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LockScreenContent } from './lock';
import { useAppLock } from '@/features/lock/hooks/useAppLock';
import { CrashRecoveryGate } from '@/features/swipe/components/CrashRecoveryGate';
import { useRetentionScheduler } from '@/services/deletion/retentionScheduler';
import { runMigrations } from '@/services/persistence/migrations';
import { useSettingsStore } from '@/stores/settingsStore';

const queryClient = new QueryClient();
runMigrations();

export default function RootLayout() {
  useRetentionScheduler();
  const { isLocked, isLockEnabled } = useAppLock();
  const themePreference = useSettingsStore((state) => state.theme);
  const systemColorScheme = useSystemColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();

  const resolvedTheme = useMemo<'light' | 'dark'>(
    () => (themePreference === 'system' ? (systemColorScheme ?? 'light') : themePreference),
    [systemColorScheme, themePreference]
  );

  useEffect(() => {
    setColorScheme(resolvedTheme);
  }, [resolvedTheme, setColorScheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
          <CrashRecoveryGate />
          {isLockEnabled && isLocked ? <LockScreenContent /> : <Slot />}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
