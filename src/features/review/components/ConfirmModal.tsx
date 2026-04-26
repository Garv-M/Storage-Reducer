import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/ui/primitives/Button';
import { Card } from '@/ui/primitives/Card';
import { Modal } from '@/ui/primitives/Modal';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';
import { bytesToHuman } from '@/utils/format';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ConfirmModalProps {
  visible: boolean;
  count: number;
  totalBytes: number;
  hasCloudOnlyItems?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ConfirmModal({
  visible,
  count,
  totalBytes,
  hasCloudOnlyItems,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onCancel}
      dismissOnBackdrop={false}
    >
      {/* ── Warning icon ── */}
      <View style={styles.iconRow}>
        <Ionicons name="warning" size={56} color={colors.spark100} />
      </View>

      {/* ── Title & summary ── */}
      <Text variant="title" style={styles.heading}>
        Confirm Cleanup
      </Text>
      <Text variant="body" color={colors.light.textSecondary} style={styles.summary}>
        {`${count} item${count !== 1 ? 's' : ''} staged for deletion`}
      </Text>
      <Text variant="body" color={colors.light.textSecondary} style={styles.size}>
        {`${bytesToHuman(totalBytes)} will be reclaimed (estimated)`}
      </Text>

      {/* ── Cloud warning ── */}
      {hasCloudOnlyItems ? (
        <Card variant="filled" padding={12} style={styles.cloudCard}>
          <View style={styles.cloudRow}>
            <Ionicons name="cloud-outline" size={18} color={colors.spark140} />
            <Text variant="caption" color={colors.spark140} style={styles.cloudText}>
              Deleting cloud photos also removes them from iCloud on all your devices.
            </Text>
          </View>
        </Card>
      ) : null}

      {/* ── Actions ── */}
      <View style={styles.actions}>
        <View style={styles.actionBtn}>
          <Button
            label="Cancel"
            variant="secondary"
            size="md"
            fullWidth
            onPress={onCancel}
            accessibilityLabel="Cancel deletion"
          />
        </View>
        <View style={styles.actionBtn}>
          <Button
            label="Confirm Delete"
            variant="destructive"
            size="md"
            fullWidth
            onPress={onConfirm}
            accessibilityLabel="Confirm deletion of staged photos"
          />
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  iconRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    textAlign: 'center',
    marginBottom: 8,
  },
  summary: {
    textAlign: 'center',
    marginBottom: 4,
  },
  size: {
    textAlign: 'center',
    marginBottom: 20,
  },
  cloudCard: {
    backgroundColor: colors.spark10,
    borderWidth: 1,
    borderColor: colors.spark140,
    marginBottom: 20,
  },
  cloudRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cloudText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
  },
});
