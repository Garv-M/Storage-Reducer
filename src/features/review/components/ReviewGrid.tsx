import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { SelectableThumb } from '@/features/review/components/SelectableThumb';
import { useTrashStore } from '@/stores/trashStore';

interface ReviewGridProps {
  onSelectionChange?: (selectedIds: string[]) => void;
}

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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>No staged photos yet.</Text>
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
