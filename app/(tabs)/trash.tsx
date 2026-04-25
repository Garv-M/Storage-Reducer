import { useMemo, useState } from 'react';

import { Pressable, ScrollView, Text, View } from 'react-native';

import { ScreenErrorBoundary } from '@/components/ScreenErrorBoundary';
import { BulkActionBar } from '@/features/trash/components/BulkActionBar';
import { TrashGrid } from '@/features/trash/components/TrashGrid';
import { DeletionService } from '@/services/deletion/DeletionService';
import { runRetentionCheck } from '@/services/deletion/retentionScheduler';
import { bulkRestore } from '@/services/deletion/restore';
import { useTrashStore } from '@/stores/trashStore';

const sortByExpiry = (a: { expiresAt: number }, b: { expiresAt: number }) => a.expiresAt - b.expiresAt;

export default function TrashTabScreen() {
  const confirmed = useTrashStore((state) => state.confirmed);
  const [activeSegment, setActiveSegment] = useState<'trash' | 'info'>('trash');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [resetSelectionKey, setResetSelectionKey] = useState(0);

  const sortedItems = useMemo(() => [...confirmed].sort(sortByExpiry), [confirmed]);

  const onRefresh = async () => {
    setRefreshing(true);
    await runRetentionCheck();
    setRefreshing(false);
  };

  const onRestoreSelected = () => {
    bulkRestore(selectedIds);
    setResetSelectionKey((prev) => prev + 1);
  };

  const onDeleteSelectedNow = async () => {
    await DeletionService.executeDelete(selectedIds);
    setResetSelectionKey((prev) => prev + 1);
  };

  const onEmptyAllTrash = async () => {
    await DeletionService.emptyTrash();
    setResetSelectionKey((prev) => prev + 1);
  };

  return (
    <ScreenErrorBoundary title="Trash screen failed">
      <View style={{ flex: 1, backgroundColor: '#ffffff', paddingTop: 56 }}>
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ flex: 1, fontWeight: '700', fontSize: 22, color: '#2e3a46' }}>Trash</Text>
        <Pressable
          onPress={onEmptyAllTrash}
          accessibilityRole="button"
          accessibilityLabel="Empty all trash"
          style={{ borderWidth: 1, borderColor: '#ea1100', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}
        >
          <Text style={{ color: '#ea1100', fontWeight: '700' }}>Empty All Trash</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 14, marginHorizontal: 16, backgroundColor: '#f1f3f5', borderRadius: 12, padding: 4, flexDirection: 'row' }}>
        <Pressable
          onPress={() => setActiveSegment('trash')}
          accessibilityRole="button"
          accessibilityLabel="Show in-app trash"
          style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: activeSegment === 'trash' ? '#ffffff' : 'transparent' }}
        >
          <Text style={{ textAlign: 'center', color: '#2e3a46', fontWeight: '600' }}>In-App Trash</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveSegment('info')}
          accessibilityRole="button"
          accessibilityLabel="Show trash info"
          style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: activeSegment === 'info' ? '#ffffff' : 'transparent' }}
        >
          <Text style={{ textAlign: 'center', color: '#2e3a46', fontWeight: '600' }}>Info</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, marginTop: 10 }}>
        {activeSegment === 'trash' ? (
          sortedItems.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
              <Text style={{ fontSize: 28 }}>♻️</Text>
              <Text style={{ marginTop: 8, color: '#2e3a46', fontWeight: '700', fontSize: 18 }}>Trash is empty ♻️</Text>
              <Text style={{ color: '#2e3a46', textAlign: 'center', marginTop: 4 }}>
                Staged items will appear here before final deletion.
              </Text>
            </View>
          ) : (
            <TrashGrid
              items={sortedItems}
              refreshing={refreshing}
              onRefresh={onRefresh}
              resetSelectionKey={resetSelectionKey}
              onSelectionChange={setSelectedIds}
            />
          )
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
            <Text style={{ color: '#2e3a46', fontWeight: '700', fontSize: 16 }}>How Trash Works</Text>
            <Text style={{ color: '#2e3a46' }}>
              In-App Trash is a safety hold before deleting photos from your device library.
            </Text>
            <Text style={{ color: '#2e3a46' }}>
              After deletion from this app, photos may still appear in your OS "Recently Deleted" album until your device permanently clears them.
            </Text>
            <Text style={{ color: '#2e3a46' }}>
              Items are auto-deleted when their retention window expires.
            </Text>
          </ScrollView>
        )}
      </View>

      {activeSegment === 'trash' && sortedItems.length > 0 ? (
        <BulkActionBar selectedCount={selectedIds.length} onRestore={onRestoreSelected} onDeleteNow={onDeleteSelectedNow} />
      ) : null}
      </View>
    </ScreenErrorBoundary>
  );
}
