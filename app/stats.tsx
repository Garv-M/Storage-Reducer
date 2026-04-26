import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { StatsDashboard } from '@/features/stats/components/StatsDashboard';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';

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
