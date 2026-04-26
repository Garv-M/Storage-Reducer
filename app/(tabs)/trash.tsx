// Trash management workspace for staged/confirmed deletions.
// Combines operational actions with explanatory copy to reduce destructive mistakes.

import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BulkActionBar } from '@/features/trash/components/BulkActionBar';
import { TrashGrid } from '@/features/trash/components/TrashGrid';
import { DeletionService } from '@/services/deletion/DeletionService';
import { runRetentionCheck } from '@/services/deletion/retentionScheduler';
import { bulkRestore } from '@/services/deletion/restore';
import { useTrashStore } from '@/stores/trashStore';
import { Button } from '@/ui/primitives/Button';
import { Card } from '@/ui/primitives/Card';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Sorts items by nearest expiry first so urgent decisions are surfaced at the top.
 */
const sortByExpiry = (a: { expiresAt: number }, b: { expiresAt: number }) =>
  a.expiresAt - b.expiresAt;

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Trash tab with segmented content (items vs. help text) and bulk actions.
 */
export default function TrashTabScreen() {
  const insets = useSafeAreaInsets();

  const confirmed = useTrashStore((state) => state.confirmed);
  const [activeSegment, setActiveSegment] = useState<'trash' | 'info'>('trash');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [resetSelectionKey, setResetSelectionKey] = useState(0);

  // Keep soonest-to-expire items visible first to support retention business rules.
  const sortedItems = useMemo(() => [...confirmed].sort(sortByExpiry), [confirmed]);

  /**
   * Pull-to-refresh hook to force retention checks and expire overdue items.
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await runRetentionCheck();
    setRefreshing(false);
  };

  /**
   * Restores selected photos and clears stale grid selection state.
   */
  const onRestoreSelected = () => {
    bulkRestore(selectedIds);
    setResetSelectionKey((prev) => prev + 1);
  };

  /**
   * Permanently deletes selected photos immediately.
   */
  const onDeleteSelectedNow = async () => {
    await DeletionService.executeDelete(selectedIds);
    setResetSelectionKey((prev) => prev + 1);
  };

  /**
   * Shows a destructive confirmation before emptying all trash.
   */
  const onEmptyAllTrash = () => {
    Alert.alert(
      'Empty All Trash?',
      'This will permanently delete all photos in your trash. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Empty Trash',
          style: 'destructive',
          onPress: async () => {
            await DeletionService.emptyTrash();
            setResetSelectionKey((prev) => prev + 1);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text variant="title" color={colors.gray180}>
          Trash
        </Text>
        <Button
          label="Empty All"
          variant="destructive"
          size="sm"
          onPress={onEmptyAllTrash}
          accessibilityLabel="Empty all trash — permanently delete all staged photos"
        />
      </View>

      {/* ── Segmented control ── */}
      <View style={styles.segmentWrap}>
        <Pressable
          onPress={() => setActiveSegment('trash')}
          accessibilityRole="tab"
          accessibilityLabel="In-App Trash tab"
          accessibilityState={{ selected: activeSegment === 'trash' }}
          style={[
            styles.segment,
            activeSegment === 'trash' ? styles.segmentActive : styles.segmentInactive,
          ]}
        >
          <Text
            variant="label"
            weight="semibold"
            color={activeSegment === 'trash' ? colors.white : colors.light.textSecondary}
          >
            In-App Trash
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveSegment('info')}
          accessibilityRole="tab"
          accessibilityLabel="Info tab"
          accessibilityState={{ selected: activeSegment === 'info' }}
          style={[
            styles.segment,
            activeSegment === 'info' ? styles.segmentActive : styles.segmentInactive,
          ]}
        >
          <Text
            variant="label"
            weight="semibold"
            color={activeSegment === 'info' ? colors.white : colors.light.textSecondary}
          >
            Info
          </Text>
        </Pressable>
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        {activeSegment === 'trash' ? (
          <TrashGrid
            items={sortedItems}
            refreshing={refreshing}
            onRefresh={onRefresh}
            resetSelectionKey={resetSelectionKey}
            onSelectionChange={setSelectedIds}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.infoPad}>
            <Card variant="filled" padding={16}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={22} color={colors.blue100} />
                <Text variant="heading" color={colors.gray180}>
                  How Trash Works
                </Text>
              </View>
              <View style={styles.infoBullets}>
                <Text variant="body" color={colors.light.textSecondary}>
                  In-App Trash is a safety hold before deleting photos from your device library.
                </Text>
                <Text variant="body" color={colors.light.textSecondary}>
                  After deletion from this app, photos may still appear in your OS "Recently
                  Deleted" album until your device permanently clears them.
                </Text>
                <Text variant="body" color={colors.light.textSecondary}>
                  Items are auto-deleted when their retention window expires.
                </Text>
              </View>
            </Card>
          </ScrollView>
        )}
      </View>

      {/* ── Bulk action bar ── */}
      {activeSegment === 'trash' ? (
        <BulkActionBar
          selectedCount={selectedIds.length}
          onRestore={onRestoreSelected}
          onDeleteNow={onDeleteSelectedNow}
        />
      ) : null}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segmentWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.gray10,
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.blue100,
  },
  segmentInactive: {
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  infoPad: {
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  infoBullets: {
    gap: 12,
  },
});
