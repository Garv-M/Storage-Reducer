// SelectableThumb renders one staged photo tile in review mode.
// It surfaces deletion-risk metadata (shared/cloud/size) so users can make
// safer choices before confirming cleanup.

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import type { StagedTrashItem } from '@/stores/trashStore';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';
import { bytesToHuman } from '@/utils/format';

// ── Types ─────────────────────────────────────────────────────────────────────
interface SelectableThumbProps {
  item: StagedTrashItem;
  selected: boolean;
  onToggle: (assetId: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Tile used by ReviewGrid to toggle staged items in/out of confirmation.
 *
 * Safety rule: shared-library assets are shown but disabled to prevent accidental
 * destructive actions against media that may be referenced by others.
 */
export function SelectableThumb({ item, selected, onToggle }: SelectableThumbProps) {
  // First album ID is treated as the primary source; the remainder is displayed
  // as contextual overlap to explain potential cross-album impact.
  const relatedAlbums = item.albumIds.slice(1);

  return (
    <Pressable
      disabled={item.isShared}
      onPress={() => onToggle(item.assetId)}
      accessibilityRole="checkbox"
      accessibilityLabel={`Photo, ${bytesToHuman(item.bytes)}${item.isCloudOnly ? ', iCloud' : ''}${item.isShared ? ', shared — cannot delete' : ''}`}
      accessibilityState={{ checked: selected, disabled: item.isShared }}
      // Dim disabled shared items so they remain visible context, not hidden state.
      style={[styles.cell, { opacity: item.isShared ? 0.75 : 1 }]}
    >
      <View style={[styles.thumb, selected && styles.thumbSelected]}>
        <Image source={{ uri: item.uri }} style={styles.image} contentFit="cover" recyclingKey={item.assetId} />

        {/* Always show checkbox location so hit target/scan pattern stays stable. */}
        <View style={styles.checkWrap}>
          <Ionicons
            name={selected ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={selected ? colors.blue100 : colors.gray100}
          />
        </View>

        {/* Cloud badge clarifies this delete affects remote iCloud copy too. */}
        {item.isCloudOnly ? (
          <View style={styles.icloudBadge}>
            <Text variant="label" color={colors.blue100}>iCloud</Text>
          </View>
        ) : null}

        {/* Shared badge overrides cloud badge placement to prioritize protection. */}
        {item.isShared ? (
          <View style={styles.sharedBadge}>
            <Text variant="label" color={colors.white}>Shared</Text>
          </View>
        ) : null}

        {/* Bottom scrim preserves text contrast across bright/dark thumbnails. */}
        <View style={styles.sizeBar}>
          <Text variant="label" color={colors.white}>{bytesToHuman(item.bytes)}</Text>
          {relatedAlbums.length > 0 ? (
            <Text variant="label" color={colors.white} numberOfLines={1}>
              {`+${relatedAlbums.length} album${relatedAlbums.length > 1 ? 's' : ''}`}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // 3-column layout: each cell consumes one third plus a small gutter.
  cell: { flex: 1 / 3, padding: 2 },
  thumb: { borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  // Border highlight is used instead of scaling to avoid reflow/jitter in dense grids.
  thumbSelected: { borderColor: colors.blue100 },
  image: { width: '100%', aspectRatio: 1 },
  checkWrap: {
    position: 'absolute', top: 6, right: 6, width: 24, height: 24,
    borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
  },
  icloudBadge: {
    position: 'absolute', top: 6, left: 6, backgroundColor: colors.white,
    borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: colors.blue100,
  },
  sharedBadge: {
    position: 'absolute', top: 6, left: 6, backgroundColor: colors.spark100,
    borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3,
  },
  sizeBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(27,36,45,0.55)', paddingHorizontal: 6, paddingVertical: 4, gap: 1,
  },
});