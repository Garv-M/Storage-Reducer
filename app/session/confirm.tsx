import { useMemo } from 'react';

import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { ConfirmModal } from '@/features/review/components/ConfirmModal';
import { useTrashStore } from '@/stores/trashStore';

export default function SessionConfirmScreen() {
  const router = useRouter();
  const staged = useTrashStore((state) => state.getStagedList());

  const totalBytes = useMemo(() => staged.reduce((sum, item) => sum + item.bytes, 0), [staged]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ConfirmModal
        visible
        count={staged.length}
        totalBytes={totalBytes}
        onCancel={() => router.back()}
        onConfirm={() => router.replace('/(tabs)/home')}
      />
    </View>
  );
}
