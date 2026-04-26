// ConfirmModal is the final safety checkpoint before staged items move to trash.
// It summarizes impact and highlights cloud-delete consequences to reduce
// accidental cross-device data loss.

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
/**
 * Confirmation dialog shown before staging transitions into confirmed trash.
 *
 * UX rule: backdrop dismissal is disabled so users must make an explicit choice
 * for destructive intent (cancel vs confirm).
 */
export function ConfirmModal({ visible, count, totalBytes, hasCloudOnlyItems, onCancel, onConfirm }: ConfirmModalProps) {
  return (
    <Modal visible={visible} onClose={onCancel} dismissOnBackdrop={false}>
      <View style={styles.iconRow}>
        <Ionicons name="warning" size={56} color={colors.spark100} />
      </View>
      <Text variant="title" style={styles.heading}>Confirm Cleanup</Text>
      <Text variant="body" color={colors.light.textSecondary} style={styles.summary}>
        {`${count} item${count !== 1 ? 's' : ''} staged for deletion`}
      </Text>
      <Text variant="body" color={colors.light.textSecondary} style={styles.size}>
        {`${bytesToHuman(totalBytes)} will be reclaimed (estimated)`}
      </Text>

      {hasCloudOnlyItems ? (
        // Extra warning only when relevant to keep default path lightweight,
        // but unmistakable when deletion propagates to iCloud.
        <Card variant="filled" padding={12} style={styles.cloudCard}>
          <View style={styles.cloudRow}>
            <Ionicons name="cloud-outline" size={18} color={colors.spark140} />
            <Text variant="caption" color={colors.spark140} style={styles.cloudText}>
              Deleting cloud photos also removes them from iCloud on all your devices.
            </Text>
          </View>
        </Card>
      ) : null}

      <View style={styles.actions}>
        <View style={styles.actionBtn}>
          <Button label="Cancel" variant="secondary" size="md" fullWidth onPress={onCancel} accessibilityLabel="Cancel deletion" />
        </View>
        <View style={styles.actionBtn}>
          <Button label="Confirm Delete" variant="destructive" size="md" fullWidth onPress={onConfirm} accessibilityLabel="Confirm deletion of staged photos" />
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  iconRow: { alignItems: 'center', marginBottom: 16 },
  heading: { textAlign: 'center', marginBottom: 8 },
  summary: { textAlign: 'center', marginBottom: 4 },
  size: { textAlign: 'center', marginBottom: 20 },
  cloudCard: { backgroundColor: colors.spark10, borderWidth: 1, borderColor: colors.spark140, marginBottom: 20 },
  cloudRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cloudText: { flex: 1 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  actionBtn: { flex: 1 },
});