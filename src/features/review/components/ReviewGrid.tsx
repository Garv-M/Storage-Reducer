import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SelectableThumb } from '@/features/review/components/SelectableThumb';
import { useTrashStore } from '@/stores/trashStore';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ReviewGridProps {
  onSelectionChange?: (selectedIds: string[]) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ReviewGrid({ onSelectionChange }: ReviewGridProps) {
  const staged = useTrashStore((state) => state.getStagedList());
  const [selectedIds, setSelectedIds] = useState<string[]>(
    staged.filter((item) => !item.isShared).map((item) => item.assetId)
  );

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    const allIds = staged.filter((item) => !item.isShared).map((item) => item.assetId);
    setSelectedIds(allIds);
    onSelectionChange?.(allIds);
  }, [onSelectionChange, staged]);

  const toggle = (assetId: string) => {
    const next = selectedSet.has(assetId)
      ? selectedIds.filter((id) => id !== assetId)
      : [...selectedIds, assetId];

    setSelectedIds(next);
    onSelectionChange?.(next);
  };

  if (!staged.length) {
    return (
      <View style={styles.empty}>
        <Ionicons name="images-outline" size={56} color={colors.gray100} />
        <Text variant="body" color={colors.light.textSecondary} style={styles.emptyText}>
          No staged photos yet. Swipe left on photos you want to delete.
        </Text>
      </View>
    );
  }

  return (
    <FlashList
      data={staged}
      numColumns={3}
      keyExtractor={(item) => item.assetId}
      renderItem={({ item }) => (
        <SelectableThumb item={item} selected={selectedSet.has(item.assetId)} onToggle={toggle} />
      )}

    />
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
  },
});
