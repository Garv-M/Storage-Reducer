// Final confirmation step before executing staged deletions.
// Summarizes impact and delegates destructive action to DeletionService.

import { useMemo } from 'react';

import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ConfirmModal } from '@/features/review/components/ConfirmModal';
import { DeletionService } from '@/services/deletion/DeletionService';
import { useSessionStore } from '@/stores/sessionStore';
import { useTrashStore } from '@/stores/trashStore';
import { colors } from '@/ui/theme/colors';

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Confirmation route for staged deletions.
 */
export default function SessionConfirmScreen() {
  const router = useRouter();
  const staged = useTrashStore((state) => state.getStagedList());
  const activeSessionId = useSessionStore((state) => state.activeSessionId);

  const hasCloudOnlyItems = useMemo(() => staged.some((item) => item.isCloudOnly), [staged]);
  const totalBytes = useMemo(() => staged.reduce((sum, item) => sum + item.bytes, 0), [staged]);

  return (
    // Themed backdrop ensures modal dim color matches design tokens during transition.
    <View style={styles.root}>
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
          // Replace prevents navigating back into a now-stale confirm state.
          router.replace('/(tabs)/home');
        }}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.light.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
