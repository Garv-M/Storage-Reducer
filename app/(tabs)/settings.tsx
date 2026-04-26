import { Ionicons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { RETENTION_OPTIONS } from '@/constants/retention';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTrashStore } from '@/stores/trashStore';
import { Button } from '@/ui/primitives/Button';
import { Card } from '@/ui/primitives/Card';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';

// ── Animated pill for retention selection ─────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function RetentionPill({
  days,
  selected,
  onPress,
}: {
  days: number;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 400 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
      accessibilityRole="radio"
      accessibilityLabel={`${days} days retention`}
      accessibilityState={{ selected }}
      style={[
        styles.retentionPill,
        selected ? styles.retentionPillActive : styles.retentionPillInactive,
        animatedStyle,
      ]}
    >
      <Text
        variant="label"
        weight="semibold"
        color={selected ? colors.white : colors.gray180}
      >
        {`${days}d`}
      </Text>
    </AnimatedPressable>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SettingsTabScreen() {
  const retentionDays = useSettingsStore((state) => state.retentionDays);
  const setRetentionDays = useSettingsStore((state) => state.setRetentionDays);
  const skipCloudOnly = useSettingsStore((state) => state.skipCloudOnly);
  const setSkipCloudOnly = useSettingsStore((state) => state.setSkipCloudOnly);

  const failedDeletions = useTrashStore((state) => state.failedDeletions);
  const removeFromFailed = useTrashStore((state) => state.removeFromFailed);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="title" color={colors.gray180} style={styles.pageTitle}>
          Settings
        </Text>

        {/* ── Retention section ── */}
        <View style={styles.section}>
          <Text variant="heading" color={colors.gray160} style={styles.sectionTitle}>
            Trash Retention
          </Text>
          <Card variant="outlined" padding={16}>
            <Text variant="body" color={colors.light.textSecondary} style={styles.retentionHint}>
              How long photos stay in your in-app trash before auto-deletion.
            </Text>
            <View style={styles.retentionRow}>
              {RETENTION_OPTIONS.map((days) => (
                <RetentionPill
                  key={days}
                  days={days}
                  selected={retentionDays === days}
                  onPress={() => setRetentionDays(days)}
                />
              ))}
            </View>
          </Card>
        </View>

        {/* ── Review options section ── */}
        <View style={styles.section}>
          <Text variant="heading" color={colors.gray160} style={styles.sectionTitle}>
            Review Options
          </Text>
          <Card variant="outlined" padding={16}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleIconWrap}>
                <Ionicons name="cloud-offline-outline" size={20} color={colors.gray100} />
              </View>
              <View style={styles.toggleLabel}>
                <Text variant="body" weight="semibold" color={colors.gray180}>
                  Skip cloud-only photos
                </Text>
                <Text variant="caption" color={colors.light.textSecondary}>
                  Hide iCloud-only items in review
                </Text>
              </View>
              <Switch
                value={skipCloudOnly}
                onValueChange={setSkipCloudOnly}
                trackColor={{ false: colors.gray50, true: colors.blue100 }}
                thumbColor={colors.white}
                accessibilityLabel="Skip cloud-only photos toggle"
                accessibilityRole="switch"
                accessibilityState={{ checked: skipCloudOnly }}
              />
            </View>
          </Card>
        </View>

        {/* ── Failed deletions section ── */}
        {failedDeletions.length > 0 ? (
          <View style={styles.section}>
            <Text variant="heading" color={colors.gray160} style={styles.sectionTitle}>
              Diagnostics
            </Text>
            <Card variant="outlined" padding={16} style={styles.failedCard}>
              <View style={styles.failedHeader}>
                <Ionicons name="alert-circle" size={20} color={colors.red100} />
                <Text variant="body" weight="semibold" color={colors.red100}>
                  Failed Deletions
                </Text>
              </View>
              <Text variant="caption" color={colors.light.textSecondary} style={styles.failedDesc}>
                {`${failedDeletions.length} photo${failedDeletions.length !== 1 ? 's' : ''} could not be deleted.`}
              </Text>
              <Button
                label="Clear list"
                variant="ghost"
                size="sm"
                onPress={() => removeFromFailed(failedDeletions)}
                accessibilityLabel="Clear failed deletions list"
              />
            </Card>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  scroll: {
    padding: 16,
    gap: 0,
  },
  pageTitle: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  retentionHint: {
    marginBottom: 16,
  },
  retentionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  retentionPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  retentionPillActive: {
    backgroundColor: colors.blue100,
  },
  retentionPillInactive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray50,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleLabel: {
    flex: 1,
    gap: 2,
  },
  failedCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.red100,
    borderColor: colors.gray50,
  },
  failedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  failedDesc: {
    marginBottom: 12,
  },
});
