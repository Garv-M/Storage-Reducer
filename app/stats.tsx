// Full-page stats screen surfaced from navigation shortcuts.
// Reuses the shared dashboard so summary logic lives in one component.

import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { StatsDashboard } from '@/features/stats/components/StatsDashboard';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';

/**
 * Detailed stats route.
 */
export default function StatsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text variant="title" color={colors.gray180} style={styles.title}>
          Your Stats
        </Text>
        <StatsDashboard />
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
  },
  title: {
    marginBottom: 24,
  },
});
