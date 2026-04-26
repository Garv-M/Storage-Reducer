import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/ui/primitives/Button';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';

// ── Types ─────────────────────────────────────────────────────────────────────
interface BulkActionBarProps {
  selectedCount: number;
  onRestore: () => void;
  onDeleteNow: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function BulkActionBar({ selectedCount, onRestore, onDeleteNow }: BulkActionBarProps) {
  const insets = useSafeAreaInsets();

  if (selectedCount <= 0) return null;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <Text variant="body" weight="semibold" color={colors.gray180} style={styles.count}>
        {`${selectedCount} selected`}
      </Text>
      <View style={styles.actions}>
        <Button
          label="Restore"
          variant="secondary"
          size="sm"
          onPress={onRestore}
          accessibilityLabel={`Restore ${selectedCount} selected photo${selectedCount !== 1 ? 's' : ''}`}
        />
        <Button
          label="Delete Now"
          variant="destructive"
          size="sm"
          onPress={onDeleteNow}
          accessibilityLabel={`Permanently delete ${selectedCount} selected photo${selectedCount !== 1 ? 's' : ''} now`}
        />
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    backgroundColor: colors.light.surfaceElevated,
    paddingTop: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  count: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
