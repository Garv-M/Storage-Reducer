import { useMemo } from 'react';

import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { ConfirmModal } from '@/features/review/components/ConfirmModal';
import { DeletionService } from '@/services/deletion/DeletionService';
import { useSessionStore } from '@/stores/sessionStore';
import { useTrashStore } from '@/stores/trashStore';

export default function SessionConfirmScreen() {
  const router = useRouter();
  const staged = useTrashStore((state) => state.getStagedList());
  const activeSessionId = useSessionStore((state) => state.activeSessionId);

  const hasCloudOnlyItems = useMemo(() => staged.some((item) => item.isCloudOnly), [staged]);

  const totalBytes = useMemo(() => staged.reduce((sum, item) => sum + item.bytes, 0), [staged]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ConfirmModal
        visible
        count={staged.length}
        totalBytes={totalBytes}
        hasCloudOnlyItems={hasCloudOnlyItems}
        onCancel={() => router.back()}
        onConfirm={() => {
          if (activeSessionId) {
            DeletionService.confirmStaged(activeSessionId);
          }
          router.replace('/(tabs)/home');
        }}
      />
    </View>
  );
}
