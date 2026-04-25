import { useEffect } from 'react';

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { ScreenErrorBoundary } from '@/components/ScreenErrorBoundary';
import { RETENTION_OPTIONS } from '@/constants/retention';
import { AppLockService } from '@/services/auth/AppLockService';
import { isBiometricAvailable } from '@/services/auth/biometric';
import { useLockStore } from '@/stores/lockStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTrashStore } from '@/stores/trashStore';

export default function SettingsTabScreen() {
  const router = useRouter();

  const retentionDays = useSettingsStore((state) => state.retentionDays);
  const setRetentionDays = useSettingsStore((state) => state.setRetentionDays);
  const skipCloudOnly = useSettingsStore((state) => state.skipCloudOnly);
  const setSkipCloudOnly = useSettingsStore((state) => state.setSkipCloudOnly);
  const incognito = useSettingsStore((state) => state.incognito);
  const setIncognito = useSettingsStore((state) => state.setIncognito);
  const autoSkip = useSettingsStore((state) => state.autoSkip);
  const setAutoSkip = useSettingsStore((state) => state.setAutoSkip);
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  const isLockEnabled = useLockStore((state) => state.isLockEnabled);
  const biometricEnabled = useLockStore((state) => state.biometricEnabled);
  const setBiometricEnabled = useLockStore((state) => state.setBiometricEnabled);

  const failedDeletions = useTrashStore((state) => state.failedDeletions);
  const removeFromFailed = useTrashStore((state) => state.removeFromFailed);

  useEffect(() => {
    void AppLockService.initialize();
  }, []);

  return (
    <ScreenErrorBoundary title="Settings unavailable">
      <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }} contentContainerStyle={{ padding: 16, paddingTop: 56, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: '#2e3a46' }}>Settings</Text>

      <View style={{ borderWidth: 1, borderColor: '#d7dde4', borderRadius: 12, padding: 12, gap: 10 }}>
        <Text style={{ color: '#2e3a46', fontWeight: '700' }}>App lock</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#2e3a46', fontWeight: '700' }}>Enable app lock</Text>
            <Text style={{ color: '#2e3a46', marginTop: 4 }}>Require PIN/biometric when app reopens.</Text>
          </View>
          <Switch
            value={isLockEnabled}
            onValueChange={(enabled) => {
              void AppLockService.setLockEnabled(enabled);
            }}
          />
        </View>

        {isLockEnabled ? (
          <>
            <Pressable onPress={() => router.push('/onboarding/lock-setup')} style={{ paddingVertical: 8 }}>
              <Text style={{ color: '#0053e2', fontWeight: '700' }}>Change PIN</Text>
            </Pressable>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#2e3a46', fontWeight: '700' }}>Use biometric</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={(enabled) => {
                  void (async () => {
                    const available = await isBiometricAvailable();
                    if (!available) {
                      setBiometricEnabled(false);
                      return;
                    }

                    await AppLockService.setBiometricEnabled(enabled);
                  })();
                }}
              />
            </View>
          </>
        ) : null}
      </View>

      <View style={{ borderWidth: 1, borderColor: '#d7dde4', borderRadius: 12, padding: 12 }}>
        <Text style={{ color: '#2e3a46', fontWeight: '700' }}>Theme</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {(['system', 'light', 'dark'] as const).map((mode) => {
            const selected = theme === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => setTheme(mode)}
                accessibilityRole="button"
                accessibilityLabel={`Use ${mode} theme`}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: selected ? '#0053e2' : '#d7dde4',
                  backgroundColor: selected ? '#0053e2' : '#ffffff',
                }}
              >
                <Text style={{ color: selected ? '#fff' : '#2e3a46', fontWeight: '700', textTransform: 'capitalize' }}>{mode}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ borderWidth: 1, borderColor: '#d7dde4', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#2e3a46', fontWeight: '700' }}>Incognito mode</Text>
          <Text style={{ color: '#2e3a46', marginTop: 4 }}>Don’t save analytics or session history.</Text>
        </View>
        <Switch value={incognito} onValueChange={setIncognito} />
      </View>

      <View style={{ borderWidth: 1, borderColor: '#d7dde4', borderRadius: 12, padding: 12 }}>
        <Text style={{ color: '#2e3a46', fontWeight: '700' }}>Auto-skip protected photos</Text>

        <View style={{ marginTop: 10, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, color: '#2e3a46' }}>Favorites</Text>
            <Switch value={autoSkip.favorites} onValueChange={(value) => setAutoSkip({ favorites: value })} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, color: '#2e3a46' }}>Hidden</Text>
            <Switch value={autoSkip.hidden} onValueChange={(value) => setAutoSkip({ hidden: value })} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, color: '#2e3a46' }}>Shared</Text>
            <Switch value={autoSkip.shared} onValueChange={(value) => setAutoSkip({ shared: value })} />
          </View>
        </View>
      </View>

      <View style={{ borderWidth: 1, borderColor: '#d7dde4', borderRadius: 12, padding: 12 }}>
        <Text style={{ color: '#2e3a46', fontWeight: '700' }}>Trash Retention</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {RETENTION_OPTIONS.map((days) => {
            const selected = retentionDays === days;
            return (
              <Pressable
                key={days}
                onPress={() => setRetentionDays(days)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: selected ? '#0053e2' : '#d7dde4',
                  backgroundColor: selected ? '#0053e2' : '#ffffff',
                }}
              >
                <Text style={{ color: selected ? '#ffffff' : '#2e3a46', fontWeight: '700' }}>{`${days} days`}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ borderWidth: 1, borderColor: '#d7dde4', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#2e3a46', fontWeight: '700' }}>Skip cloud-only photos</Text>
          <Text style={{ color: '#2e3a46', marginTop: 4 }}>Hide iCloud-only items in review.</Text>
        </View>
        <Switch value={skipCloudOnly} onValueChange={setSkipCloudOnly} />
      </View>

      {failedDeletions.length > 0 ? (
        <View style={{ borderWidth: 1, borderColor: '#ea1100', borderRadius: 12, padding: 12, backgroundColor: '#fff5f5' }}>
          <Text style={{ color: '#ea1100', fontWeight: '700' }}>Failed deletions</Text>
          <Text style={{ color: '#2e3a46', marginTop: 4 }}>{`${failedDeletions.length} photos could not be deleted.`}</Text>
          <Pressable onPress={() => removeFromFailed(failedDeletions)} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
            <Text style={{ color: '#0053e2', fontWeight: '700' }}>Clear list</Text>
          </Pressable>
        </View>
      ) : null}
      </ScrollView>
    </ScreenErrorBoundary>
  );
}
