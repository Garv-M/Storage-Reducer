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
export function SelectableThumb({ item, selected, onToggle }: SelectableThumbProps) {
  const relatedAlbums = item.albumIds.slice(1);

  return (
    <Pressable
      disabled={item.isShared}
      onPress={() => onToggle(item.assetId)}
      accessibilityRole="checkbox"
      accessibilityLabel={`Photo, ${bytesToHuman(item.bytes)}${item.isCloudOnly ? ', iCloud' : ''}${item.isShared ? ', shared — cannot delete' : ''}`}
      accessibilityState={{ checked: selected, disabled: item.isShared }}
      style={[styles.cell, { opacity: item.isShared ? 0.75 : 1 }]}
    >
      <View style={[styles.thumb, selected && styles.thumbSelected]}>
        <Image
          source={{ uri: item.uri }}
          style={styles.image}
          contentFit="cover"
          recyclingKey={item.assetId}
        />

        {/* ── Selection checkbox ── */}
        <View style={styles.checkWrap}>
          <Ionicons
            name={selected ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={selected ? colors.blue100 : colors.gray100}
          />
        </View>

        {/* ── iCloud badge ── */}
        {item.isCloudOnly ? (
          <View style={styles.icloudBadge}>
            <Text variant="label" color={colors.blue100}>
              iCloud
            </Text>
          </View>
        ) : null}

        {/* ── Shared badge ── */}
        {item.isShared ? (
          <View style={styles.sharedBadge}>
            <Text variant="label" color={colors.white}>
              Shared
            </Text>
          </View>
        ) : null}

        {/* ── Size bar ── */}
        <View style={styles.sizeBar}>
          <Text variant="label" color={colors.white}>
            {bytesToHuman(item.bytes)}
          </Text>
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
  cell: {
    flex: 1 / 3,
    padding: 2,
  },
  thumb: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbSelected: {
    borderColor: colors.blue100,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  checkWrap: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icloudBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.white,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.blue100,
  },
  sharedBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.spark100,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sizeBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(27,36,45,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 1,
  },
});
