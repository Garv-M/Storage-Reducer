import { Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { RETENTION_OPTIONS } from '@/constants/retention';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTrashStore } from '@/stores/trashStore';

export default function SettingsTabScreen() {
  const retentionDays = useSettingsStore((state) => state.retentionDays);
  const setRetentionDays = useSettingsStore((state) => state.setRetentionDays);
  const skipCloudOnly = useSettingsStore((state) => state.skipCloudOnly);
  const setSkipCloudOnly = useSettingsStore((state) => state.setSkipCloudOnly);

  const failedDeletions = useTrashStore((state) => state.failedDeletions);
  const removeFromFailed = useTrashStore((state) => state.removeFromFailed);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }} contentContainerStyle={{ padding: 16, paddingTop: 56, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: '#2e3a46' }}>Settings</Text>

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
  );
}
