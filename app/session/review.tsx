import { useState } from 'react';

import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReviewGrid } from '@/features/review/components/ReviewGrid';
import { useTrashStore } from '@/stores/trashStore';
import { Button } from '@/ui/primitives/Button';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';

export default function SessionReviewScreen() {
  const router = useRouter();
  const staged       = useTrashStore((state) => state.getStagedList());
  const removeStaged = useTrashStore((state) => state.removeStaged);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleContinue = () => {
    const selectedSet = new Set(selectedIds);
    staged
      .filter((item) => !selectedSet.has(item.assetId))
      .forEach((item) => {
        removeStaged(item.assetId);
      });
    router.push('/session/confirm');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header} accessibilityRole="header">
        <Text variant="title">
          Review Staged
        </Text>
        <Text variant="body" color={colors.gray100} style={styles.subtitle}>
          Select photos to keep staged for cleanup. Deselect any you want to spare.
        </Text>
      </View>

      {/* Header / grid divider */}
      <View style={styles.divider} />

      {/* Photo grid */}
      <View style={styles.grid}>
        <ReviewGrid onSelectionChange={setSelectedIds} />
      </View>

      {/* Continue button */}
      <View style={styles.footer}>
        <Button
          label={`Continue (${selectedIds.length})`}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleContinue}
          disabled={selectedIds.length === 0}
          accessibilityLabel={`Continue with ${selectedIds.length} selected photo${selectedIds.length !== 1 ? 's' : ''}`}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 6,
  },
  subtitle: {
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginHorizontal: 16,
  },
  grid: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.light.background,
    borderTopWidth: 1,
    borderTopColor: colors.light.borderSubtle,
  },
});
