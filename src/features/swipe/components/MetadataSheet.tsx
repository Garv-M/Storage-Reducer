import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { BottomSheetModal } from '@/ui/primitives/BottomSheetModal';
import { Button } from '@/ui/primitives/Button';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';
import { bytesToHuman, dateFmt } from '@/utils/format';

interface MetadataSheetProps {
  visible: boolean;
  onClose: () => void;
  metadata: {
    filename: string;
    createdAt: number;
    bytes: number;
    albums: string[];
    location?: string;
  } | null;
}

interface MetadataRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  isLast?: boolean;
}

function MetadataRow({ icon, label, value, isLast = false }: MetadataRowProps) {
  return (
    <>
      <View style={styles.row} accessibilityRole="text" accessibilityLabel={`${label}: ${value}`}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={18} color={colors.gray100} />
        </View>
        <View style={styles.rowContent}>
          <Text variant="caption" color={colors.gray100}>{label}</Text>
          <Text variant="body" color={colors.light.text} numberOfLines={2}>{value}</Text>
        </View>
      </View>
      {!isLast && <View style={styles.divider} />}
    </>
  );
}

export function MetadataSheet({ visible, onClose, metadata }: MetadataSheetProps) {
  const filename  = metadata?.filename ?? '—';
  const date      = metadata ? dateFmt(metadata.createdAt) : '—';
  const size      = metadata ? bytesToHuman(metadata.bytes) : '—';
  const albums    = metadata?.albums.length ? metadata.albums.join(', ') : 'None';
  const location  = metadata?.location ?? 'Unknown';

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      snapPoints={['55%', '80%']}
    >
      <View style={styles.container}>
        {/* Filename heading */}
        <Text
          variant="heading"
          numberOfLines={2}
          style={styles.filename}
          accessibilityLabel={`Photo filename: ${filename}`}
        >
          {filename}
        </Text>

        <View style={styles.divider} />

        {/* Metadata rows */}
        <MetadataRow icon="calendar-outline" label="Date taken" value={date} />
        <MetadataRow icon="document-outline"  label="File size"  value={size} />
        <MetadataRow icon="folder-outline"    label="Albums"     value={albums} />
        <MetadataRow icon="location-outline"  label="Location"   value={location} isLast />

        {/* Close button */}
        <View style={styles.closeWrap}>
          <Button
            label="Close"
            variant="secondary"
            size="md"
            fullWidth
            onPress={onClose}
            accessibilityLabel="Close photo metadata sheet"
          />
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surfaceElevated,
  },
  filename: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  iconWrap: {
    width: 32,
    alignItems: 'center',
    paddingTop: 1,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.borderSubtle,
  },
  closeWrap: {
    marginTop: 24,
  },
});
