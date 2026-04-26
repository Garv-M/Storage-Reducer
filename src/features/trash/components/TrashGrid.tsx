// TrashGrid shows confirmed-trash items and manages multi-select interactions.
// Selection is intentionally opt-in via long press to prevent accidental bulk
// actions while users are browsing expiry state.

import { useEffect, useMemo, useState } from 'react';

import { FlashList } from '@shopify/flash-list';
import { Text, View } from 'react-native';

import { TrashItem } from '@/features/trash/components/TrashItem';
import type { ConfirmedTrashItem } from '@/stores/trashStore';

// ── Types ─────────────────────────────────────────────────────────────────────
interface TrashGridProps {
  items: ConfirmedTrashItem[];
  refreshing: boolean;
  onRefresh: () => void;
  resetSelectionKey?: number;
  onSelectionChange?: (selectedIds: string[]) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Renders confirmed trash in a performant 3-column grid with pull-to-refresh.
 *
 * Interaction model:
 * - Tap does nothing until selection mode is active.
 * - Long press enters selection mode and seeds first selected item.
 */
export function TrashGrid({ items, refreshing, onRefresh, resetSelectionKey, onSelectionChange }: TrashGridProps) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    // Parent-driven key lets screens force-clear stale selection after restore,
    // delete-now, tab switches, or retention updates.
    setSelectionMode(false);
    setSelectedIds([]);
    onSelectionChange?.([]);
  }, [onSelectionChange, resetSelectionKey]);

  const toggle = (assetId: string) => {
    // Guard prevents incidental taps from selecting items during passive browsing.
    if (!selectionMode) return;

    const next = selectedSet.has(assetId)
      ? selectedIds.filter((id) => id !== assetId)
      : [...selectedIds, assetId];

    setSelectedIds(next);
    onSelectionChange?.(next);
  };

  const enterSelectionMode = (assetId: string) => {
    if (!selectionMode) {
      // First long-press both activates mode and selects the pressed asset,
      // matching native gallery bulk-selection behavior.
      setSelectionMode(true);
      setSelectedIds([assetId]);
      onSelectionChange?.([assetId]);
      return;
    }

    toggle(assetId);
  };

  if (!items.length) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Text style={{ color: '#2e3a46', textAlign: 'center' }}>
          Trash is empty. Staged cleanup items will appear here after confirmation.
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      data={items}
      numColumns={3}
      keyExtractor={(item) => item.assetId}
      refreshing={refreshing}
      onRefresh={onRefresh}
      // Force visible cells to re-evaluate selection state as IDs change.
      extraData={selectedIds}
      renderItem={({ item }) => (
        <TrashItem
          item={item}
          selected={selectedSet.has(item.assetId)}
          selectionMode={selectionMode}
          onPress={toggle}
          onLongPress={enterSelectionMode}
        />
      )}
    />
  );
}