import { useEffect, useMemo, useState } from 'react';

import { FlashList } from '@shopify/flash-list';
import { Text, View } from 'react-native';

import { TrashItem } from '@/features/trash/components/TrashItem';
import type { ConfirmedTrashItem } from '@/stores/trashStore';

interface TrashGridProps {
  items: ConfirmedTrashItem[];
  refreshing: boolean;
  onRefresh: () => void;
  resetSelectionKey?: number;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function TrashGrid({ items, refreshing, onRefresh, resetSelectionKey, onSelectionChange }: TrashGridProps) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    setSelectionMode(false);
    setSelectedIds([]);
    onSelectionChange?.([]);
  }, [onSelectionChange, resetSelectionKey]);

  const toggle = (assetId: string) => {
    if (!selectionMode) return;

    const next = selectedSet.has(assetId)
      ? selectedIds.filter((id) => id !== assetId)
      : [...selectedIds, assetId];

    setSelectedIds(next);
    onSelectionChange?.(next);
  };

  const enterSelectionMode = (assetId: string) => {
    if (!selectionMode) {
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
        <Text style={{ color: '#2e3a46', textAlign: 'center' }}>Trash is empty. Staged cleanup items will appear here after confirmation.</Text>
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
