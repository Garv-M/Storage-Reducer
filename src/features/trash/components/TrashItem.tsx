// TrashItem renders a confirmed-trash thumbnail with retention urgency metadata.
// Expiry colors provide fast visual prioritization so near-expiry items can be
// restored before permanent deletion.

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ConfirmedTrashItem } from '@/stores/trashStore';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Converts absolute expiry time into whole-day countdown shown in the badge.
 * `Math.ceil` favors user safety by treating partial days as still available.
 */
const daysLeft = (expiresAt: number) =>
  Math.max(0, Math.ceil((expiresAt - Date.now()) / 86_400_000));

/**
 * Chooses badge colors based on retention urgency.
 * - 0–3 days: critical (red)
 * - 4–7 days: warning (spark)
 * - 8+ days: safe (green)
 */
function expiryColors(days: number): { bg: string; text: string } {
  if (days <= 3) return { bg: colors.red100, text: colors.white };
  if (days <= 7) return { bg: colors.spark100, text: colors.gray180 };
  return { bg: colors.green100, text: colors.white };
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface TrashItemProps {
  item: ConfirmedTrashItem;
  selected: boolean;
  selectionMode: boolean;
  onPress: (assetId: string) => void;
  onLongPress: (assetId: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Selectable trash tile used inside TrashGrid.
 *
 * In selection mode, border/check affordances are amplified to support rapid
 * multi-select operations for restore/delete-now actions.
 */
export function TrashItem({ item, selected, selectionMode, onPress, onLongPress }: TrashItemProps) {
  const days = daysLeft(item.expiresAt);
  const { bg: badgeBg, text: badgeText } = expiryColors(days);

  return (
    <Pressable
      onPress={() => onPress(item.assetId)}
      onLongPress={() => onLongPress(item.assetId)}
      accessibilityRole="checkbox"
      accessibilityLabel={`Trash item, expires in ${days} day${days !== 1 ? 's' : ''}${selected ? ', selected' : ''}`}
      accessibilityState={{ checked: selected }}
      style={styles.cell}
    >
      <View style={[
        styles.thumb,
        selectionMode
          ? { borderColor: selected ? colors.blue100 : colors.gray50, borderWidth: 2 }
          : { borderWidth: 1, borderColor: colors.gray50 },
      ]}>
        <Image source={{ uri: item.uri }} style={styles.image} contentFit="cover" recyclingKey={item.assetId} />

        {/* Badge stays visible in and out of selection mode to preserve urgency context. */}
        <View style={[styles.expiryBadge, { backgroundColor: badgeBg }]}>
          <Text variant="label" color={badgeText}>{`${days}d`}</Text>
        </View>
        {selectionMode ? (
          <View style={styles.checkWrap}>
            <Ionicons
              name={selected ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={selected ? colors.blue100 : colors.gray100}
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Mirrors review/trash grids for visual rhythm and predictable touch areas.
  cell: { flex: 1 / 3, padding: 2 },
  thumb: { borderRadius: 8, overflow: 'hidden' },
  image: { width: '100%', aspectRatio: 1 },
  expiryBadge: { position: 'absolute', top: 6, left: 6, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  checkWrap: {
    position: 'absolute', top: 6, right: 6, width: 24, height: 24,
    borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
  },
});