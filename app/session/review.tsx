import { useState } from 'react';

import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { ReviewGrid } from '@/features/review/components/ReviewGrid';
import { useTrashStore } from '@/stores/trashStore';

export default function SessionReviewScreen() {
  const router = useRouter();
  const staged = useTrashStore((state) => state.getStagedList());
  const removeStaged = useTrashStore((state) => state.removeStaged);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 52 }}>
      <Text style={{ paddingHorizontal: 16, fontWeight: '700', fontSize: 20, color: '#2e3a46' }}>Review Staged Items</Text>
      <Text style={{ paddingHorizontal: 16, marginTop: 6, marginBottom: 10, color: '#2e3a46' }}>
        Select the photos you want to keep staged for cleanup.
      </Text>

      <View style={{ flex: 1 }}>
        <ReviewGrid onSelectionChange={setSelectedIds} />
      </View>

      <Pressable
        onPress={() => {
          const selectedSet = new Set(selectedIds);
          staged
            .filter((item) => !selectedSet.has(item.assetId))
            .forEach((item) => {
              removeStaged(item.assetId);
            });

          router.push('/session/confirm');
        }}
        style={{ margin: 16, backgroundColor: '#0053e2', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>{`Continue (${selectedIds.length})`}</Text>
      </Pressable>
    </View>
  );
}
