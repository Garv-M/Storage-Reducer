// Session progress header shown above the swipe stack.
// Summarizes throughput and reclaimed storage while handling top safe-area inset.

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressBar } from '@/ui/primitives/ProgressBar';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';
import { bytesToHuman } from '@/utils/format';

interface ProgressHeaderProps {
  reviewed: number;
  total: number;
  freedBytes: number;
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Compact progress + stats header for swipe sessions.
 */
export function ProgressHeader({ reviewed, total, freedBytes }: ProgressHeaderProps) {
  const insets = useSafeAreaInsets();
  const progress = total > 0 ? reviewed / total : 0;
  const displayTotal = Math.max(total, reviewed);

  return (
    <View
      style={[
        styles.container,
        // Own top inset here so parent screen can omit top edge and avoid double padding.
        { paddingTop: insets.top + 8 },
      ]}
      accessibilityRole="header"
    >
      <View style={styles.row}>
        <View style={styles.statGroup}>
          <Ionicons name="images-outline" size={16} color={colors.gray100} style={styles.icon} />
          <Text variant="label" color={colors.gray160}>
            {`${reviewed} of ${displayTotal}`}
          </Text>
        </View>

        {/* Gold emphasis draws attention to value gained, not just task completion. */}
        <View style={styles.statGroup}>
          <Ionicons name="cloud-download-outline" size={16} color={colors.spark140} style={styles.icon} />
          <Text variant="label" weight="bold" color={colors.spark140}>
            {bytesToHuman(freedBytes)}
          </Text>
          <Text variant="label" color={colors.gray100}>
            {' freed'}
          </Text>
        </View>
      </View>

      <View style={styles.barWrap}>
        <ProgressBar
          progress={progress}
          height={8}
          color={colors.blue100}
          trackColor={colors.gray50}
          animated
          accessibilityLabel={`${reviewed} of ${displayTotal} photos reviewed`}
        />
      </View>

      <View style={styles.divider} />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.light.background,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  barWrap: {
    marginBottom: 0,
  },
  divider: {
    marginTop: 12,
    height: 1,
    backgroundColor: colors.light.borderSubtle,
  },
});
