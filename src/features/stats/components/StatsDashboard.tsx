import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useStatsStore } from '@/stores/statsStore';
import { Card } from '@/ui/primitives/Card';
import { Text } from '@/ui/primitives/Text';
import { colors } from '@/ui/theme/colors';
import { bytesToHuman } from '@/utils/format';

// ── Component ─────────────────────────────────────────────────────────────────
export function StatsDashboard() {
  const totalFreedBytes = useStatsStore((s) => s.totalFreedBytes);
  const photosReviewed = useStatsStore((s) => s.photosReviewed);
  const favoritesCount = useStatsStore((s) => s.favoritesCount);
  const sessionsCompleted = useStatsStore((s) => s.sessionsCompleted);

  const stats = [
    {
      icon: 'cloud-download' as const,
      label: 'Storage freed',
      value: bytesToHuman(totalFreedBytes),
      valueColor: colors.blue100,
    },
    {
      icon: 'images' as const,
      label: 'Photos reviewed',
      value: String(photosReviewed),
      valueColor: colors.gray180,
    },
    {
      icon: 'heart' as const,
      label: 'Favorites',
      value: String(favoritesCount),
      valueColor: colors.gray180,
    },
    {
      icon: 'layers' as const,
      label: 'Sessions',
      value: String(sessionsCompleted),
      valueColor: colors.gray180,
    },
  ];

  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.cell}>
          <Card
            variant="outlined"
            padding={16}
            accessibilityLabel={`${stat.label}: ${stat.value}`}
          >
            <View style={styles.cardContent}>
              <Ionicons name={stat.icon} size={24} color={colors.gray100} />
              <Text variant="caption" color={colors.light.textSecondary} style={styles.cardLabel}>
                {stat.label}
              </Text>
              <Text variant="title" color={stat.valueColor}>
                {stat.value}
              </Text>
            </View>
          </Card>
        </View>
      ))}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    minWidth: '48%',
    flex: 1,
  },
  cardContent: {
    gap: 6,
  },
  cardLabel: {
    marginTop: 4,
  },
});
